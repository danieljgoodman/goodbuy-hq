import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { CommunicationService } from '@/lib/communication-service'
import { sendNewInquiryNotification } from '@/lib/email'

const createInquirySchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  contactName: z.string().min(1, 'Name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().optional(),
})

// GET - List inquiries (for business owners)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}

    if (businessId) {
      // Verify user owns the business
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { ownerId: true },
      })

      if (!business || business.ownerId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      where.businessId = businessId
    } else {
      // Get inquiries for all user's businesses
      where.business = {
        ownerId: session.user.id,
      }
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          business: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              userType: true,
            },
          },
        },
      }),
      prisma.inquiry.count({ where }),
    ])

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get inquiries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}

// POST - Create new inquiry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = createInquirySchema.parse(body)

    // Verify business exists and is active
    const business = await prisma.business.findUnique({
      where: {
        id: validatedData.businessId,
        status: 'ACTIVE',
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            communicationPreferences: true,
          },
        },
      },
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or not available' },
        { status: 404 }
      )
    }

    // Prevent owners from inquiring about their own business
    if (session?.user?.id === business.owner.id) {
      return NextResponse.json(
        { error: 'You cannot inquire about your own business' },
        { status: 400 }
      )
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        businessId: validatedData.businessId,
        subject: validatedData.subject,
        message: validatedData.message,
        contactName: validatedData.contactName,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        userId: session?.user?.id || null,
      },
      include: {
        business: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    // Update inquiry count
    await prisma.business.update({
      where: { id: validatedData.businessId },
      data: {
        inquiryCount: {
          increment: 1,
        },
      },
    })

    // Create communication thread if user is authenticated
    let threadId = null
    if (session?.user?.id) {
      const thread = await prisma.communicationThread.create({
        data: {
          subject: `Re: ${business.title}`,
          businessId: business.id,
          participants: {
            create: [
              {
                userId: session.user.id,
                isAdmin: false,
              },
              {
                userId: business.owner.id,
                isAdmin: true,
              },
            ],
          },
          messages: {
            create: {
              senderId: session.user.id,
              content: `${validatedData.subject}\n\n${validatedData.message}`,
              messageType: 'inquiry',
            },
          },
        },
      })
      threadId = thread.id
    }

    // Send notifications
    try {
      // Create in-app notification
      await CommunicationService.createNotification({
        userId: business.owner.id,
        type: 'INQUIRY_RECEIVED',
        title: `New inquiry for ${business.title}`,
        message: `${validatedData.contactName} is interested in your business listing`,
        actionUrl: `/dashboard/inquiries?id=${inquiry.id}`,
        relatedId: inquiry.id,
        relatedType: 'inquiry',
        data: {
          businessId: business.id,
          businessTitle: business.title,
          inquirerName: validatedData.contactName,
          inquirerEmail: validatedData.contactEmail,
          threadId,
        },
      })

      // Send email notification if enabled
      if (
        business.owner.communicationPreferences?.emailNewMessages &&
        business.owner.email
      ) {
        await sendNewInquiryNotification(
          business.owner.email,
          business.owner.name || business.owner.email,
          validatedData.contactName,
          validatedData.contactEmail,
          business.title,
          validatedData.subject,
          validatedData.message,
          inquiry.id
        )
      }
    } catch (notificationError) {
      console.error('Failed to send inquiry notification:', notificationError)
      // Don't fail the inquiry creation if notification fails
    }

    return NextResponse.json(
      {
        ...inquiry,
        threadId,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create inquiry error:', error)
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    )
  }
}
