'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { SubscriptionTier } from '@prisma/client'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { PlanSelector } from './PlanSelector'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SubscriptionGuardProps {
  children: React.ReactNode
  requiredTier?: SubscriptionTier
  fallback?: React.ReactNode
}

export function SubscriptionGuard({
  children,
  requiredTier = SubscriptionTier.FREE,
  fallback,
}: SubscriptionGuardProps) {
  const { data: session } = useSession()
  const { hasAccess, userTier } = useFeatureAccess()

  // Allow access if no specific tier required or user has required access
  if (requiredTier === SubscriptionTier.FREE || hasAccess(requiredTier)) {
    return <>{children}</>
  }

  // Show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Upgrade Required</CardTitle>
          <CardDescription>
            This feature requires a {requiredTier.toLowerCase()} subscription or
            higher.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanSelector
            onSelectPlan={(tier, billing) => {
              // Handle plan selection
              window.location.href = `/api/subscription/checkout?tier=${tier}&billing=${billing}`
            }}
            currentTier={userTier}
          />
        </CardContent>
      </Card>
    </div>
  )
}
