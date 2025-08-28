import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateThreadSchema = z.object({
  subject: z.string().min(1).max(255).optional(),
  isArchived: z.boolean().optional(),
})

// GET /api/communications/threads/[threadId] - Get a specific thread
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

    const thread = await prisma.communicationThread.findUnique({
      where: { id: threadId },
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
        _count: {
          select: {
            messages: true,
          },
        },
      },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    return NextResponse.json(thread)
  } catch (error) {
    console.error('Failed to get thread:', error)
    return NextResponse.json({ error: 'Failed to get thread' }, { status: 500 })
  }
}

// PATCH /api/communications/threads/[threadId] - Update a thread
export async function PATCH(
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
    const validatedData = updateThreadSchema.parse(body)

    // Verify user has admin access to this thread
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

    // Only admins can update thread properties (except archiving)
    if ('subject' in validatedData && !participant.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const updatedThread = await prisma.communicationThread.update({
      where: { id: threadId },
      data: validatedData,
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
      },
    })

    // Create audit log entry
    await prisma.communicationAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'thread_updated',
        entityType: 'thread',
        entityId: threadId,
        details: validatedData,
      },
    })

    return NextResponse.json(updatedThread)
  } catch (error) {
    console.error('Failed to update thread:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update thread' },
      { status: 500 }
    )
  }
}

// DELETE /api/communications/threads/[threadId] - Leave/delete a thread
export async function DELETE(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { threadId } = params

    // Get participant info
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

    // Check how many active participants remain
    const activeParticipants = await prisma.threadParticipant.count({
      where: {
        threadId,
        isActive: true,
      },
    })

    if (activeParticipants <= 1) {
      // Archive the thread instead of deleting if it's the last participant
      await prisma.communicationThread.update({
        where: { id: threadId },
        data: { isArchived: true },
      })
    }

    // Mark participant as inactive (soft delete)
    await prisma.threadParticipant.update({
      where: {
        threadId_userId: {
          threadId,
          userId: session.user.id,
        },
      },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    })

    // Create audit log entry
    await prisma.communicationAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'thread_left',
        entityType: 'thread',
        entityId: threadId,
        details: {
          remainingParticipants: activeParticipants - 1,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to leave thread:', error)
    return NextResponse.json(
      { error: 'Failed to leave thread' },
      { status: 500 }
    )
  }
}
