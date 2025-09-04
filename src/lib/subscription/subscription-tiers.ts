import { SubscriptionTier } from '@prisma/client'

export interface SubscriptionTierConfig {
  id: SubscriptionTier
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  stripePriceIdMonthly?: string
  stripePriceIdYearly?: string
  features: string[]
  limits: {
    aiAnalysesPerMonth: number
    portfolioSize: number
    reportGeneration: number
    prioritySupport?: boolean
    advancedAnalytics?: boolean
    customIntegrations?: boolean
  }
  popular?: boolean
}

export const SUBSCRIPTION_TIERS: Record<
  SubscriptionTier,
  SubscriptionTierConfig
> = {
  FREE: {
    id: SubscriptionTier.FREE,
    name: 'Free',
    description: 'Perfect for getting started with basic business analysis',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Basic financial health scoring',
      'Simple business evaluation',
      'Basic dashboard access',
      'Community support',
    ],
    limits: {
      aiAnalysesPerMonth: 5,
      portfolioSize: 1,
      reportGeneration: 2,
    },
  },
  PROFESSIONAL: {
    id: SubscriptionTier.PROFESSIONAL,
    name: 'Professional',
    description: 'Advanced analytics for serious business buyers and brokers',
    priceMonthly: 29.99,
    priceYearly: 299.99,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ID_PROFESSIONAL_YEARLY,
    features: [
      'Advanced AI-powered financial analysis',
      'Detailed market insights',
      'Comprehensive risk assessment',
      'Custom report generation',
      'Priority email support',
      'Advanced forecasting',
    ],
    limits: {
      aiAnalysesPerMonth: 50,
      portfolioSize: 10,
      reportGeneration: 25,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    popular: true,
  },
  ENTERPRISE: {
    id: SubscriptionTier.ENTERPRISE,
    name: 'Enterprise',
    description:
      'Complete solution for business brokerages and investment firms',
    priceMonthly: 99.99,
    priceYearly: 999.99,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY,
    features: [
      'Unlimited AI analyses',
      'White-label reporting',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced portfolio management',
      'Real-time alerts',
      'Custom branding',
    ],
    limits: {
      aiAnalysesPerMonth: -1, // Unlimited
      portfolioSize: -1, // Unlimited
      reportGeneration: -1, // Unlimited
      prioritySupport: true,
      advancedAnalytics: true,
      customIntegrations: true,
    },
  },
}

export function getSubscriptionTierConfig(
  tier: SubscriptionTier
): SubscriptionTierConfig {
  return SUBSCRIPTION_TIERS[tier]
}

export function hasFeatureAccess(
  userTier: SubscriptionTier,
  feature: keyof SubscriptionTierConfig['limits']
): boolean {
  const config = getSubscriptionTierConfig(userTier)
  return config.limits[feature] === true || config.limits[feature] === -1
}

export function getRemainingUsage(
  userTier: SubscriptionTier,
  feature: keyof Pick<
    SubscriptionTierConfig['limits'],
    'aiAnalysesPerMonth' | 'reportGeneration'
  >,
  currentUsage: number
): number {
  const config = getSubscriptionTierConfig(userTier)
  const limit = config.limits[feature] as number

  if (limit === -1) return -1 // Unlimited
  return Math.max(0, limit - currentUsage)
}

export function canUseFeature(
  userTier: SubscriptionTier,
  feature: keyof Pick<
    SubscriptionTierConfig['limits'],
    'aiAnalysesPerMonth' | 'reportGeneration'
  >,
  currentUsage: number
): boolean {
  const remaining = getRemainingUsage(userTier, feature, currentUsage)
  return remaining === -1 || remaining > 0
}
