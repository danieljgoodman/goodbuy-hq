import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  rateLimit,
  RATE_LIMIT_CONFIGS,
  getRateLimitHeaders,
} from '@/lib/rate-limit'
import {
  calculateHealthScores,
  generateHealthInsights,
  prepareHealthMetricData,
} from '@/lib/health-scoring'

const calculateHealthSchema = z.object({
  businessId: z.string().cuid('Invalid business ID format'),
  forceRecalculation: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for health calculation endpoint
    const rateLimitResult = await rateLimit(
      request,
      RATE_LIMIT_CONFIGS.HEALTH_CALCULATION,
      'health-calculation'
    )

    if (!rateLimitResult.success) {
      const rateLimitHeaders = getRateLimitHeaders(
        rateLimitResult,
        RATE_LIMIT_CONFIGS.HEALTH_CALCULATION
      )
      return NextResponse.json(
        { error: 'Too many calculation requests. Please try again later.' },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      )
    }

    // Get authenticated session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { businessId, forceRecalculation } = calculateHealthSchema.parse(body)

    // Verify business exists and user has access - get full business data for calculation
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check authorization - user must own the business
    if (business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if recent calculation exists (within last hour) unless forced
    if (!forceRecalculation) {
      const recentCalculation = await prisma.healthMetric.findFirst({
        where: {
          businessId,
          calculatedAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          },
        },
        orderBy: { calculatedAt: 'desc' },
      })

      if (recentCalculation) {
        return NextResponse.json({
          success: true,
          message: 'Recent calculation found',
          data: {
            calculationId: recentCalculation.id,
            calculatedAt: recentCalculation.calculatedAt,
            skipReason: 'Recent calculation exists within the last hour',
            forceRecalculation: false,
          },
        })
      }
    }

    // Calculate comprehensive health scores using our scoring engine
    const startTime = Date.now()
    const healthResult = await calculateHealthScores(business)
    const calculationDuration = Date.now() - startTime

    // Generate insights summary
    const insights = generateHealthInsights(healthResult)

    // Prepare data for database storage
    const healthMetricData = prepareHealthMetricData(businessId, healthResult)

    // Create health metric record with calculated scores
    const healthMetric = await prisma.healthMetric.create({
      data: {
        ...healthMetricData,
        calculationMetadata: {
          calculationDuration: `${calculationDuration}ms`,
          insights: {
            summary: insights.summary,
            keyStrengths: insights.keyStrengths,
            keyWeaknesses: insights.keyWeaknesses,
            recommendations: insights.recommendations,
          },
        },
      },
      select: {
        id: true,
        overallScore: true,
        growthScore: true,
        operationalScore: true,
        financialScore: true,
        saleReadinessScore: true,
        confidenceLevel: true,
        trajectory: true,
        calculatedAt: true,
        dataSources: true,
        calculationMetadata: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Health calculation completed successfully',
        data: {
          calculationId: healthMetric.id,
          healthMetric: healthMetric,
          calculatedAt: healthMetric.calculatedAt,
          forceRecalculation,
          insights: insights,
          calculationDuration: `${calculationDuration}ms`,
        },
      },
      {
        status: 201,
        headers: getRateLimitHeaders(
          rateLimitResult,
          RATE_LIMIT_CONFIGS.HEALTH_CALCULATION
        ),
      }
    )
  } catch (error) {
    console.error('Health calculation API error:', error)

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

    // Handle rate limiting errors
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
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
