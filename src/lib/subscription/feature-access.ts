import { SubscriptionTier, UserType } from '@prisma/client'
import { getSubscriptionTierConfig } from './subscription-tiers'

export interface FeaturePermission {
  feature: string
  allowedTiers: SubscriptionTier[]
  allowedUserTypes?: UserType[]
  description: string
}

// Define all feature permissions in the system
export const FEATURE_PERMISSIONS: Record<string, FeaturePermission> = {
  'ai-financial-analysis': {
    feature: 'ai-financial-analysis',
    allowedTiers: [
      SubscriptionTier.FREE,
      SubscriptionTier.PROFESSIONAL,
      SubscriptionTier.ENTERPRISE,
    ],
    description: 'Basic AI-powered financial health analysis',
  },
  'advanced-ai-analysis': {
    feature: 'advanced-ai-analysis',
    allowedTiers: [SubscriptionTier.PROFESSIONAL, SubscriptionTier.ENTERPRISE],
    description: 'Advanced AI analysis with detailed insights and forecasting',
  },
  'custom-report-generation': {
    feature: 'custom-report-generation',
    allowedTiers: [SubscriptionTier.PROFESSIONAL, SubscriptionTier.ENTERPRISE],
    description: 'Generate custom business analysis reports',
  },
  'white-label-reports': {
    feature: 'white-label-reports',
    allowedTiers: [SubscriptionTier.ENTERPRISE],
    description: 'White-label reports with custom branding',
  },
  'api-access': {
    feature: 'api-access',
    allowedTiers: [SubscriptionTier.ENTERPRISE],
    description: 'API access for integrations',
  },
  'priority-support': {
    feature: 'priority-support',
    allowedTiers: [SubscriptionTier.PROFESSIONAL, SubscriptionTier.ENTERPRISE],
    description: 'Priority customer support',
  },
  'portfolio-management': {
    feature: 'portfolio-management',
    allowedTiers: [
      SubscriptionTier.FREE,
      SubscriptionTier.PROFESSIONAL,
      SubscriptionTier.ENTERPRISE,
    ],
    description: 'Manage business portfolios',
  },
  'advanced-portfolio': {
    feature: 'advanced-portfolio',
    allowedTiers: [SubscriptionTier.ENTERPRISE],
    description: 'Advanced portfolio management with unlimited businesses',
  },
  'real-time-alerts': {
    feature: 'real-time-alerts',
    allowedTiers: [SubscriptionTier.ENTERPRISE],
    description: 'Real-time business health alerts and notifications',
  },
  'bulk-analysis': {
    feature: 'bulk-analysis',
    allowedTiers: [SubscriptionTier.PROFESSIONAL, SubscriptionTier.ENTERPRISE],
    description: 'Analyze multiple businesses at once',
  },
  'data-export': {
    feature: 'data-export',
    allowedTiers: [SubscriptionTier.PROFESSIONAL, SubscriptionTier.ENTERPRISE],
    description: 'Export business data and analysis results',
  },
  'admin-panel': {
    feature: 'admin-panel',
    allowedTiers: [
      SubscriptionTier.FREE,
      SubscriptionTier.PROFESSIONAL,
      SubscriptionTier.ENTERPRISE,
    ],
    allowedUserTypes: [UserType.ADMIN],
    description: 'Access to admin panel (admin users only)',
  },
  'broker-tools': {
    feature: 'broker-tools',
    allowedTiers: [SubscriptionTier.PROFESSIONAL, SubscriptionTier.ENTERPRISE],
    allowedUserTypes: [UserType.BROKER],
    description: 'Specialized tools for business brokers',
  },
  'multi-user-management': {
    feature: 'multi-user-management',
    allowedTiers: [SubscriptionTier.ENTERPRISE],
    allowedUserTypes: [UserType.BUSINESS_OWNER, UserType.ADMIN],
    description: 'Manage multiple users and permissions',
  },
}

