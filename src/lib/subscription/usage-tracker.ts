import { prisma } from '@/lib/prisma'
import { SubscriptionTier } from '@prisma/client'
import { getSubscriptionTierConfig } from './subscription-tiers'

export interface UsageTrackingOptions {
  feature: string
  action: string
  resourceType?: string
  resourceId?: string
  quantity?: number
  metadata?: Record<string, any>
}

export class UsageTracker {
  static async trackUsage(
    userId: string,
    options: UsageTrackingOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        feature,
        action,
        resourceType,
        resourceId,
        quantity = 1,
        metadata,
      } = options

      // Get current billing period
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      })

      if (!user) {
        return { success: false, error: 'User not found' }
      }

      const billingPeriod = this.getCurrentBillingPeriod(
        user.subscription?.currentPeriodStart || user.createdAt,
        user.subscription?.currentPeriodEnd
      )

      // Record usage
      await prisma.usageRecord.create({
        data: {
          userId,
          feature,
          action,
          resourceType,
          resourceId,
          quantity,
          metadata,
          billingPeriod,
        },
      })

      // Update subscription usage counters for key features
      if (feature === 'ai-analysis' && user.subscription) {
        await prisma.subscription.update({
          where: { userId },
          data: {
            currentAIAnalysesUsed: {
              increment: quantity,
            },
          },
        })
      }

      if (feature === 'report-generation' && user.subscription) {
        await prisma.subscription.update({
          where: { userId },
          data: {
            currentReportsGenerated: {
              increment: quantity,
            },
          },
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Usage tracking error:', error)
      return { success: false, error: 'Failed to track usage' }
    }
  }

  static async getCurrentUsage(
    userId: string,
    feature: string,
    billingPeriod?: string
  ): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      })

      if (!user) return 0

      const period =
        billingPeriod ||
        this.getCurrentBillingPeriod(
          user.subscription?.currentPeriodStart || user.createdAt,
          user.subscription?.currentPeriodEnd
        )

      const usage = await prisma.usageRecord.aggregate({
        where: {
          userId,
          feature,
          billingPeriod: period,
        },
        _sum: {
          quantity: true,
        },
      })

      return usage._sum.quantity || 0
    } catch (error) {
      console.error('Get usage error:', error)
      return 0
    }
  }

  static async canUseFeature(
    userId: string,
    feature: 'aiAnalysesPerMonth' | 'reportGeneration',
    requestedQuantity: number = 1
  ): Promise<{ allowed: boolean; remaining: number; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      })

      if (!user) {
        return { allowed: false, remaining: 0, error: 'User not found' }
      }

      const tierConfig = getSubscriptionTierConfig(user.subscriptionTier)
      const limit = tierConfig.limits[feature] as number

      // Unlimited usage
      if (limit === -1) {
        return { allowed: true, remaining: -1 }
      }

      // Get current usage from subscription record for accuracy
      let currentUsage = 0
      if (feature === 'aiAnalysesPerMonth') {
        currentUsage = user.subscription?.currentAIAnalysesUsed || 0
      } else if (feature === 'reportGeneration') {
        currentUsage = user.subscription?.currentReportsGenerated || 0
      }

      const remaining = Math.max(0, limit - currentUsage)
      const allowed = remaining >= requestedQuantity

      return { allowed, remaining }
    } catch (error) {
      console.error('Can use feature error:', error)
      return {
        allowed: false,
        remaining: 0,
        error: 'Failed to check usage limits',
      }
    }
  }

  static async resetBillingCycleUsage(userId: string): Promise<void> {
    try {
      await prisma.subscription.update({
        where: { userId },
        data: {
          currentAIAnalysesUsed: 0,
          currentReportsGenerated: 0,
          billingCycleResetAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Reset billing cycle error:', error)
    }
  }

  static async getDashboardUsageData(userId: string): Promise<{
    aiAnalyses: { used: number; limit: number }
    portfolioSize: { used: number; limit: number }
    reportGeneration: { used: number; limit: number }
    resetDate: string
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
          businesses: true,
        },
      })

      if (!user) {
        return {
          aiAnalyses: { used: 0, limit: 1 },
          portfolioSize: { used: 0, limit: 1 },
          reportGeneration: { used: 0, limit: 1 },
          resetDate: new Date().toISOString(),
        }
      }

      const tier = getSubscriptionTierConfig(user.subscriptionTier || 'FREE')
      const subscription = user.subscription

      // Get current period usage
      const period = this.getCurrentBillingPeriod(
        subscription?.currentPeriodStart || user.createdAt,
        subscription?.currentPeriodEnd
      )

      const usageRecords = await prisma.usageRecord.findMany({
        where: {
          userId,
          billingPeriod: period,
        },
      })

      const aiAnalysesUsed = usageRecords
        .filter(r => r.feature === 'ai-analysis')
        .reduce((sum, r) => sum + r.quantity, 0)

      const reportsUsed = usageRecords
        .filter(r => r.feature === 'report-generation')
        .reduce((sum, r) => sum + r.quantity, 0)

      const portfolioUsed = user.businesses.length

      return {
        aiAnalyses: {
          used: aiAnalysesUsed,
          limit: tier.limits.aiAnalysesPerMonth,
        },
        portfolioSize: {
          used: portfolioUsed,
          limit:
            tier.limits.portfolioSize === -1 ? 999 : tier.limits.portfolioSize,
        },
        reportGeneration: {
          used: reportsUsed,
          limit: tier.limits.reportGeneration,
        },
        resetDate:
          subscription?.currentPeriodEnd?.toISOString() ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      console.error('Get dashboard usage error:', error)
      return {
        aiAnalyses: { used: 0, limit: 1 },
        portfolioSize: { used: 0, limit: 1 },
        reportGeneration: { used: 0, limit: 1 },
        resetDate: new Date().toISOString(),
      }
    }
  }

  static async getUsageAnalytics(
    userId: string,
    timeframe: 'current' | 'last30days' | 'all' = 'current'
  ): Promise<{
    aiAnalyses: number
    reports: number
    totalActions: number
    topFeatures: Array<{ feature: string; count: number }>
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      })

      if (!user) {
        return { aiAnalyses: 0, reports: 0, totalActions: 0, topFeatures: [] }
      }

      let dateFilter: any = {}

      if (timeframe === 'current') {
        const period = this.getCurrentBillingPeriod(
          user.subscription?.currentPeriodStart || user.createdAt,
          user.subscription?.currentPeriodEnd
        )
        dateFilter = { billingPeriod: period }
      } else if (timeframe === 'last30days') {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        dateFilter = { createdAt: { gte: thirtyDaysAgo } }
      }

      const usageRecords = await prisma.usageRecord.findMany({
        where: {
          userId,
          ...dateFilter,
        },
      })

      const aiAnalyses = usageRecords
        .filter(r => r.feature === 'ai-analysis')
        .reduce((sum, r) => sum + r.quantity, 0)

      const reports = usageRecords
        .filter(r => r.feature === 'report-generation')
        .reduce((sum, r) => sum + r.quantity, 0)

      const totalActions = usageRecords.reduce((sum, r) => sum + r.quantity, 0)

      // Group by feature for top features
      const featureUsage = usageRecords.reduce(
        (acc, record) => {
          acc[record.feature] = (acc[record.feature] || 0) + record.quantity
          return acc
        },
        {} as Record<string, number>
      )

      const topFeatures = Object.entries(featureUsage)
        .map(([feature, count]) => ({ feature, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return { aiAnalyses, reports, totalActions, topFeatures }
    } catch (error) {
      console.error('Get usage analytics error:', error)
      return { aiAnalyses: 0, reports: 0, totalActions: 0, topFeatures: [] }
    }
  }

  private static getCurrentBillingPeriod(
    periodStart: Date,
    periodEnd?: Date | null
  ): string {
    const now = new Date()
    const start = new Date(periodStart)

    // If no end date, assume monthly billing
    if (!periodEnd) {
      const monthlyStart = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      )
      return `${monthlyStart.getFullYear()}-${String(monthlyStart.getMonth() + 1).padStart(2, '0')}`
    }

    return `${start.toISOString().split('T')[0]}_${periodEnd.toISOString().split('T')[0]}`
  }
}
