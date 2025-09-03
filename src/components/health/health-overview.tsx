'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Zap,
} from 'lucide-react'

import { HealthScoreCard, type HealthScoreData } from './health-score-card'
import { HealthCharts, type HealthMetricData } from './health-charts'
import { HealthInsights, type HealthInsightsData } from './health-insights'

export interface BusinessHealthData {
  businessId: string
  businessName: string
  calculatedAt: string
  overallScore: number
  growthScore: number
  operationalScore: number
  financialScore: number
  saleReadinessScore: number
  confidenceLevel?: number
  trajectory?: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE'
  dataSources?: {
    financial: boolean
    operational: boolean
    market: boolean
    historical: boolean
  }
  calculationMetadata?: {
    calculationDuration?: string
    insights?: {
      summary: string
      keyStrengths: any[]
      keyWeaknesses: any[]
      recommendations: any[]
    }
  }
  dataQuality?: 'high' | 'medium' | 'low'
  lastUpdated?: string
  benchmarks?: {
    growth: number
    operational: number
    financial: number
    saleReadiness: number
  }
}

interface HealthOverviewProps {
  data: BusinessHealthData
  loading?: boolean
  error?: string
  className?: string
  onRefresh?: () => void
  onExport?: () => void
  onForceRecalculation?: () => void
}

function getTrajectoryIcon(trajectory?: string) {
  switch (trajectory) {
    case 'IMPROVING':
      return (
        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
      )
    case 'DECLINING':
      return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
    case 'VOLATILE':
      return (
        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
      )
    case 'STABLE':
    default:
      return <Minus className="w-4 h-4 text-muted-foreground" />
  }
}

function getTrajectoryColor(trajectory?: string): string {
  switch (trajectory) {
    case 'IMPROVING':
      return 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950'
    case 'DECLINING':
      return 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'
    case 'VOLATILE':
      return 'text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950'
    case 'STABLE':
    default:
      return 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950'
  }
}

function getOverallStatus(score: number): { status: string; color: string } {
  if (score >= 90)
    return {
      status: 'Excellent',
      color: 'text-emerald-600 dark:text-emerald-400',
    }
  if (score >= 75)
    return { status: 'Good', color: 'text-green-600 dark:text-green-400' }
  if (score >= 60)
    return { status: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' }
  if (score >= 40)
    return { status: 'Poor', color: 'text-orange-600 dark:text-orange-400' }
  return { status: 'Critical', color: 'text-red-600 dark:text-red-400' }
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HealthOverview({
  data,
  loading = false,
  error,
  className,
  onRefresh,
  onExport,
  onForceRecalculation,
}: HealthOverviewProps) {
  const { status: overallStatus, color: statusColor } = getOverallStatus(
    data.overallScore
  )

  // Prepare data for components
  const healthScores: HealthScoreData[] = [
    {
      score: data.financialScore,
      label: 'Financial Health',
      description: 'Revenue, profitability, and financial stability',
      trend: data.trajectory?.toLowerCase() as any,
      confidence: data.confidenceLevel,
      benchmark: data.benchmarks?.financial,
    },
    {
      score: data.growthScore,
      label: 'Growth Potential',
      description: 'Market expansion and scalability metrics',
      trend: data.trajectory?.toLowerCase() as any,
      confidence: data.confidenceLevel,
      benchmark: data.benchmarks?.growth,
    },
    {
      score: data.operationalScore,
      label: 'Operational Efficiency',
      description: 'Process optimization and operational health',
      trend: data.trajectory?.toLowerCase() as any,
      confidence: data.confidenceLevel,
      benchmark: data.benchmarks?.operational,
    },
    {
      score: data.saleReadinessScore,
      label: 'Sale Readiness',
      description: 'Preparation and attractiveness for acquisition',
      trend: data.trajectory?.toLowerCase() as any,
      confidence: data.confidenceLevel,
      benchmark: data.benchmarks?.saleReadiness,
    },
  ]

  const chartData: HealthMetricData = {
    overallScore: data.overallScore,
    growthScore: data.growthScore,
    operationalScore: data.operationalScore,
    financialScore: data.financialScore,
    saleReadinessScore: data.saleReadinessScore,
    confidenceLevel: data.confidenceLevel,
    trajectory: data.trajectory,
    benchmarks: data.benchmarks,
  }

  const insightsData: HealthInsightsData = {
    overallSummary:
      data.calculationMetadata?.insights?.summary ||
      'Health analysis completed successfully.',
    keyStrengths: data.calculationMetadata?.insights?.keyStrengths || [],
    keyWeaknesses: data.calculationMetadata?.insights?.keyWeaknesses || [],
    recommendations: data.calculationMetadata?.insights?.recommendations || [],
    opportunities: [],
    risks: [],
    confidenceLevel: data.confidenceLevel,
    dataQuality: data.dataQuality,
  }

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">
            Health Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analysis for {data.businessName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onForceRecalculation && (
            <Button
              variant="outline"
              onClick={onForceRecalculation}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recalculate
            </Button>
          )}

          {onExport && (
            <Button
              variant="secondary"
              onClick={onExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}

          {onRefresh && (
            <Button
              variant="default"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Overall Health Score</CardTitle>
                <CardDescription>
                  Comprehensive business health assessment
                </CardDescription>
              </div>
            </div>

            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border',
                getTrajectoryColor(data.trajectory)
              )}
            >
              {getTrajectoryIcon(data.trajectory)}
              <span className="font-medium capitalize">
                {data.trajectory?.toLowerCase() || 'stable'}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span
                  className={cn('text-4xl font-bold tabular-nums', statusColor)}
                >
                  {Math.round(data.overallScore)}
                </span>
                <span className="text-xl text-muted-foreground">/100</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn('font-medium', statusColor)}
                >
                  {overallStatus}
                </Badge>

                {data.confidenceLevel && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round(data.confidenceLevel)}% confidence
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Calculated: {formatTimestamp(data.calculatedAt)}</span>
              </div>

              {data.calculationMetadata?.calculationDuration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    Duration: {data.calculationMetadata.calculationDuration}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={data.overallScore} className="h-3" />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Critical</span>
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Score Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {healthScores.map((scoreData, index) => (
          <HealthScoreCard
            key={index}
            data={scoreData}
            size="md"
            showBenchmark
            showTrend
            interactive
          />
        ))}
      </div>

      {/* Data Sources & Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Sources & Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {data.dataSources?.financial ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">Financial Data</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.dataSources?.financial
                  ? 'Complete financial records available'
                  : 'Limited financial data'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {data.dataSources?.operational ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">Operational Data</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.dataSources?.operational
                  ? 'Operational metrics available'
                  : 'Limited operational data'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {data.dataSources?.market ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">Market Data</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.dataSources?.market
                  ? 'Market analysis completed'
                  : 'Limited market data'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {data.dataSources?.historical ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">Historical Data</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.dataSources?.historical
                  ? 'Historical trends available'
                  : 'Limited historical data'}
              </p>
            </div>
          </div>

          {data.dataQuality && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Data Quality:</span>
                <Badge
                  variant={
                    data.dataQuality === 'high'
                      ? 'default'
                      : data.dataQuality === 'medium'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="capitalize"
                >
                  {data.dataQuality}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <HealthCharts data={chartData} showBenchmarks interactive />

      {/* Insights Section */}
      <HealthInsights
        data={insightsData}
        interactive
        onActionClick={insight => {
          console.log('Action clicked:', insight)
          // Handle insight actions
        }}
      />
    </div>
  )
}

export default HealthOverview
