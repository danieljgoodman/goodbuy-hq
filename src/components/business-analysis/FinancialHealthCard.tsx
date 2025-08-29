import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'

interface FinancialMetric {
  label: string
  value: string
  change: number
  trend: 'up' | 'down' | 'stable'
}

interface FinancialHealthCardProps {
  title?: string
  metrics: FinancialMetric[]
  period?: string
  className?: string
}

export function FinancialHealthCard({
  title = 'Financial Health Overview',
  metrics,
  period = 'Last Quarter',
  className,
}: FinancialHealthCardProps) {
  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (trend === 'down' || change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
    return <DollarSign className="w-4 h-4 text-gray-500" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  return (
    <Card
      className={className}
      role="region"
      aria-label="Financial health metrics overview"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{period}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(metric.trend, metric.change)}
              <span
                className={`text-sm font-medium ${getTrendColor(metric.change)}`}
              >
                {metric.change > 0 ? '+' : ''}
                {metric.change}%
              </span>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            Updated {new Date().toLocaleDateString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default FinancialHealthCard
