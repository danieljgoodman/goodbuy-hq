import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updatePreferencesSchema = z.object({
  emailNewMessages: z.boolean().optional(),
  emailMeetingInvites: z.boolean().optional(),
  emailDocumentShares: z.boolean().optional(),
  emailDigest: z.boolean().optional(),
  digestFrequency: z.enum(['daily', 'weekly', 'never']).optional(),
  showReadReceipts: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional(),
  allowDirectMessages: z.boolean().optional(),
  defaultMeetingLength: z.number().int().min(15).max(480).optional(), // 15 minutes to 8 hours
  workingHoursStart: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(), // HH:MM format
  workingHoursEnd: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  timezone: z.string().optional(),
  shareContactInfo: z.boolean().optional(),
  allowPublicProfile: z.boolean().optional(),
})

// GET /api/communications/preferences - Get user's communication preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let preferences = await prisma.communicationPreferences.findUnique({
      where: { userId: session.user.id },
    })

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.communicationPreferences.create({
        data: { userId: session.user.id },
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Failed to get preferences:', error)
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    )
  }
}

// PUT /api/communications/preferences - Update user's communication preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updatePreferencesSchema.parse(body)

    // Validate working hours if both are provided
    if (validatedData.workingHoursStart && validatedData.workingHoursEnd) {
      const start = validatedData.workingHoursStart.split(':').map(Number)
      const end = validatedData.workingHoursEnd.split(':').map(Number)
      const startMinutes = start[0] * 60 + start[1]
      const endMinutes = end[0] * 60 + end[1]

      if (startMinutes >= endMinutes) {
        return NextResponse.json(
          { error: 'Working hours end time must be after start time' },
          { status: 400 }
        )
      }
    }

    const preferences = await prisma.communicationPreferences.upsert({
      where: { userId: session.user.id },
      update: validatedData,
      create: {
        userId: session.user.id,
        ...validatedData,
      },
    })

    // Create audit log entry
    await prisma.communicationAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'preferences_updated',
        entityType: 'preferences',
        entityId: preferences.id,
        details: validatedData,
      },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Failed to update preferences:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
