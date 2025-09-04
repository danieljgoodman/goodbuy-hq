import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's dashboard data including usage statistics
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        usageRecords: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // This month
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate usage statistics
    const aiAnalysesThisMonth = user.usageRecords.filter(
      record => record.feature === 'AI_ANALYSIS'
    ).length

    const reportsThisMonth = user.usageRecords.filter(
      record => record.feature === 'REPORT_GENERATION'
    ).length

    // Get portfolio size (count of businesses user has access to)
    const portfolioSize = await prisma.business.count({
      where: {
        ownerId: user.id,
      },
    })

    // Get subscription limits based on tier
    const subscription = {
      aiAnalysesPerMonthLimit:
        user.subscriptionTier === 'ENTERPRISE'
          ? 200
          : user.subscriptionTier === 'PROFESSIONAL'
            ? 50
            : 5,
      portfolioSizeLimit:
        user.subscriptionTier === 'ENTERPRISE'
          ? 100
          : user.subscriptionTier === 'PROFESSIONAL'
            ? 25
            : 3,
      reportGenerationLimit:
        user.subscriptionTier === 'ENTERPRISE'
          ? 100
          : user.subscriptionTier === 'PROFESSIONAL'
            ? 25
            : 5,
    }

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
      },
      usage: {
        aiAnalyses: {
          used: aiAnalysesThisMonth,
          limit: subscription.aiAnalysesPerMonthLimit,
        },
        portfolioSize: {
          used: portfolioSize,
          limit: subscription.portfolioSizeLimit,
        },
        reportGeneration: {
          used: reportsThisMonth,
          limit: subscription.reportGenerationLimit,
        },
        resetDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ).toISOString(),
      },
      subscription: {
        tier: user.subscriptionTier,
        status: user.subscriptionStatus,
        currentPeriodEnd: user.currentPeriodEnd,
        trialEndsAt: user.trialEndsAt,
      },
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
