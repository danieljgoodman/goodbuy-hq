import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { GET, POST, PATCH } from '@/app/api/subscription/route'
import { prisma } from '@/lib/prisma'
import { StripeSubscriptionManager } from '@/lib/subscription/stripe-client'
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'

// Mock dependencies
jest.mock('next-auth/next')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))
jest.mock('@/lib/subscription/stripe-client')

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>
const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockStripeManager = StripeSubscriptionManager as jest.Mocked<
  typeof StripeSubscriptionManager
>

describe('/api/subscription', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/subscription', () => {
    it('should return unauthorized for unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/subscription')
      const response = await GET(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return subscription data for authenticated user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        subscription: {
          id: 'sub-1',
          tier: SubscriptionTier.PROFESSIONAL,
          status: SubscriptionStatus.ACTIVE,
          currentAIAnalysesUsed: 5,
          currentReportsGenerated: 2,
          aiAnalysesPerMonthLimit: 50,
          reportGenerationLimit: 25,
        },
        usageRecords: [
          { feature: 'ai-analysis', quantity: 3 },
          { feature: 'ai-analysis', quantity: 2 },
          { feature: 'report-generation', quantity: 1 },
          { feature: 'report-generation', quantity: 1 },
        ],
      }

      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost:3000/api/subscription')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data.subscription).toBeDefined()
      expect(data.usage).toEqual({
        aiAnalysesUsed: 5,
        reportsGenerated: 2,
        aiAnalysesLimit: 50,
        reportsLimit: 25,
      })
    })

    it('should return 404 for non-existent user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      mockPrisma.user.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/subscription')
      const response = await GET(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('User not found')
    })
  })

  describe('POST /api/subscription', () => {
    it('should create a new subscription successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        stripeCustomerId: null,
      }

      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.subscription.findUnique.mockResolvedValue(null)

      mockStripeManager.createSubscription.mockResolvedValue({
        success: true,
        subscriptionId: 'sub_test123',
        clientSecret: 'pi_test123_secret',
      })

      const request = new NextRequest(
        'http://localhost:3000/api/subscription',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'PROFESSIONAL',
            billingCycle: 'monthly',
          }),
        }
      )

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data.subscriptionId).toBe('sub_test123')
      expect(data.clientSecret).toBe('pi_test123_secret')
      expect(mockStripeManager.createSubscription).toHaveBeenCalledWith(
        'user-1',
        SubscriptionTier.PROFESSIONAL,
        'monthly'
      )
    })

    it('should reject if user already has active subscription', async () => {
      const mockUser = { id: 'user-1' }
      const mockSubscription = {
        id: 'sub-1',
        stripeSubscriptionId: 'sub_existing123',
      }

      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.subscription.findUnique.mockResolvedValue(
        mockSubscription as any
      )

      const request = new NextRequest(
        'http://localhost:3000/api/subscription',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'PROFESSIONAL',
            billingCycle: 'monthly',
          }),
        }
      )

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('User already has an active subscription')
    })

    it('should validate request body schema', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      const request = new NextRequest(
        'http://localhost:3000/api/subscription',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'INVALID_TIER',
            billingCycle: 'invalid',
          }),
        }
      )

      const response = await POST(request)

      expect(response.status).toBe(500) // Schema validation error
    })
  })

  describe('PATCH /api/subscription', () => {
    it('should cancel subscription successfully', async () => {
      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        stripeSubscriptionId: 'sub_test123',
        tier: SubscriptionTier.PROFESSIONAL,
      }

      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      mockPrisma.subscription.findUnique.mockResolvedValue(
        mockSubscription as any
      )
      mockStripeManager.cancelSubscription.mockResolvedValue({ success: true })

      const request = new NextRequest(
        'http://localhost:3000/api/subscription',
        {
          method: 'PATCH',
          body: JSON.stringify({
            action: 'cancel',
          }),
        }
      )

      const response = await PATCH(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Subscription canceled')
      expect(mockStripeManager.cancelSubscription).toHaveBeenCalledWith(
        'sub_test123',
        false
      )
    })

    it('should change subscription tier', async () => {
      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        stripeSubscriptionId: 'sub_test123',
        tier: SubscriptionTier.PROFESSIONAL,
      }

      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      mockPrisma.subscription.findUnique.mockResolvedValue(
        mockSubscription as any
      )
      mockStripeManager.changePlan.mockResolvedValue({ success: true })

      const request = new NextRequest(
        'http://localhost:3000/api/subscription',
        {
          method: 'PATCH',
          body: JSON.stringify({
            tier: 'ENTERPRISE',
            billingCycle: 'yearly',
          }),
        }
      )

      const response = await PATCH(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Subscription updated')
      expect(mockStripeManager.changePlan).toHaveBeenCalledWith(
        'sub_test123',
        SubscriptionTier.ENTERPRISE,
        'yearly'
      )
    })

    it('should return 404 if no subscription found', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      mockPrisma.subscription.findUnique.mockResolvedValue(null)

      const request = new NextRequest(
        'http://localhost:3000/api/subscription',
        {
          method: 'PATCH',
          body: JSON.stringify({
            action: 'cancel',
          }),
        }
      )

      const response = await PATCH(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('No active subscription found')
    })
  })
})
