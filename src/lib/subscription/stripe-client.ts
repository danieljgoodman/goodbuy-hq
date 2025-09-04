import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'
import { SUBSCRIPTION_TIERS } from './subscription-tiers'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
})

export class StripeSubscriptionManager {
  static async createCustomer(
    userId: string,
    email: string,
    name?: string
  ): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { userId },
      })

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      })

      return { success: true, customerId: customer.id }
    } catch (error) {
      console.error('Create customer error:', error)
      return { success: false, error: 'Failed to create customer' }
    }
  }

  static async createSubscription(
    userId: string,
    tier: SubscriptionTier,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): Promise<{
    success: boolean
    subscriptionId?: string
    clientSecret?: string
    error?: string
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return { success: false, error: 'User not found' }
      }

      let customerId = user.stripeCustomerId

      // Create customer if doesn't exist
      if (!customerId) {
        const customerResult = await this.createCustomer(
          userId,
          user.email,
          user.name || undefined
        )
        if (!customerResult.success) {
          return { success: false, error: customerResult.error }
        }
        customerId = customerResult.customerId!
      }

      const tierConfig = SUBSCRIPTION_TIERS[tier]
      const priceId =
        billingCycle === 'monthly'
          ? tierConfig.stripePriceIdMonthly
          : tierConfig.stripePriceIdYearly

      if (!priceId) {
        return {
          success: false,
          error: `Price ID not configured for ${tier} ${billingCycle}`,
        }
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: { userId, tier },
      })

      const invoice = subscription.latest_invoice as Stripe.Invoice
      const paymentIntent = (invoice as any).payment_intent as
        | Stripe.PaymentIntent
        | undefined

      return {
        success: true,
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret || undefined,
      }
    } catch (error) {
      console.error('Create subscription error:', error)
      return { success: false, error: 'Failed to create subscription' }
    }
  }

  static async cancelSubscription(
    subscriptionId: string,
    cancelImmediately: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !cancelImmediately,
        ...(cancelImmediately && { cancel_at: Math.floor(Date.now() / 1000) }),
      })

      // Update local subscription
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          cancelAtPeriodEnd: !cancelImmediately,
          ...(cancelImmediately && {
            status: SubscriptionStatus.CANCELED,
            canceledAt: new Date(),
          }),
        },
      })

      return { success: true }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      return { success: false, error: 'Failed to cancel subscription' }
    }
  }

  static async changePlan(
    subscriptionId: string,
    newTier: SubscriptionTier,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tierConfig = SUBSCRIPTION_TIERS[newTier]
      const newPriceId =
        billingCycle === 'monthly'
          ? tierConfig.stripePriceIdMonthly
          : tierConfig.stripePriceIdYearly

      if (!newPriceId) {
        return {
          success: false,
          error: `Price ID not configured for ${newTier} ${billingCycle}`,
        }
      }

      // Get current subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const currentItem = subscription.items.data[0]

      // Update subscription
      await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: currentItem.id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      })

      // Update local subscription
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          tier: newTier,
          stripePriceId: newPriceId,
          ...this.getTierLimits(newTier),
        },
      })

      return { success: true }
    } catch (error) {
      console.error('Change plan error:', error)
      return { success: false, error: 'Failed to change plan' }
    }
  }

  static async syncSubscriptionFromStripe(
    stripeSubscriptionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription =
        await stripe.subscriptions.retrieve(stripeSubscriptionId)

      // Map Stripe status to our enum
      const statusMap: Record<string, SubscriptionStatus> = {
        active: SubscriptionStatus.ACTIVE,
        past_due: SubscriptionStatus.PAST_DUE,
        canceled: SubscriptionStatus.CANCELED,
        unpaid: SubscriptionStatus.UNPAID,
        trialing: SubscriptionStatus.TRIALING,
        incomplete: SubscriptionStatus.INACTIVE,
        incomplete_expired: SubscriptionStatus.CANCELED,
      }

      const status =
        statusMap[subscription.status] || SubscriptionStatus.INACTIVE
      const tier =
        (subscription.metadata.tier as SubscriptionTier) ||
        SubscriptionTier.FREE

      // Update local subscription
      await prisma.subscription.update({
        where: { stripeSubscriptionId },
        data: {
          status,
          tier,
          currentPeriodStart: new Date(
            (subscription as any).current_period_start * 1000
          ),
          currentPeriodEnd: new Date(
            (subscription as any).current_period_end * 1000
          ),
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
          canceledAt: (subscription as any).canceled_at
            ? new Date((subscription as any).canceled_at * 1000)
            : null,
          trialStart: (subscription as any).trial_start
            ? new Date((subscription as any).trial_start * 1000)
            : null,
          trialEnd: (subscription as any).trial_end
            ? new Date((subscription as any).trial_end * 1000)
            : null,
          ...this.getTierLimits(tier),
        },
      })

      // Also update user fields for quick access
      const localSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId },
        include: { user: true },
      })

      if (localSub) {
        await prisma.user.update({
          where: { id: localSub.userId },
          data: {
            subscriptionTier: tier,
            subscriptionStatus: status,
            currentPeriodStart: new Date(
              (subscription as any).current_period_start * 1000
            ),
            currentPeriodEnd: new Date(
              (subscription as any).current_period_end * 1000
            ),
          },
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Sync subscription error:', error)
      return { success: false, error: 'Failed to sync subscription' }
    }
  }

  private static getTierLimits(tier: SubscriptionTier) {
    const config = SUBSCRIPTION_TIERS[tier]
    return {
      aiAnalysesPerMonthLimit:
        config.limits.aiAnalysesPerMonth === -1
          ? 999999
          : config.limits.aiAnalysesPerMonth,
      portfolioSizeLimit:
        config.limits.portfolioSize === -1
          ? 999999
          : config.limits.portfolioSize,
      reportGenerationLimit:
        config.limits.reportGeneration === -1
          ? 999999
          : config.limits.reportGeneration,
    }
  }
}
