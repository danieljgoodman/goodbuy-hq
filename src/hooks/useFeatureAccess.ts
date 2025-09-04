import { useSession } from 'next-auth/react'
import { SubscriptionTier, UserType } from '@prisma/client'
import { FeatureAccessControl } from '@/lib/subscription/feature-access'
import { useMemo } from 'react'

export interface UseFeatureAccessResult {
  hasAccess: (feature: string) => boolean
  getAccessibleFeatures: () => string[]
  canPerformAction: (
    feature: string,
    currentUsage?: number
  ) => Promise<{ allowed: boolean; reason?: string }>
  getUpgradeSuggestion: (feature: string) => {
    suggestedTier: SubscriptionTier | null
    reason: string
  }
  userTier: SubscriptionTier
  userType: UserType
  isLoading: boolean
}

export function useFeatureAccess(): UseFeatureAccessResult {
  const { data: session, status } = useSession()

  const userTier = session?.user?.subscriptionTier || SubscriptionTier.FREE
  const userType = session?.user?.userType || UserType.BUYER
  const isLoading = status === 'loading'

  const memoizedResult = useMemo(() => {
    const hasAccess = (feature: string): boolean => {
      if (isLoading) return false
      return FeatureAccessControl.hasFeatureAccess(userTier, userType, feature)
    }

    const getAccessibleFeatures = (): string[] => {
      if (isLoading) return []
      return FeatureAccessControl.getAccessibleFeatures(userTier, userType)
    }

    const canPerformAction = async (
      feature: string,
      currentUsage: number = 0
    ) => {
      if (isLoading) return { allowed: false, reason: 'Loading user data' }
      return FeatureAccessControl.canPerformAction(
        userTier,
        userType,
        feature,
        currentUsage
      )
    }

    const getUpgradeSuggestion = (feature: string) => {
      return FeatureAccessControl.getUpgradeSuggestion(userTier, feature)
    }

    return {
      hasAccess,
      getAccessibleFeatures,
      canPerformAction,
      getUpgradeSuggestion,
      userTier,
      userType,
      isLoading,
    }
  }, [userTier, userType, isLoading])

  return memoizedResult
}

// Hook for checking specific feature access
export function useHasFeatureAccess(feature: string): {
  hasAccess: boolean
  isLoading: boolean
  upgradeInfo?: { suggestedTier: SubscriptionTier | null; reason: string }
} {
  const { hasAccess, getUpgradeSuggestion, isLoading } = useFeatureAccess()

  return useMemo(() => {
    const access = hasAccess(feature)
    const upgradeInfo = access ? undefined : getUpgradeSuggestion(feature)

    return {
      hasAccess: access,
      isLoading,
      upgradeInfo,
    }
  }, [feature, hasAccess, getUpgradeSuggestion, isLoading])
}

// Hook for getting tier-specific features
export function useTierFeatures(): {
  currentFeatures: string[]
  nextTierFeatures: string[]
  isLoading: boolean
} {
  const { userTier, isLoading } = useFeatureAccess()

  return useMemo(() => {
    if (isLoading) {
      return { currentFeatures: [], nextTierFeatures: [], isLoading: true }
    }

    const currentFeatures = FeatureAccessControl.getFeaturesByTier(
      userTier
    ).map(f => f.feature)

    // Get next tier features
    const tierOrder = [
      SubscriptionTier.FREE,
      SubscriptionTier.PROFESSIONAL,
      SubscriptionTier.ENTERPRISE,
    ]
    const currentIndex = tierOrder.indexOf(userTier)
    const nextTier =
      currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null

    const nextTierFeatures = nextTier
      ? FeatureAccessControl.getFeaturesByTier(nextTier)
          .map(f => f.feature)
          .filter(f => !currentFeatures.includes(f))
      : []

    return {
      currentFeatures,
      nextTierFeatures,
      isLoading: false,
    }
  }, [userTier, isLoading])
}
