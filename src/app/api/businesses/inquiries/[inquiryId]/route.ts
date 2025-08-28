import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: {
    inquiryId: string
  }
}

// GET - Get single inquiry details
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.inquiryId },
      include: {
        business: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
          },
        },
      },
    })

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Check if user has access (business owner or inquirer)
    const hasAccess =
      inquiry.business.owner.id === session.user.id ||
      inquiry.user?.id === session.user.id

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(inquiry)
  } catch (error) {
    console.error('Get inquiry error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 }
    )
  }
}

// PATCH - Update inquiry (mark as read, archive, etc.)
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isRead, isArchived } = body

    // Verify inquiry exists and user owns the business
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.inquiryId },
      include: {
        business: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    if (inquiry.business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update inquiry
    const updateData: any = {}

    if (typeof isRead === 'boolean') {
      updateData.isRead = isRead
    }

    if (typeof isArchived === 'boolean') {
      updateData.isArchived = isArchived
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id: params.inquiryId },
      data: updateData,
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
            email: true,
            userType: true,
          },
        },
      },
    })

    return NextResponse.json(updatedInquiry)
  } catch (error) {
    console.error('Update inquiry error:', error)
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    )
  }
}

// DELETE - Delete inquiry (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify inquiry exists and user owns the business
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.inquiryId },
      include: {
        business: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    if (inquiry.business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete by archiving
    await prisma.inquiry.update({
      where: { id: params.inquiryId },
      data: {
        isArchived: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete inquiry error:', error)
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 }
    )
  }
}