export class FeatureAccessControl {
  /**
   * Check if user has access to a specific feature
   */
  static hasFeatureAccess(
    userTier: SubscriptionTier,
    userType: UserType,
    feature: string
  ): boolean {
    const permission = FEATURE_PERMISSIONS[feature]

    if (!permission) {
      console.warn(`Feature '${feature}' not found in permissions`)
      return false
    }

    // Check tier access
    const hasTierAccess = permission.allowedTiers.includes(userTier)
    if (!hasTierAccess) {
      return false
    }

    // Check user type access if specified
    if (permission.allowedUserTypes) {
      const hasUserTypeAccess = permission.allowedUserTypes.includes(userType)
      if (!hasUserTypeAccess) {
        return false
      }
    }

    return true
  }

  /**
   * Get all features accessible to user
   */
  static getAccessibleFeatures(
    userTier: SubscriptionTier,
    userType: UserType
  ): string[] {
    return Object.keys(FEATURE_PERMISSIONS).filter(feature =>
      this.hasFeatureAccess(userTier, userType, feature)
    )
  }

  /**
   * Get feature permission details
   */
  static getFeaturePermission(feature: string): FeaturePermission | null {
    return FEATURE_PERMISSIONS[feature] || null
  }

  /**
   * Get all available features by tier
   */
  static getFeaturesByTier(tier: SubscriptionTier): FeaturePermission[] {
    return Object.values(FEATURE_PERMISSIONS).filter(permission =>
      permission.allowedTiers.includes(tier)
    )
  }

  /**
   * Check if user can perform action with usage limits
   */
  static async canPerformAction(
    userTier: SubscriptionTier,
    userType: UserType,
    feature: string,
    currentUsage: number
  ): Promise<{ allowed: boolean; reason?: string }> {
    // First check feature access
    if (!this.hasFeatureAccess(userTier, userType, feature)) {
      return {
        allowed: false,
        reason: `Feature '${feature}' not available in ${userTier} tier`,
      }
    }

    // Check usage limits for specific features
    const tierConfig = getSubscriptionTierConfig(userTier)

    if (
      feature === 'ai-financial-analysis' ||
      feature === 'advanced-ai-analysis'
    ) {
      const limit = tierConfig.limits.aiAnalysesPerMonth
      if (limit !== -1 && currentUsage >= limit) {
        return {
          allowed: false,
          reason: `Monthly AI analysis limit (${limit}) exceeded`,
        }
      }
    }

    if (feature === 'custom-report-generation') {
      const limit = tierConfig.limits.reportGeneration
      if (limit !== -1 && currentUsage >= limit) {
        return {
          allowed: false,
          reason: `Monthly report generation limit (${limit}) exceeded`,
        }
      }
    }

    return { allowed: true }
  }

  /**
   * Get upgrade suggestions for locked features
   */
  static getUpgradeSuggestion(
    currentTier: SubscriptionTier,
    feature: string
  ): { suggestedTier: SubscriptionTier | null; reason: string } {
    const permission = FEATURE_PERMISSIONS[feature]

    if (!permission) {
      return { suggestedTier: null, reason: 'Feature not found' }
    }

    // Find the minimum tier that allows this feature
    const tierOrder = [
      SubscriptionTier.FREE,
      SubscriptionTier.PROFESSIONAL,
      SubscriptionTier.ENTERPRISE,
    ]
    const currentTierIndex = tierOrder.indexOf(currentTier)

    for (let i = currentTierIndex + 1; i < tierOrder.length; i++) {
      const tier = tierOrder[i]
      if (permission.allowedTiers.includes(tier)) {
        return {
          suggestedTier: tier,
          reason: `Upgrade to ${tier} to access ${permission.description}`,
        }
      }
    }

    return {
      suggestedTier: null,
      reason: 'Feature not available in any tier',
    }
  }

  /**
   * Validate feature access for API endpoints
   */
  static validateAPIAccess(
    userTier: SubscriptionTier,
    userType: UserType,
    requiredFeature: string
  ): { valid: boolean; error?: string; upgradeInfo?: any } {
    const hasAccess = this.hasFeatureAccess(userTier, userType, requiredFeature)

    if (!hasAccess) {
      const upgrade = this.getUpgradeSuggestion(userTier, requiredFeature)
      return {
        valid: false,
        error: `Access denied: ${requiredFeature} requires ${upgrade.suggestedTier || 'higher'} tier`,
        upgradeInfo: upgrade,
      }
    }

    return { valid: true }
  }
}
