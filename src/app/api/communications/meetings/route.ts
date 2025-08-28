import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createMeetingSchema = z.object({
  threadId: z.string().cuid().optional(),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  timezone: z.string().default('UTC'),
  location: z.string().max(500).optional(),
  meetingType: z.enum(['virtual', 'physical', 'phone']).default('virtual'),
  maxAttendees: z.number().int().positive().optional(),
  requiresConfirmation: z.boolean().default(true),
  attendeeIds: z.array(z.string().cuid()).min(1),
  isRecurring: z.boolean().default(false),
  recurringRule: z.record(z.unknown()).optional(),
})

const updateMeetingSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  location: z.string().max(500).optional(),
  status: z
    .enum(['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED'])
    .optional(),
})

// GET /api/communications/meetings - Get user's meetings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')
    const status = searchParams.get('status')
    const from = searchParams.get('from') // Date filter
    const to = searchParams.get('to') // Date filter
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where conditions
    const whereConditions: any = {
      OR: [
        { organizerId: session.user.id },
        {
          attendees: {
            some: {
              userId: session.user.id,
            },
          },
        },
      ],
    }

    if (threadId) {
      whereConditions.threadId = threadId
    }

    if (status) {
      whereConditions.status = status
    }

    if (from || to) {
      whereConditions.scheduledStart = {}
      if (from) {
        whereConditions.scheduledStart.gte = new Date(from)
      }
      if (to) {
        whereConditions.scheduledStart.lte = new Date(to)
      }
    }

    const meetings = await prisma.meeting.findMany({
      where: whereConditions,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        thread: {
          select: {
            id: true,
            subject: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
      orderBy: { scheduledStart: 'asc' },
      take: limit,
      skip: offset,
    })

    // Add user's response status to each meeting
    const meetingsWithUserStatus = meetings.map(meeting => {
      const userAttendance = meeting.attendees.find(
        attendee => attendee.userId === session.user.id
      )

      return {
        ...meeting,
        userStatus:
          userAttendance?.status ||
          (meeting.organizerId === session.user.id
            ? 'organizer'
            : 'not_invited'),
        userNotes: userAttendance?.notes || null,
      }
    })

    return NextResponse.json(meetingsWithUserStatus)
  } catch (error) {
    console.error('Failed to get meetings:', error)
    return NextResponse.json(
      { error: 'Failed to get meetings' },
      { status: 500 }
    )
  }
}

// POST /api/communications/meetings - Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createMeetingSchema.parse(body)

    // Validate meeting times
    const startTime = new Date(validatedData.scheduledStart)
    const endTime = new Date(validatedData.scheduledEnd)

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'Meeting end time must be after start time' },
        { status: 400 }
      )
    }

    if (startTime <= new Date()) {
      return NextResponse.json(
        { error: 'Meeting start time must be in the future' },
        { status: 400 }
      )
    }

    // If threadId provided, verify user has access and meeting permissions
    if (validatedData.threadId) {
      const participant = await prisma.threadParticipant.findUnique({
        where: {
          threadId_userId: {
            threadId: validatedData.threadId,
            userId: session.user.id,
          },
        },
      })

      if (
        !participant ||
        !participant.isActive ||
        !participant.allowMeetingInvites
      ) {
        return NextResponse.json(
          { error: 'Thread not found or meeting invites not allowed' },
          { status: 403 }
        )
      }
    }

    // Verify all attendees exist and are active
    const attendees = await prisma.user.findMany({
      where: {
        id: { in: validatedData.attendeeIds },
        status: 'ACTIVE',
      },
    })

    if (attendees.length !== validatedData.attendeeIds.length) {
      return NextResponse.json(
        { error: 'One or more attendees not found or inactive' },
        { status: 400 }
      )
    }

    // Create meeting in a transaction
    const meeting = await prisma.$transaction(async tx => {
      // Create the meeting
      const newMeeting = await tx.meeting.create({
        data: {
          threadId: validatedData.threadId,
          organizerId: session.user.id,
          title: validatedData.title,
          description: validatedData.description,
          scheduledStart: startTime,
          scheduledEnd: endTime,
          timezone: validatedData.timezone,
          location: validatedData.location,
          meetingType: validatedData.meetingType,
          maxAttendees: validatedData.maxAttendees,
          requiresConfirmation: validatedData.requiresConfirmation,
          isRecurring: validatedData.isRecurring,
          recurringRule: validatedData.recurringRule,
        },
      })

      // Add attendees
      await tx.meetingAttendee.createMany({
        data: validatedData.attendeeIds.map(userId => ({
          meetingId: newMeeting.id,
          userId,
          status: validatedData.requiresConfirmation ? 'invited' : 'accepted',
        })),
      })

      // Create reminders for all attendees (24 hours and 1 hour before)
      const reminderTimes = [
        new Date(startTime.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
        new Date(startTime.getTime() - 60 * 60 * 1000), // 1 hour before
      ].filter(time => time > new Date()) // Only create future reminders

      const reminderData = []
      for (const userId of validatedData.attendeeIds) {
        for (const reminderTime of reminderTimes) {
          reminderData.push({
            meetingId: newMeeting.id,
            userId,
            reminderTime,
          })
        }
      }

      if (reminderData.length > 0) {
        await tx.meetingReminder.createMany({
          data: reminderData,
        })
      }

      // Create audit log entry
      await tx.communicationAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'meeting_scheduled',
          entityType: 'meeting',
          entityId: newMeeting.id,
          details: {
            title: validatedData.title,
            attendeeCount: validatedData.attendeeIds.length,
            threadId: validatedData.threadId,
            meetingType: validatedData.meetingType,
          },
        },
      })

      return newMeeting
    })

    // Fetch complete meeting data
    const completeMeeting = await prisma.meeting.findUnique({
      where: { id: meeting.id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        thread: {
          select: {
            id: true,
            subject: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(completeMeeting, { status: 201 })
  } catch (error) {
    console.error('Failed to create meeting:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    )
  }
}
