import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMessageSchema = z.object({
  content: z.string().min(1).max(10000),
})

// PATCH /api/communications/messages/[messageId] - Edit a message
export async function PATCH(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = params
    const body = await request.json()
    const validatedData = updateMessageSchema.parse(body)

    // Get the message and verify ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        thread: {
          include: {
            participants: {
              where: {
                userId: session.user.id,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Verify user has access to the thread
    if (message.thread.participants.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Only message sender can edit their own messages
    if (message.senderId !== session.user.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Don't allow editing messages older than 24 hours
    const hoursSinceCreated = (Date.now() - message.createdAt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceCreated > 24) {
      return NextResponse.json(
        { error: 'Messages can only be edited within 24 hours of creation' },
        { status: 400 }
      )
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: validatedData.content,
        isEdited: true,
        editedAt: new Date(),
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

    // Create audit log entry
    await prisma.communicationAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'message_edited',
        entityType: 'message',
        entityId: messageId,
        details: {
          threadId: message.threadId,
          originalContent: message.content,
          newContent: validatedData.content,
        },
      },
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Failed to update message:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

// DELETE /api/communications/messages/[messageId] - Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = params

    // Get the message and verify ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        thread: {
          include: {
            participants: {
              where: {
                userId: session.user.id,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Verify user has access to the thread
    if (message.thread.participants.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Only message sender or thread admin can delete messages
    const participant = message.thread.participants[0]
    if (message.senderId !== session.user.id && !participant.isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Soft delete - mark as deleted but keep record for audit
    await prisma.message.update({
      where: { id: messageId },
      data: {
        status: 'DELETED',
        content: '[This message has been deleted]',
      },
    })

    // Create audit log entry
    await prisma.communicationAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'message_deleted',
        entityType: 'message',
        entityId: messageId,
        details: {
          threadId: message.threadId,
          originalContent: message.content,
          isAdminDelete: message.senderId !== session.user.id,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}

// GET /api/communications/messages/[messageId] - Get a specific message
export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = params

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            userType: true,
          },
        },
        thread: {
          include: {
            participants: {
              where: {
                userId: session.user.id,
                isActive: true,
              },
            },
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
        replies: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Verify user has access to the thread
    if (message.thread.participants.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Mark message as read if not already
    await prisma.messageReadReceipt.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId: session.user.id,
        },
      },
      update: {},
      create: {
        messageId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Failed to get message:', error)
    return NextResponse.json(
      { error: 'Failed to get message' },
      { status: 500 }
    )
  }
}