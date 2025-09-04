import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { UsageTracker } from '@/lib/subscription/usage-tracker'
import { prisma } from '@/lib/prisma'
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      update: jest.fn(),
    },
    usageRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('UsageTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('trackUsage', () => {
    it('should track usage successfully', async () => {
      const mockUser = {
        id: 'user-1',
        createdAt: new Date('2023-01-01'),
        subscription: {
          id: 'sub-1',
          currentPeriodStart: new Date('2023-09-01'),
          currentPeriodEnd: new Date('2023-10-01'),
        },
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.usageRecord.create.mockResolvedValue({} as any)
      mockPrisma.subscription.update.mockResolvedValue({} as any)

      const result = await UsageTracker.trackUsage('user-1', {
        feature: 'ai-analysis',
        action: 'generate-report',
        resourceType: 'business',
        resourceId: 'business-1',
        quantity: 1,
        metadata: { type: 'financial-health' },
      })

      expect(result.success).toBe(true)
      expect(mockPrisma.usageRecord.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          feature: 'ai-analysis',
          action: 'generate-report',
          resourceType: 'business',
          resourceId: 'business-1',
          quantity: 1,
          metadata: { type: 'financial-health' },
          billingPeriod: expect.any(String),
        },
      })
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          currentAIAnalysesUsed: {
            increment: 1,
          },
        },
      })
    })

    it('should return error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await UsageTracker.trackUsage('user-1', {
        feature: 'ai-analysis',
        action: 'generate-report',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })
  })

  describe('getCurrentUsage', () => {
    it('should return current usage for feature', async () => {
      const mockUser = {
        id: 'user-1',
        createdAt: new Date('2023-01-01'),
        subscription: {
          currentPeriodStart: new Date('2023-09-01'),
          currentPeriodEnd: new Date('2023-10-01'),
        },
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.usageRecord.aggregate.mockResolvedValue({
        _sum: { quantity: 15 },
      } as any)

      const usage = await UsageTracker.getCurrentUsage('user-1', 'ai-analysis')

      expect(usage).toBe(15)
      expect(mockPrisma.usageRecord.aggregate).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          feature: 'ai-analysis',
          billingPeriod: expect.any(String),
        },
        _sum: {
          quantity: true,
        },
      })
    })

    it('should return 0 if no usage found', async () => {
      const mockUser = {
        id: 'user-1',
        createdAt: new Date('2023-01-01'),
        subscription: null,
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.usageRecord.aggregate.mockResolvedValue({
        _sum: { quantity: null },
      } as any)

      const usage = await UsageTracker.getCurrentUsage('user-1', 'ai-analysis')

      expect(usage).toBe(0)
    })
  })

  describe('canUseFeature', () => {
    it('should return true if within limits for FREE tier', async () => {
      const mockUser = {
        id: 'user-1',
        subscriptionTier: SubscriptionTier.FREE,
        subscription: {
          currentAIAnalysesUsed: 3,
        },
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)

      const result = await UsageTracker.canUseFeature(
        'user-1',
        'aiAnalysesPerMonth',
        1
      )

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2) // 5 limit - 3 used = 2 remaining
    })

    it('should return false if exceeds limits', async () => {
      const mockUser = {
        id: 'user-1',
        subscriptionTier: SubscriptionTier.FREE,
        subscription: {
          currentAIAnalysesUsed: 5,
        },
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)

      const result = await UsageTracker.canUseFeature(
        'user-1',
        'aiAnalysesPerMonth',
        1
      )

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should return unlimited for ENTERPRISE tier', async () => {
      const mockUser = {
        id: 'user-1',
        subscriptionTier: SubscriptionTier.ENTERPRISE,
        subscription: {
          currentAIAnalysesUsed: 1000,
        },
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)

      const result = await UsageTracker.canUseFeature(
        'user-1',
        'aiAnalysesPerMonth',
        1
      )

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(-1) // Unlimited
    })
  })

  describe('getUsageAnalytics', () => {
    it('should return comprehensive usage analytics', async () => {
      const mockUser = {
        id: 'user-1',
        createdAt: new Date('2023-01-01'),
        subscription: {
          currentPeriodStart: new Date('2023-09-01'),
          currentPeriodEnd: new Date('2023-10-01'),
        },
      }

      const mockUsageRecords = [
        { feature: 'ai-analysis', action: 'generate', quantity: 3 },
        { feature: 'ai-analysis', action: 'generate', quantity: 2 },
        { feature: 'report-generation', action: 'create', quantity: 1 },
        { feature: 'report-generation', action: 'create', quantity: 1 },
        { feature: 'dashboard-view', action: 'view', quantity: 5 },
      ]

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.usageRecord.findMany.mockResolvedValue(mockUsageRecords as any)

      const analytics = await UsageTracker.getUsageAnalytics(
        'user-1',
        'current'
      )

      expect(analytics).toEqual({
        aiAnalyses: 5,
        reports: 2,
        totalActions: 12,
        topFeatures: [
          { feature: 'ai-analysis', count: 5 },
          { feature: 'dashboard-view', count: 5 },
          { feature: 'report-generation', count: 2 },
        ],
      })
    })

    it('should return zeros if no usage found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const analytics = await UsageTracker.getUsageAnalytics(
        'user-1',
        'current'
      )

      expect(analytics).toEqual({
        aiAnalyses: 0,
        reports: 0,
        totalActions: 0,
        topFeatures: [],
      })
    })
  })

  describe('resetBillingCycleUsage', () => {
    it('should reset usage counters successfully', async () => {
      mockPrisma.subscription.update.mockResolvedValue({} as any)

      await UsageTracker.resetBillingCycleUsage('user-1')

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          currentAIAnalysesUsed: 0,
          currentReportsGenerated: 0,
          billingCycleResetAt: expect.any(Date),
        },
      })
    })
  })
})
