'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  ArrowRight,
  Zap,
  Star,
  AlertCircle,
  BookOpen,
  ExternalLink,
} from 'lucide-react'

export interface HealthInsight {
  id: string
  type: 'strength' | 'weakness' | 'opportunity' | 'risk' | 'recommendation'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact?: string
  actionable?: boolean
  category:
    | 'financial'
    | 'growth'
    | 'operational'
    | 'sale_readiness'
    | 'overall'
  timeframe?: 'immediate' | 'short_term' | 'long_term'
  resources?: {
    title: string
    url: string
    type: 'article' | 'tool' | 'service'
  }[]
}

export interface HealthInsightsData {
  overallSummary: string
  keyStrengths: HealthInsight[]
  keyWeaknesses: HealthInsight[]
  recommendations: HealthInsight[]
  opportunities: HealthInsight[]
  risks: HealthInsight[]
  confidenceLevel?: number
  dataQuality?: 'high' | 'medium' | 'low'
}

interface HealthInsightsProps {
  data: HealthInsightsData
  className?: string
  interactive?: boolean
  onActionClick?: (insight: HealthInsight) => void
}

function getInsightIcon(type: HealthInsight['type'], size = 'w-4 h-4') {
  switch (type) {
    case 'strength':
      return (
        <CheckCircle
          className={cn(size, 'text-green-600 dark:text-green-400')}
        />
      )
    case 'weakness':
      return (
        <AlertTriangle className={cn(size, 'text-red-600 dark:text-red-400')} />
      )
    case 'opportunity':
      return (
        <TrendingUp className={cn(size, 'text-blue-600 dark:text-blue-400')} />
      )
    case 'risk':
      return (
        <AlertCircle
          className={cn(size, 'text-orange-600 dark:text-orange-400')}
        />
      )
    case 'recommendation':
      return (
        <Lightbulb
          className={cn(size, 'text-yellow-600 dark:text-yellow-400')}
        />
      )
    default:
      return <Target className={cn(size, 'text-muted-foreground')} />
  }
}

function getPriorityBadge(priority: HealthInsight['priority']) {
  const variants = {
    high: 'destructive',
    medium: 'secondary',
    low: 'outline',
  } as const

  return (
    <Badge variant={variants[priority]} className="text-xs">
      {priority} priority
    </Badge>
  )
}

function getCategoryColor(category: HealthInsight['category']) {
  const colors = {
    financial: 'text-green-600 dark:text-green-400',
    growth: 'text-blue-600 dark:text-blue-400',
    operational: 'text-orange-600 dark:text-orange-400',
    sale_readiness: 'text-purple-600 dark:text-purple-400',
    overall: 'text-gray-600 dark:text-gray-400',
  }

  return colors[category] || colors.overall
}

function getTimeframeBadge(timeframe?: HealthInsight['timeframe']) {
  if (!timeframe) return null

  const config = {
    immediate: { label: 'Now', variant: 'destructive' as const },
    short_term: { label: '1-3 months', variant: 'secondary' as const },
    long_term: { label: '3+ months', variant: 'outline' as const },
  }

  const { label, variant } = config[timeframe]

  return (
    <Badge variant={variant} className="text-xs">
      {label}
    </Badge>
  )
}

function InsightCard({
  insight,
  interactive = false,
  onActionClick,
}: {
  insight: HealthInsight
  interactive?: boolean
  onActionClick?: (insight: HealthInsight) => void
}) {
  return (
    <div className="group p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {getInsightIcon(insight.type, 'w-5 h-5')}
          <div className="space-y-2 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-foreground leading-tight">
                {insight.title}
              </h4>
              <div className="flex items-center gap-1">
                {getPriorityBadge(insight.priority)}
                {getTimeframeBadge(insight.timeframe)}
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {insight.description}
            </p>

            {insight.impact && (
              <div className="flex items-center gap-2 text-xs">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-muted-foreground">
                  Impact: {insight.impact}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs capitalize',
                  getCategoryColor(insight.category)
                )}
              >
                {insight.category.replace('_', ' ')}
              </Badge>

              {insight.actionable && (
                <Badge variant="secondary" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Actionable
                </Badge>
              )}
            </div>

            {/* Resources */}
            {insight.resources && insight.resources.length > 0 && (
              <div className="space-y-1 pt-2 border-t">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Resources:
                </span>
                <div className="flex flex-wrap gap-1">
                  {insight.resources.map((resource, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs hover:bg-accent/50"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      {resource.title}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {interactive && insight.actionable && onActionClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onActionClick(insight)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function HealthInsights({
  data,
  className,
  interactive = true,
  onActionClick,
}: HealthInsightsProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Business Health Insights
            </CardTitle>
            <CardDescription>
              AI-powered analysis and recommendations for your business
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {data.dataQuality && (
              <Badge
                variant={
                  data.dataQuality === 'high'
                    ? 'default'
                    : data.dataQuality === 'medium'
                      ? 'secondary'
                      : 'outline'
                }
                className="text-xs"
              >
                {data.dataQuality} data quality
              </Badge>
            )}

            {data.confidenceLevel && (
              <Badge variant="outline" className="text-xs">
                {Math.round(data.confidenceLevel)}% confidence
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Summary */}
        <Alert>
          <Target className="w-4 h-4" />
          <AlertDescription className="text-sm leading-relaxed">
            {data.overallSummary}
          </AlertDescription>
        </Alert>

        {/* Key Strengths */}
        {data.keyStrengths.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-foreground">Key Strengths</h3>
              <Badge variant="secondary" className="text-xs">
                {data.keyStrengths.length}
              </Badge>
            </div>
            <div className="grid gap-3">
              {data.keyStrengths.map((insight, index) => (
                <InsightCard
                  key={index}
                  insight={insight}
                  interactive={interactive}
                  onActionClick={onActionClick}
                />
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Key Weaknesses */}
        {data.keyWeaknesses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-foreground">
                Areas for Improvement
              </h3>
              <Badge variant="secondary" className="text-xs">
                {data.keyWeaknesses.length}
              </Badge>
            </div>
            <div className="grid gap-3">
              {data.keyWeaknesses.map((insight, index) => (
                <InsightCard
                  key={index}
                  insight={insight}
                  interactive={interactive}
                  onActionClick={onActionClick}
                />
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-foreground">
                Recommended Actions
              </h3>
              <Badge variant="secondary" className="text-xs">
                {data.recommendations.length}
              </Badge>
            </div>
            <div className="grid gap-3">
              {data.recommendations.map((insight, index) => (
                <InsightCard
                  key={index}
                  insight={insight}
                  interactive={interactive}
                  onActionClick={onActionClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Opportunities */}
        {data.opportunities.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-foreground">
                  Growth Opportunities
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {data.opportunities.length}
                </Badge>
              </div>
              <div className="grid gap-3">
                {data.opportunities.map((insight, index) => (
                  <InsightCard
                    key={index}
                    insight={insight}
                    interactive={interactive}
                    onActionClick={onActionClick}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Risks */}
        {data.risks.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h3 className="font-semibold text-foreground">Risk Factors</h3>
                <Badge variant="secondary" className="text-xs">
                  {data.risks.length}
                </Badge>
              </div>
              <div className="grid gap-3">
                {data.risks.map((insight, index) => (
                  <InsightCard
                    key={index}
                    insight={insight}
                    interactive={interactive}
                    onActionClick={onActionClick}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default HealthInsights
