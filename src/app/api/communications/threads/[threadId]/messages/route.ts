import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  messageType: z
    .enum(['text', 'file', 'meeting_invite', 'system'])
    .default('text'),
  replyToId: z.string().cuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// GET /api/communications/threads/[threadId]/messages - Get messages in a thread
export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { threadId } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const before = searchParams.get('before') // Message ID for pagination

    // Verify user has access to this thread
    const participant = await prisma.threadParticipant.findUnique({
      where: {
        threadId_userId: {
          threadId,
          userId: session.user.id,
        },
      },
    })

    if (!participant || !participant.isActive) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    const messages = await prisma.message.findMany({
      where: {
        threadId,
        ...(before && {
          createdAt: {
            lt: (
              await prisma.message.findUnique({
                where: { id: before },
                select: { createdAt: true },
              })
            )?.createdAt,
          },
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            userType: true,
          },
        },
        attachments: true,
        readReceipts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Mark messages as read for the current user
    const unreadMessageIds = messages
      .filter(
        msg =>
          msg.senderId !== session.user.id &&
          !msg.readReceipts.some(receipt => receipt.userId === session.user.id)
      )
      .map(msg => msg.id)

    if (unreadMessageIds.length > 0) {
      await prisma.messageReadReceipt.createMany({
        data: unreadMessageIds.map(messageId => ({
          messageId,
          userId: session.user.id,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json(messages.reverse()) // Return in chronological order
  } catch (error) {
    console.error('Failed to get messages:', error)
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    )
  }
}

// POST /api/communications/threads/[threadId]/messages - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { threadId } = params
    const body = await request.json()
    const validatedData = createMessageSchema.parse(body)

    // Verify user has access to this thread
    const participant = await prisma.threadParticipant.findUnique({
      where: {
        threadId_userId: {
          threadId,
          userId: session.user.id,
        },
      },
    })

    if (!participant || !participant.isActive) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Check participant's direct message permissions
    if (
      !participant.allowDirectMessages &&
      validatedData.messageType === 'text'
    ) {
      return NextResponse.json(
        { error: 'Direct messages not allowed for this user' },
        { status: 403 }
      )
    }

    // If replying to a message, verify it exists and is in the same thread
    if (validatedData.replyToId) {
      const replyToMessage = await prisma.message.findUnique({
        where: { id: validatedData.replyToId },
      })

      if (!replyToMessage || replyToMessage.threadId !== threadId) {
        return NextResponse.json(
          { error: 'Reply target message not found' },
          { status: 400 }
        )
      }
    }

    // Create message and update thread in a transaction
    const result = await prisma.$transaction(async tx => {
      // Create the message
      const message = await tx.message.create({
        data: {
          threadId,
          senderId: session.user.id,
          content: validatedData.content,
          messageType: validatedData.messageType,
          replyToId: validatedData.replyToId,
          metadata: validatedData.metadata as any,
          status: 'SENT',
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
              userType: true,
            },
          },
          attachments: true,
          readReceipts: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          replyTo: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      // Update thread's lastMessageAt
      await tx.communicationThread.update({
        where: { id: threadId },
        data: { lastMessageAt: message.createdAt },
      })

      // Create audit log entry
      await tx.communicationAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'message_sent',
          entityType: 'message',
          entityId: message.id,
          details: {
            threadId,
            messageType: validatedData.messageType,
            isReply: !!validatedData.replyToId,
          },
        },
      })

      return message
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Failed to send message:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
