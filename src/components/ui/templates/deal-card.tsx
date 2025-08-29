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
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { BusinessData } from '@/types/business'

/**
 * Deal status types for business acquisition deals
 */
export type DealStatus =
  | 'lead'
  | 'qualified'
  | 'negotiation'
  | 'due-diligence'
  | 'closing'
  | 'closed'
  | 'canceled'

/**
 * Deal priority levels
 */
export type DealPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * Deal data structure for business acquisitions
 */
export interface DealData {
  id: string
  business: BusinessData
  status: DealStatus
  priority: DealPriority
  askingPrice: number
  negotiatedPrice?: number
  daysActive: number
  lastActivity: Date
  buyerInterest: number // 0-100
  dealProgress: number // 0-100
  assignedBroker?: {
    name: string
    email: string
    phone?: string
  }
  tags?: string[]
  notes?: string
  estimatedCloseDate?: Date
}

/**
 * Props for DealCard component
 */
export interface DealCardProps {
  /** Deal data */
  deal: DealData
  /** Card display variant */
  variant?: 'default' | 'compact' | 'detailed' | 'pipeline'
  /** Whether to show action buttons */
  showActions?: boolean
  /** Whether to show progress indicators */
  showProgress?: boolean
  /** Custom CSS classes */
  className?: string
  /** Click handler for card */
  onCardClick?: () => void
  /** Handler for deal status update */
  onStatusChange?: (newStatus: DealStatus) => void
  /** Handler for priority change */
  onPriorityChange?: (newPriority: DealPriority) => void
  /** Handler for viewing deal details */
  onViewDetails?: () => void
  /** Handler for contacting broker */
  onContactBroker?: () => void
  /** Loading state */
  isLoading?: boolean
}

/**
 * DealCard Component
 *
 * Professional deal tracking card component for GoodBuy HQ's business
 * acquisition pipeline. Displays deal information, progress, and actions
 * in a clean, actionable format for brokers and acquisition specialists.
 *
 * Features:
 * - Deal status tracking with visual indicators
 * - Progress visualization for pipeline management
 * - Priority levels with color coding
 * - Broker assignment and contact information
 * - Action buttons for deal management
 * - Multiple layout variants for different contexts
 *
 * @example
 * ```tsx
 * <DealCard
 *   deal={dealData}
 *   variant="pipeline"
 *   showActions={true}
 *   showProgress={true}
 *   onStatusChange={handleStatusChange}
 *   onViewDetails={() => navigateToDeal(deal.id)}
 * />
 * ```
 */
export function DealCard({
  deal,
  variant = 'default',
  showActions = true,
  showProgress = true,
  className,
  onCardClick,
  onStatusChange,
  onPriorityChange,
  onViewDetails,
  onContactBroker,
  isLoading = false,
}: DealCardProps) {
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Get status configuration
  const getStatusConfig = (status: DealStatus) => {
    const configs = {
      lead: {
        label: 'Lead',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      qualified: {
        label: 'Qualified',
        color: 'bg-green-50 text-green-700 border-green-200',
      },
      negotiation: {
        label: 'Negotiation',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
      'due-diligence': {
        label: 'Due Diligence',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      closing: {
        label: 'Closing',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
      },
      closed: {
        label: 'Closed',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
      canceled: {
        label: 'Canceled',
        color: 'bg-red-50 text-red-700 border-red-200',
      },
    }
    return configs[status]
  }

  // Get priority configuration
  const getPriorityConfig = (priority: DealPriority) => {
    const configs = {
      low: { label: 'Low', color: 'bg-gray-50 text-gray-600 border-gray-200' },
      medium: {
        label: 'Medium',
        color: 'bg-blue-50 text-blue-600 border-blue-200',
      },
      high: {
        label: 'High',
        color: 'bg-orange-50 text-orange-600 border-orange-200',
      },
      urgent: {
        label: 'Urgent',
        color: 'bg-red-50 text-red-600 border-red-200',
      },
    }
    return configs[priority]
  }

  // Calculate deal age styling
  const getDealAgeStyle = (days: number): string => {
    if (days <= 7) return 'text-green-600'
    if (days <= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Get buyer interest styling
  const getBuyerInterestStyle = (interest: number): string => {
    if (interest >= 80) return 'text-green-600'
    if (interest >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusConfig = getStatusConfig(deal.status)
  const priorityConfig = getPriorityConfig(deal.priority)

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer',
        deal.priority === 'urgent' && 'ring-2 ring-red-200 border-red-200',
        className
      )}
      onClick={onCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground truncate">
              {deal.business.businessName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {deal.business.industry} • {deal.business.location}
              {deal.assignedBroker && (
                <span className="text-xs">• {deal.assignedBroker.name}</span>
              )}
            </CardDescription>
          </div>
          <CardAction>
            <div className="flex flex-col gap-1 items-end">
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              <Badge className={priorityConfig.color} variant="outline">
                {priorityConfig.label}
              </Badge>
            </div>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Deal Financials */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Asking Price</div>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(deal.askingPrice)}
            </div>
          </div>
          {deal.negotiatedPrice && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Negotiated</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(deal.negotiatedPrice)}
              </div>
            </div>
          )}
        </div>

        {/* Deal Metrics */}
        <div className="grid grid-cols-3 gap-4 py-3 border-t border-b">
          <div className="text-center">
            <div
              className={cn(
                'text-lg font-semibold',
                getDealAgeStyle(deal.daysActive)
              )}
            >
              {deal.daysActive}
            </div>
            <div className="text-xs text-muted-foreground">Days Active</div>
          </div>
          <div className="text-center">
            <div
              className={cn(
                'text-lg font-semibold',
                getBuyerInterestStyle(deal.buyerInterest)
              )}
            >
              {deal.buyerInterest}%
            </div>
            <div className="text-xs text-muted-foreground">Buyer Interest</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {deal.dealProgress}%
            </div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Deal Progress</span>
              <span className="text-sm text-muted-foreground">
                {deal.dealProgress}%
              </span>
            </div>
            <Progress value={deal.dealProgress} className="h-2" />
          </div>
        )}

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && variant !== 'compact' && (
          <div className="flex flex-wrap gap-1">
            {deal.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {deal.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{deal.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Business Highlights */}
        {variant === 'detailed' && (
          <div className="space-y-2">
            {deal.business.annualRevenue && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Annual Revenue:</span>
                <span className="font-medium">
                  {formatCurrency(deal.business.annualRevenue)}
                </span>
              </div>
            )}
            {deal.business.employees && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Employees:</span>
                <span className="font-medium">{deal.business.employees}</span>
              </div>
            )}
            {deal.estimatedCloseDate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Close:</span>
                <span className="font-medium">
                  {deal.estimatedCloseDate.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {deal.notes && variant === 'detailed' && (
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Notes
            </div>
            <div className="text-sm line-clamp-2">{deal.notes}</div>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={e => {
                e.stopPropagation()
                onViewDetails?.()
              }}
            >
              View Details
            </Button>
            {deal.assignedBroker && onContactBroker && (
              <Button
                variant="outline"
                size="sm"
                onClick={e => {
                  e.stopPropagation()
                  onContactBroker()
                }}
              >
                Contact Broker
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Updated: {deal.lastActivity.toLocaleDateString()}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

export default DealCard
