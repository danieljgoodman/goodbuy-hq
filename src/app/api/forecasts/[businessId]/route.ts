import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const businessIdSchema = z.object({
  businessId: z.string().cuid('Invalid business ID format'),
})

const forecastQuerySchema = z.object({
  type: z
    .enum(['REVENUE', 'EXPENSES', 'PROFIT', 'CASH_FLOW', 'GROWTH_RATE'])
    .optional(),
  period: z
    .string()
    .transform(val => parseInt(val))
    .pipe(z.number().min(1).max(12))
    .optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    // Validate business ID parameter
    const { businessId } = businessIdSchema.parse(params)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = forecastQuerySchema.parse({
      type: searchParams.get('type'),
      period: searchParams.get('period'),
    })

    // Get authenticated session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify business exists and user has access
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check authorization - user must own the business
    if (business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build query conditions
    const whereConditions: any = { businessId }
    if (query.type) {
      whereConditions.forecastType = query.type
    }
    if (query.period) {
      whereConditions.forecastPeriod = query.period
    }

    // Fetch forecast results for the business
    const forecasts = await prisma.forecastResult.findMany({
      where: whereConditions,
      orderBy: [
        { forecastType: 'asc' },
        { forecastPeriod: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        forecastType: true,
        forecastPeriod: true,
        predictedValue: true,
        confidenceIntervalLower: true,
        confidenceIntervalUpper: true,
        confidenceScore: true,
        modelUsed: true,
        actualValue: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (forecasts.length === 0) {
      return NextResponse.json(
        { error: 'No forecast data found for this business' },
        { status: 404 }
      )
    }

    // Group forecasts by type for better organization
    const groupedForecasts = forecasts.reduce(
      (acc, forecast) => {
        const type = forecast.forecastType
        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(forecast)
        return acc
      },
      {} as Record<string, typeof forecasts>
    )

    return NextResponse.json({
      success: true,
      data: {
        forecasts: groupedForecasts,
        totalCount: forecasts.length,
        filters: {
          type: query.type || 'all',
          period: query.period || 'all',
        },
      },
    })
  } catch (error) {
    console.error('Forecasts API error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    // Handle database errors
    if (error instanceof Error && error.message.includes('prisma')) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
