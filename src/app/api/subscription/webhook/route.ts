import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import {
  stripe,
  StripeSubscriptionManager,
} from '@/lib/subscription/stripe-client'
import { prisma } from '@/lib/prisma'
import { SubscriptionStatus } from '@prisma/client'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = headers()
    const sig = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        )
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        )
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        )
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId

    if (!userId) {
      console.error('No userId in subscription metadata')
      return
    }

    // Sync subscription data
    await StripeSubscriptionManager.syncSubscriptionFromStripe(subscription.id)

    console.log(`Subscription created for user ${userId}`)
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Sync updated subscription data
    await StripeSubscriptionManager.syncSubscriptionFromStripe(subscription.id)

    console.log(`Subscription updated: ${subscription.id}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Update local subscription to canceled status
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
      },
    })

    // Update user subscription fields
    const localSub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    })

    if (localSub) {
      await prisma.user.update({
        where: { id: localSub.userId },
        data: {
          subscriptionStatus: SubscriptionStatus.CANCELED,
        },
      })
    }

    console.log(`Subscription deleted: ${subscription.id}`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription
    if (subscriptionId) {
      // Reset usage counters on successful payment for new billing cycle
      const subscription = await prisma.user.findFirst({
        where: { subscriptionId: subscriptionId as string },
      })

      if (subscription) {
        await prisma.user.update({
          where: { id: subscription.id },
          data: {
            subscriptionStatus: 'ACTIVE',
            currentPeriodStart: new Date(),
          },
        })

        console.log(`Payment succeeded for subscription: ${subscriptionId}`)
      }
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription
    if (subscriptionId) {
      // Update subscription to past due
      const user = await prisma.user.findFirst({
        where: { subscriptionId: subscriptionId as string },
      })

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'PAST_DUE',
          },
        })

        // TODO: Send notification email about failed payment
        console.log(`Payment failed for user: ${user.id}`)
      }
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId

    if (userId) {
      // TODO: Send notification email about trial ending
      console.log(`Trial will end for user: ${userId}`)

      // Create notification in database
      await prisma.notification.create({
        data: {
          userId,
          type: 'SYSTEM_ALERT',
          status: 'PENDING',
          title: 'Trial Ending Soon',
          message:
            'Your free trial will end in 3 days. Upgrade to continue using premium features.',
          actionUrl: '/upgrade',
          priority: 'high',
          channel: ['email', 'in_app'],
        },
      })
    }
  } catch (error) {
    console.error('Error handling trial will end:', error)
  }
}
