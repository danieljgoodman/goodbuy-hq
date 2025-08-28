import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createThreadSchema = z.object({
  subject: z.string().min(1).max(255).optional(),
  businessId: z.string().cuid().optional(),
  participantIds: z.array(z.string().cuid()).min(1),
  initialMessage: z.string().min(1).max(10000),
})

// GET /api/communications/threads - Get user's communication threads
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const threads = await prisma.communicationThread.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
            isActive: true,
          },
        },
        ...(businessId && { businessId }),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                userType: true,
              },
            },
          },
        },
        business: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Get unread message counts for each thread
    const threadsWithUnreadCounts = await Promise.all(
      threads.map(async (thread) => {
        const unreadCount = await prisma.message.count({
          where: {
            threadId: thread.id,
            NOT: { senderId: session.user.id },
            readReceipts: {
              none: {
                userId: session.user.id,
              },
            },
          },
        })

        return {
          ...thread,
          unreadCount,
        }
      })
    )

    return NextResponse.json(threadsWithUnreadCounts)
  } catch (error) {
    console.error('Failed to get threads:', error)
    return NextResponse.json(
      { error: 'Failed to get threads' },
      { status: 500 }
    )
  }
}

// POST /api/communications/threads - Create a new communication thread
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createThreadSchema.parse(body)

    // Verify all participants exist and are active users
    const participants = await prisma.user.findMany({
      where: {
        id: { in: validatedData.participantIds },
        status: 'ACTIVE',
      },
    })

    if (participants.length !== validatedData.participantIds.length) {
      return NextResponse.json(
        { error: 'One or more participants not found or inactive' },
        { status: 400 }
      )
    }

    // If businessId provided, verify it exists and user has access
    if (validatedData.businessId) {
      const business = await prisma.business.findUnique({
        where: { id: validatedData.businessId },
        include: { owner: true },
      })

      if (!business) {
        return NextResponse.json(
          { error: 'Business not found' },
          { status: 404 }
        )
      }
    }

    // Create the thread and initial message in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the communication thread
      const thread = await tx.communicationThread.create({
        data: {
          subject: validatedData.subject,
          businessId: validatedData.businessId,
        },
      })

      // Add participants
      const participantData = [
        ...validatedData.participantIds.map((userId) => ({
          threadId: thread.id,
          userId,
          isAdmin: userId === session.user.id,
        })),
      ]

      // Add current user if not already in participants
      if (!validatedData.participantIds.includes(session.user.id)) {
        participantData.push({
          threadId: thread.id,
          userId: session.user.id,
          isAdmin: true,
        })
      }

      await tx.threadParticipant.createMany({
        data: participantData,
      })

      // Create initial message
      const message = await tx.message.create({
        data: {
          threadId: thread.id,
          senderId: session.user.id,
          content: validatedData.initialMessage,
          status: 'SENT',
        },
      })

      // Update thread's lastMessageAt
      await tx.communicationThread.update({
        where: { id: thread.id },
        data: { lastMessageAt: message.createdAt },
      })

      // Create audit log entry
      await tx.communicationAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'thread_created',
          entityType: 'thread',
          entityId: thread.id,
          details: {
            subject: validatedData.subject,
            participantCount: participantData.length,
            businessId: validatedData.businessId,
          },
        },
      })

      return { thread, message }
    })

    // Fetch the complete thread with all relations
    const completeThread = await prisma.communicationThread.findUnique({
      where: { id: result.thread.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                userType: true,
              },
            },
          },
        },
        business: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(completeThread, { status: 201 })
  } catch (error) {
    console.error('Failed to create thread:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    )
  }
}