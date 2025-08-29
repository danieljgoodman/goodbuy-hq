'use client'

import * as React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BusinessData, BusinessMetrics } from '@/types/business'

/**
 * Props for BusinessCard component
 * Used throughout GoodBuy HQ platform for displaying business listings
 */
export interface BusinessCardProps {
  /** Business data containing core information */
  business: BusinessData
  /** Optional business metrics for enhanced display */
  metrics?: BusinessMetrics
  /** Visual variant for different contexts */
  variant?: 'default' | 'featured' | 'compact' | 'detailed'
  /** Whether to show action buttons */
  showActions?: boolean
  /** Whether to show financial metrics */
  showMetrics?: boolean
  /** Custom CSS classes */
  className?: string
  /** Click handler for card interaction */
  onCardClick?: () => void
  /** Handler for inquiry button */
  onInquiry?: () => void
  /** Handler for favorite/bookmark action */
  onFavorite?: () => void
  /** Whether business is favorited */
  isFavorited?: boolean
  /** Loading state */
  isLoading?: boolean
}

/**
 * BusinessCard Component
 *
 * A comprehensive business listing card component designed for GoodBuy HQ's
 * business acquisition marketplace. Displays essential business information,
 * metrics, and actions in a clean, professional format.
 *
 * Features:
 * - Multiple display variants (default, featured, compact, detailed)
 * - Financial metrics integration
 * - Action buttons for inquiries and favorites
 * - Responsive design with professional aesthetics
 * - Loading states and error handling
 *
 * @example
 * ```tsx
 * <BusinessCard
 *   business={businessData}
 *   metrics={businessMetrics}
 *   variant="featured"
 *   showActions={true}
 *   showMetrics={true}
 *   onInquiry={() => handleInquiry(business.id)}
 *   onFavorite={() => toggleFavorite(business.id)}
 * />
 * ```
 */
export function BusinessCard({
  business,
  metrics,
  variant = 'default',
  showActions = true,
  showMetrics = true,
  className,
  onCardClick,
  onInquiry,
  onFavorite,
  isFavorited = false,
  isLoading = false,
}: BusinessCardProps) {
  // Format currency values for display
  const formatCurrency = (value: number | undefined): string => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value >= 1000000 ? 'compact' : 'standard',
    }).format(value)
  }

  // Format percentage values
  const formatPercentage = (value: number | undefined): string => {
    if (!value) return 'N/A'
    return `${value.toFixed(1)}%`
  }

  // Determine card styling based on variant
  const getCardClassName = () => {
    const baseClasses = 'transition-all duration-200 hover:shadow-md'

    switch (variant) {
      case 'featured':
        return cn(
          baseClasses,
          'border-primary/20 bg-gradient-to-br from-primary/5 to-background ring-1 ring-primary/10',
          className
        )
      case 'compact':
        return cn(baseClasses, 'py-4', className)
      case 'detailed':
        return cn(baseClasses, 'py-8', className)
      default:
        return cn(baseClasses, className)
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={getCardClassName()}>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={getCardClassName()}
      onClick={onCardClick}
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
              {business.businessName}
            </CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              {business.industry} •{' '}
              {business.location || 'Location not specified'}
            </CardDescription>
          </div>
          {variant === 'featured' && (
            <CardAction>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Featured
              </Badge>
            </CardAction>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Business Description */}
        {business.description && variant !== 'compact' && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {business.description}
          </p>
        )}

        {/* Key Business Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {business.yearsInOperation && (
            <div>
              <span className="text-muted-foreground">Years Operating:</span>
              <span className="ml-2 font-medium">
                {business.yearsInOperation}
              </span>
            </div>
          )}
          {business.employees && (
            <div>
              <span className="text-muted-foreground">Employees:</span>
              <span className="ml-2 font-medium">{business.employees}</span>
            </div>
          )}
        </div>

        {/* Financial Metrics */}
        {showMetrics &&
          (business.annualRevenue || business.monthlyProfit || metrics) && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-foreground mb-2">
                Financial Overview
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {business.annualRevenue && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Annual Revenue:
                    </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(business.annualRevenue)}
                    </span>
                  </div>
                )}
                {business.monthlyProfit && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Monthly Profit:
                    </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(business.monthlyProfit)}
                    </span>
                  </div>
                )}
                {metrics?.profitMargin && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Profit Margin:
                    </span>
                    <span className="font-medium">
                      {formatPercentage(metrics.profitMargin)}
                    </span>
                  </div>
                )}
                {metrics?.revenueGrowthRate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Growth Rate:</span>
                    <span className="font-medium text-blue-600">
                      {formatPercentage(metrics.revenueGrowthRate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Business Highlights */}
        {business.uniqueSellingPoints &&
          business.uniqueSellingPoints.length > 0 &&
          variant === 'detailed' && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-foreground mb-2">
                Key Strengths
              </h4>
              <div className="flex flex-wrap gap-1">
                {business.uniqueSellingPoints
                  .slice(0, 3)
                  .map((point, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {point}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
      </CardContent>

      {/* Action Buttons */}
      {showActions && (
        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              onClick={e => {
                e.stopPropagation()
                onInquiry?.()
              }}
              className="flex-1 sm:flex-none"
            >
              Send Inquiry
            </Button>
            {onFavorite && (
              <Button
                variant="outline"
                size="icon"
                onClick={e => {
                  e.stopPropagation()
                  onFavorite()
                }}
                className={cn(
                  'shrink-0',
                  isFavorited &&
                    'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                )}
                aria-label={
                  isFavorited ? 'Remove from favorites' : 'Add to favorites'
                }
              >
                <svg
                  className="h-4 w-4"
                  fill={isFavorited ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </Button>
            )}
          </div>

          {variant === 'detailed' && (
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

export default BusinessCard
