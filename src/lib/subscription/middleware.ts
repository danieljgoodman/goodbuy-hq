import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'
import {
  getSubscriptionTierConfig,
  hasFeatureAccess,
} from './subscription-tiers'

export interface SubscriptionMiddlewareOptions {
  requiredTier?: SubscriptionTier
  requiresActiveSubscription?: boolean
  requiredFeature?: string
  redirectTo?: string
}

export async function withSubscriptionValidation(
  req: NextRequest,
  options: SubscriptionMiddlewareOptions = {}
): Promise<NextResponse | null> {
  const {
    requiredTier,
    requiresActiveSubscription = true,
    requiredFeature,
    redirectTo = '/upgrade',
  } = options

  try {
    // Get the user's session token
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    const userTier = token.subscriptionTier as SubscriptionTier
    const userStatus = token.subscriptionStatus as SubscriptionStatus

    // Check if subscription is active (if required)
    if (
      requiresActiveSubscription &&
      userStatus !== SubscriptionStatus.ACTIVE &&
      userStatus !== SubscriptionStatus.TRIALING
    ) {
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }

    // Check minimum tier requirement
    if (requiredTier) {
      const tierOrder = [
        SubscriptionTier.FREE,
        SubscriptionTier.PROFESSIONAL,
        SubscriptionTier.ENTERPRISE,
      ]
      const userTierIndex = tierOrder.indexOf(userTier)
      const requiredTierIndex = tierOrder.indexOf(requiredTier)

      if (userTierIndex < requiredTierIndex) {
        return NextResponse.redirect(new URL(redirectTo, req.url))
      }
    }

    // Check specific feature access
    if (
      requiredFeature &&
      !hasFeatureAccess(userTier, requiredFeature as any)
    ) {
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }

    return null // Continue processing
  } catch (error) {
    console.error('Subscription middleware error:', error)
    return NextResponse.redirect(new URL('/auth/error', req.url))
  }
}

// Middleware wrapper for API routes
export function createSubscriptionMiddleware(
  options: SubscriptionMiddlewareOptions
) {
  return async (req: NextRequest) => {
    const result = await withSubscriptionValidation(req, options)
    return result
  }
}

// Helper function for API routes
export async function validateSubscriptionInAPI(
  req: NextRequest,
  options: Omit<SubscriptionMiddlewareOptions, 'redirectTo'> = {}
): Promise<{
  isValid: boolean
  token: any
  error?: string
}> {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return { isValid: false, token: null, error: 'Unauthorized' }
    }

    const userTier = token.subscriptionTier as SubscriptionTier
    const userStatus = token.subscriptionStatus as SubscriptionStatus

    // Check if subscription is active (if required)
    if (
      options.requiresActiveSubscription !== false &&
      userStatus !== SubscriptionStatus.ACTIVE &&
      userStatus !== SubscriptionStatus.TRIALING
    ) {
      return { isValid: false, token, error: 'Inactive subscription' }
    }

    // Check minimum tier requirement
    if (options.requiredTier) {
      const tierOrder = [
        SubscriptionTier.FREE,
        SubscriptionTier.PROFESSIONAL,
        SubscriptionTier.ENTERPRISE,
      ]
      const userTierIndex = tierOrder.indexOf(userTier)
      const requiredTierIndex = tierOrder.indexOf(options.requiredTier)

      if (userTierIndex < requiredTierIndex) {
        return {
          isValid: false,
          token,
          error: 'Insufficient subscription tier',
        }
      }
    }

    // Check specific feature access
    if (
      options.requiredFeature &&
      !hasFeatureAccess(userTier, options.requiredFeature as any)
    ) {
      return {
        isValid: false,
        token,
        error: 'Feature not available in current tier',
      }
    }

    return { isValid: true, token }
  } catch (error) {
    console.error('Subscription validation error:', error)
    return { isValid: false, token: null, error: 'Internal error' }
  }
}
