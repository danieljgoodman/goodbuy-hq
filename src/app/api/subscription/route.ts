import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StripeSubscriptionManager } from '@/lib/subscription/stripe-client'
import { SubscriptionTier } from '@prisma/client'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  tier: z.enum(['PROFESSIONAL', 'ENTERPRISE']),
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
})

const updateSubscriptionSchema = z.object({
  tier: z.enum(['PROFESSIONAL', 'ENTERPRISE']).optional(),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  action: z.enum(['cancel', 'reactivate']).optional(),
})

// GET /api/subscription - Get current subscription
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
        usageRecords: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate current usage
    const aiAnalysesUsed = user.usageRecords
      .filter(r => r.feature === 'ai-analysis')
      .reduce((sum, r) => sum + r.quantity, 0)

    const reportsGenerated = user.usageRecords
      .filter(r => r.feature === 'report-generation')
      .reduce((sum, r) => sum + r.quantity, 0)

    return NextResponse.json({
      subscription: user.subscription,
      usage: {
        aiAnalysesUsed:
          user.subscription?.currentAIAnalysesUsed || aiAnalysesUsed,
        reportsGenerated:
          user.subscription?.currentReportsGenerated || reportsGenerated,
        aiAnalysesLimit: user.subscription?.aiAnalysesPerMonthLimit || 5,
        reportsLimit: user.subscription?.reportGenerationLimit || 2,
      },
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/subscription - Create new subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { tier, billingCycle } = createSubscriptionSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (existingSubscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    // Create Stripe subscription
    const result = await StripeSubscriptionManager.createSubscription(
      session.user.id,
      tier as SubscriptionTier,
      billingCycle
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      subscriptionId: result.subscriptionId,
      clientSecret: result.clientSecret,
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/subscription - Update existing subscription
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { tier, billingCycle, action } = updateSubscriptionSchema.parse(body)

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    if (action === 'cancel') {
      const result = await StripeSubscriptionManager.cancelSubscription(
        subscription.stripeSubscriptionId,
        false // Cancel at period end
      )

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json({ message: 'Subscription canceled' })
    }

    if (action === 'reactivate') {
      // TODO: Implement reactivation logic
      return NextResponse.json(
        { error: 'Reactivation not implemented yet' },
        { status: 501 }
      )
    }

    if (tier && tier !== subscription.tier) {
      const result = await StripeSubscriptionManager.changePlan(
        subscription.stripeSubscriptionId,
        tier as SubscriptionTier,
        billingCycle || 'monthly'
      )

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json({ message: 'Subscription updated' })
    }

    return NextResponse.json({ message: 'No changes made' })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
