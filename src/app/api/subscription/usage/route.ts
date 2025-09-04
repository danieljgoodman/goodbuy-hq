import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { UsageTracker } from '@/lib/subscription/usage-tracker'
import { z } from 'zod'

const trackUsageSchema = z.object({
  feature: z.string(),
  action: z.string(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  metadata: z.record(z.string(), z.any()).optional(),
})

const getUsageSchema = z.object({
  feature: z.string().optional(),
  timeframe: z.enum(['current', 'last30days', 'all']).default('current'),
})

// GET /api/subscription/usage - Get usage analytics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const feature = searchParams.get('feature')
    const timeframe = (searchParams.get('timeframe') || 'current') as
      | 'current'
      | 'last30days'
      | 'all'

    if (feature) {
      // Get specific feature usage
      const currentUsage = await UsageTracker.getCurrentUsage(
        session.user.id,
        feature
      )

      // Check usage limits
      const canUse = await UsageTracker.canUseFeature(
        session.user.id,
        feature as any,
        1
      )

      return NextResponse.json({
        feature,
        currentUsage,
        canUseFeature: canUse.allowed,
        remaining: canUse.remaining,
      })
    } else {
      // Get dashboard usage data for the UI
      const dashboardData = await UsageTracker.getDashboardUsageData(
        session.user.id
      )

      return NextResponse.json(dashboardData)
    }
  } catch (error) {
    console.error('Get usage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/subscription/usage - Track usage
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { feature, action, resourceType, resourceId, quantity, metadata } =
      trackUsageSchema.parse(body)

    // Check if user can use this feature before tracking
    if (feature === 'ai-analysis' || feature === 'report-generation') {
      const featureMap = {
        'ai-analysis': 'aiAnalysesPerMonth' as const,
        'report-generation': 'reportGeneration' as const,
      }

      const canUse = await UsageTracker.canUseFeature(
        session.user.id,
        featureMap[feature as keyof typeof featureMap],
        quantity
      )

      if (!canUse.allowed) {
        return NextResponse.json(
          {
            error: 'Usage limit exceeded',
            remaining: canUse.remaining,
            upgradeRequired: true,
          },
          { status: 403 }
        )
      }
    }

    // Track the usage
    const result = await UsageTracker.trackUsage(session.user.id, {
      feature,
      action,
      resourceType,
      resourceId,
      quantity,
      metadata,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Return updated usage information
    const updatedUsage = await UsageTracker.getCurrentUsage(
      session.user.id,
      feature
    )

    const canUseAfter = await UsageTracker.canUseFeature(
      session.user.id,
      feature as any,
      1
    )

    return NextResponse.json({
      success: true,
      currentUsage: updatedUsage,
      remaining: canUseAfter.remaining,
    })
  } catch (error) {
    console.error('Track usage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
