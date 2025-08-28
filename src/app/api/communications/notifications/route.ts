import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const markNotificationSchema = z.object({
  notificationIds: z.array(z.string().cuid()).min(1),
  status: z.enum(['READ', 'dismissed']),
})

// GET /api/communications/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as any
    const status = searchParams.get('status') as any
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereConditions: any = {
      userId: session.user.id,
    }

    if (type) {
      whereConditions.type = type
    }

    if (status) {
      whereConditions.status = status
    } else {
      // By default, don't include dismissed notifications
      whereConditions.status = {
        not: 'DISMISSED',
      }
    }

    const notifications = await prisma.notification.findMany({
      where: whereConditions,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    })

    // Get counts for different notification states
    const counts = await prisma.notification.groupBy({
      by: ['status'],
      where: {
        userId: session.user.id,
        status: {
          not: 'DISMISSED',
        },
      },
      _count: true,
    })

    const countsByStatus = counts.reduce(
      (acc, count) => {
        acc[count.status] = count._count
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      notifications,
      counts: {
        unread: countsByStatus.PENDING || 0,
        read: countsByStatus.READ || 0,
        total: (countsByStatus.PENDING || 0) + (countsByStatus.READ || 0),
      },
    })
  } catch (error) {
    console.error('Failed to get notifications:', error)
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    )
  }
}

// PATCH /api/communications/notifications - Mark notifications as read/dismissed
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = markNotificationSchema.parse(body)

    // Verify all notifications belong to the current user
    const notifications = await prisma.notification.findMany({
      where: {
        id: { in: validatedData.notificationIds },
        userId: session.user.id,
      },
    })

    if (notifications.length !== validatedData.notificationIds.length) {
      return NextResponse.json(
        { error: 'One or more notifications not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      status: validatedData.status.toUpperCase(),
    }

    if (validatedData.status === 'READ') {
      updateData.readAt = new Date()
    } else if (validatedData.status === 'dismissed') {
      updateData.dismissedAt = new Date()
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: validatedData.notificationIds },
        userId: session.user.id,
      },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update notifications:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

// DELETE /api/communications/notifications - Delete dismissed notifications (cleanup)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete notifications that have been dismissed for more than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const result = await prisma.notification.deleteMany({
      where: {
        userId: session.user.id,
        status: 'DISMISSED',
        dismissedAt: {
          lt: thirtyDaysAgo,
        },
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Failed to cleanup notifications:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup notifications' },
      { status: 500 }
    )
  }
}
