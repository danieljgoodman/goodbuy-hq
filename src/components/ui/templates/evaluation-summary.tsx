'use client'

import * as React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type {
  BusinessData,
  BusinessMetrics,
  BusinessInsight,
} from '@/types/business'

/**
 * Valuation data structure for business evaluation
 */
export interface ValuationData {
  estimatedValue: number
  valuationRange: {
    low: number
    high: number
  }
  method: string
  confidence: number
  lastUpdated: Date
}

/**
 * Risk assessment data structure
 */
export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high'
  riskScore: number
  riskFactors: {
    category: string
    level: 'low' | 'medium' | 'high'
    description: string
  }[]
}

/**
 * Props for EvaluationSummary component
 */
export interface EvaluationSummaryProps {
  /** Business data */
  business: BusinessData
  /** Business financial metrics */
  metrics: BusinessMetrics
  /** Valuation information */
  valuation: ValuationData
  /** Risk assessment data */
  riskAssessment: RiskAssessment
  /** Business insights */
  insights?: BusinessInsight[]
  /** Layout variant */
  variant?: 'compact' | 'detailed' | 'dashboard'
  /** Whether to show detailed breakdown */
  showBreakdown?: boolean
  /** Custom CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
}

/**
 * EvaluationSummary Component
 *
 * Comprehensive business evaluation summary component for GoodBuy HQ platform.
 * Displays valuation, risk assessment, financial metrics, and key insights
 * in a professional, easy-to-digest format.
 *
 * Features:
 * - Business valuation with confidence indicators
 * - Risk assessment with visual indicators
 * - Financial metrics dashboard
 * - Key insights and recommendations
 * - Multiple layout variants for different contexts
 * - Loading states and error handling
 *
 * @example
 * ```tsx
 * <EvaluationSummary
 *   business={businessData}
 *   metrics={businessMetrics}
 *   valuation={valuationData}
 *   riskAssessment={riskData}
 *   insights={businessInsights}
 *   variant="detailed"
 *   showBreakdown={true}
 * />
 * ```
 */
export function EvaluationSummary({
  business,
  metrics,
  valuation,
  riskAssessment,
  insights,
  variant = 'detailed',
  showBreakdown = true,
  className,
  isLoading = false,
}: EvaluationSummaryProps) {
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format percentage values
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  // Get risk color based on level
  const getRiskColor = (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-muted animate-pulse rounded" />
                <div className="h-16 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Business Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Business Evaluation Summary
          </CardTitle>
          <CardDescription>
            {business.businessName} • {business.industry} • {business.location}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Valuation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Business Valuation
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                getConfidenceColor(valuation.confidence)
              )}
            >
              {valuation.confidence}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-primary mb-2">
                {formatCurrency(valuation.estimatedValue)}
              </div>
              <div className="text-sm text-muted-foreground">
                Range: {formatCurrency(valuation.valuationRange.low)} -{' '}
                {formatCurrency(valuation.valuationRange.high)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Method: {valuation.method} • Updated:{' '}
                {valuation.lastUpdated.toLocaleDateString()}
              </div>
            </div>

            {showBreakdown && variant === 'detailed' && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3">
                  Valuation Confidence
                </h4>
                <Progress value={valuation.confidence} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  Based on financial data completeness, market comparables, and
                  business metrics
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Risk Assessment
            <Badge className={getRiskColor(riskAssessment.overallRisk)}>
              {riskAssessment.overallRisk.toUpperCase()} RISK
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="text-2xl font-bold mb-2">
                {riskAssessment.riskScore}/100
              </div>
              <Progress
                value={riskAssessment.riskScore}
                className={cn(
                  'h-2',
                  riskAssessment.riskScore <= 30 && '[&>div]:bg-green-500',
                  riskAssessment.riskScore > 30 &&
                    riskAssessment.riskScore <= 70 &&
                    '[&>div]:bg-yellow-500',
                  riskAssessment.riskScore > 70 && '[&>div]:bg-red-500'
                )}
              />
            </div>

            {showBreakdown && riskAssessment.riskFactors.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3">Risk Factors</h4>
                <div className="space-y-2">
                  {riskAssessment.riskFactors.map((factor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {factor.category}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {factor.description}
                        </div>
                      </div>
                      <Badge size="sm" className={getRiskColor(factor.level)}>
                        {factor.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Financial Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.profitMargin && (
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatPercentage(metrics.profitMargin)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Profit Margin
                </div>
              </div>
            )}

            {metrics.revenueGrowthRate && (
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {formatPercentage(metrics.revenueGrowthRate)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Revenue Growth
                </div>
              </div>
            )}

            {metrics.returnOnInvestment && (
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {formatPercentage(metrics.returnOnInvestment)}
                </div>
                <div className="text-xs text-muted-foreground">ROI</div>
              </div>
            )}

            {business.annualRevenue && (
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {formatCurrency(business.annualRevenue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Annual Revenue
                </div>
              </div>
            )}

            {metrics.currentRatio && (
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {metrics.currentRatio.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Current Ratio
                </div>
              </div>
            )}

            {metrics.customerLifetimeValue && (
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-teal-600 mb-1">
                  {formatCurrency(metrics.customerLifetimeValue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Customer LTV
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Key Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="border-l-4 border-primary/20 pl-4 py-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        insight.priority === 'high'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {insight.priority} priority
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {insight.category}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {insight.insight}
                  </div>
                  {insight.recommendation && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    <strong>Expected Impact:</strong> {insight.impact}
                    {insight.timeline && ` • Timeline: ${insight.timeline}`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            This evaluation was generated using GoodBuy HQ's proprietary
            business analysis algorithms.
            <br />
            For detailed analysis and professional consultation, contact our
            acquisition specialists.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EvaluationSummary
