'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
} from 'lucide-react'

export interface HealthScoreData {
  score: number
  label: string
  description: string
  trend?: 'up' | 'down' | 'stable' | 'volatile'
  confidence?: number
  benchmark?: number
  change?: number
  status?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
}

interface HealthScoreCardProps {
  data: HealthScoreData
  size?: 'sm' | 'md' | 'lg'
  showBenchmark?: boolean
  showTrend?: boolean
  className?: string
  interactive?: boolean
}

function getScoreStatus(score: number): HealthScoreData['status'] {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  if (score >= 40) return 'poor'
  return 'critical'
}

function getScoreColor(status: HealthScoreData['status']) {
  switch (status) {
    case 'excellent':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'good':
      return 'text-green-600 dark:text-green-400'
    case 'fair':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'poor':
      return 'text-orange-600 dark:text-orange-400'
    case 'critical':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-muted-foreground'
  }
}

function getProgressColor(status: HealthScoreData['status']) {
  switch (status) {
    case 'excellent':
      return 'bg-emerald-500'
    case 'good':
      return 'bg-green-500'
    case 'fair':
      return 'bg-yellow-500'
    case 'poor':
      return 'bg-orange-500'
    case 'critical':
      return 'bg-red-500'
    default:
      return 'bg-primary'
  }
}

function getStatusIcon(
  status: HealthScoreData['status'],
  size: 'sm' | 'md' | 'lg' = 'md'
) {
  const iconSize =
    size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'

  switch (status) {
    case 'excellent':
      return (
        <CheckCircle
          className={cn(iconSize, 'text-emerald-600 dark:text-emerald-400')}
        />
      )
    case 'good':
      return (
        <CheckCircle
          className={cn(iconSize, 'text-green-600 dark:text-green-400')}
        />
      )
    case 'fair':
      return (
        <Info
          className={cn(iconSize, 'text-yellow-600 dark:text-yellow-400')}
        />
      )
    case 'poor':
      return (
        <AlertTriangle
          className={cn(iconSize, 'text-orange-600 dark:text-orange-400')}
        />
      )
    case 'critical':
      return (
        <AlertTriangle
          className={cn(iconSize, 'text-red-600 dark:text-red-400')}
        />
      )
    default:
      return <Info className={cn(iconSize, 'text-muted-foreground')} />
  }
}

function getTrendIcon(
  trend: HealthScoreData['trend'],
  size: 'sm' | 'md' | 'lg' = 'md'
) {
  const iconSize =
    size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'

  switch (trend) {
    case 'up':
      return (
        <TrendingUp
          className={cn(iconSize, 'text-green-600 dark:text-green-400')}
        />
      )
    case 'down':
      return (
        <TrendingDown
          className={cn(iconSize, 'text-red-600 dark:text-red-400')}
        />
      )
    case 'volatile':
      return (
        <AlertTriangle
          className={cn(iconSize, 'text-yellow-600 dark:text-yellow-400')}
        />
      )
    case 'stable':
    default:
      return <Minus className={cn(iconSize, 'text-muted-foreground')} />
  }
}

export function HealthScoreCard({
  data,
  size = 'md',
  showBenchmark = true,
  showTrend = true,
  className,
  interactive = false,
}: HealthScoreCardProps) {
  const status = data.status || getScoreStatus(data.score)
  const scoreColor = getScoreColor(status)
  const progressColor = getProgressColor(status)

  const cardSizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const scoreSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200 border-0 shadow-sm bg-card/50 backdrop-blur-sm',
        interactive && 'hover:shadow-md hover:bg-card/80 cursor-pointer',
        className
      )}
      role="region"
      aria-label={`Health score for ${data.label}`}
    >
      <CardHeader className={cn('pb-2', cardSizeClasses[size])}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status, size)}
            <CardTitle
              className={cn(
                'font-semibold text-foreground',
                titleSizeClasses[size]
              )}
            >
              {data.label}
            </CardTitle>
          </div>

          {showTrend && data.trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon(data.trend, size)}
              {data.change && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    data.change > 0
                      ? 'text-green-600 dark:text-green-400'
                      : data.change < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-muted-foreground'
                  )}
                >
                  {data.change > 0 ? '+' : ''}
                  {data.change}%
                </span>
              )}
            </div>
          )}
        </div>

        <CardDescription className="text-xs text-muted-foreground leading-tight">
          {data.description}
        </CardDescription>
      </CardHeader>

      <CardContent className={cn('space-y-3', cardSizeClasses[size], 'pt-0')}>
        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  'font-bold tabular-nums',
                  scoreSizeClasses[size],
                  scoreColor
                )}
              >
                {Math.round(data.score)}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                /100
              </span>
            </div>

            {data.confidence && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  Confidence:
                </span>
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0.5 h-auto"
                >
                  {Math.round(data.confidence)}%
                </Badge>
              </div>
            )}
          </div>

          <Badge
            variant="secondary"
            className={cn('text-xs font-medium capitalize', scoreColor)}
          >
            {status}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative">
            <Progress
              value={data.score}
              className="h-2 bg-muted/50"
              aria-label={`${data.label} score: ${data.score} out of 100`}
            />
            <div
              className={cn(
                'absolute top-0 left-0 h-2 rounded-full transition-all',
                progressColor
              )}
              style={{ width: `${Math.min(data.score, 100)}%` }}
            />
          </div>

          {/* Benchmark Indicator */}
          {showBenchmark && data.benchmark && (
            <div className="relative">
              <div
                className="absolute top-0 w-0.5 h-2 bg-foreground/40 -translate-y-2"
                style={{ left: `${Math.min(data.benchmark, 100)}%` }}
                aria-label={`Industry benchmark: ${data.benchmark}`}
              />
              <div className="flex items-center gap-1 mt-1">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Industry avg: {Math.round(data.benchmark)}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default HealthScoreCard
