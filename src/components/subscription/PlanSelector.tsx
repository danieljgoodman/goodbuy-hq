'use client'

import React, { useState } from 'react'
import { SubscriptionTier } from '@prisma/client'
import {
  SUBSCRIPTION_TIERS,
  SubscriptionTierConfig,
} from '@/lib/subscription/subscription-tiers'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

interface PlanSelectorProps {
  onSelectPlan: (
    tier: SubscriptionTier,
    billingCycle: 'monthly' | 'yearly'
  ) => void
  currentTier?: SubscriptionTier
  loading?: boolean
  className?: string
}

export function PlanSelector({
  onSelectPlan,
  currentTier = SubscriptionTier.FREE,
  loading = false,
  className = '',
}: PlanSelectorProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  )
  const { userTier } = useFeatureAccess()

  const tierConfigs = Object.values(SUBSCRIPTION_TIERS)

  const formatPrice = (config: SubscriptionTierConfig) => {
    const price =
      billingCycle === 'monthly' ? config.priceMonthly : config.priceYearly
    if (price === 0) return 'Free'

    const monthlyPrice = billingCycle === 'monthly' ? price : price / 12
    return `$${monthlyPrice.toFixed(2)}/mo${billingCycle === 'yearly' ? ' (billed annually)' : ''}`
  }

  const getButtonText = (tier: SubscriptionTier) => {
    if (currentTier === tier) return 'Current Plan'
    if (tier === SubscriptionTier.FREE) return 'Start Free'
    return 'Upgrade Now'
  }

  const getButtonVariant = (tier: SubscriptionTier) => {
    if (currentTier === tier) return 'outline'
    if (tier === SubscriptionTier.FREE) return 'secondary'
    return 'default'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-lg p-1 flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
              billingCycle === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 text-xs"
            >
              Save 17%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {tierConfigs.map(config => (
          <Card
            key={config.id}
            className={`relative ${
              config.popular ? 'border-primary shadow-lg' : ''
            } ${currentTier === config.id ? 'ring-2 ring-primary' : ''}`}
          >
            {config.popular && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge variant="default" className="text-xs">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription className="text-sm">
                {config.description}
              </CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {formatPrice(config)}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <ul className="space-y-2">
                {config.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Usage Limits */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>AI Analyses/month:</span>
                    <span className="font-medium">
                      {config.limits.aiAnalysesPerMonth === -1
                        ? 'Unlimited'
                        : config.limits.aiAnalysesPerMonth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Portfolio Size:</span>
                    <span className="font-medium">
                      {config.limits.portfolioSize === -1
                        ? 'Unlimited'
                        : `${config.limits.portfolioSize} businesses`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reports/month:</span>
                    <span className="font-medium">
                      {config.limits.reportGeneration === -1
                        ? 'Unlimited'
                        : config.limits.reportGeneration}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={getButtonVariant(config.id)}
                disabled={loading || currentTier === config.id}
                onClick={() => onSelectPlan(config.id, billingCycle)}
              >
                {loading ? 'Processing...' : getButtonText(config.id)}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          All plans include email support. Higher tiers include priority
          support.
        </p>
        <p className="mt-1">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  )
}
