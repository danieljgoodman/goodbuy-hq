'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { BarChart3, TrendingUp, FileText, Users } from 'lucide-react'

interface UsageData {
  aiAnalyses: {
    used: number
    limit: number
  }
  portfolioSize: {
    used: number
    limit: number
  }
  reportGeneration: {
    used: number
    limit: number
  }
  resetDate: string
}

interface UsageTrackerProps {
  className?: string
}

export function UsageTracker({ className }: UsageTrackerProps) {
  const { data: session } = useSession()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/subscription/usage')
        if (!response.ok) throw new Error('Failed to fetch usage')

        const data = await response.json()
        setUsage(data)
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [session?.user?.id])

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const formatResetDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading || !usage) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Tracking
          </CardTitle>
          <CardDescription>Your subscription usage and limits</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <p className="ml-2 text-muted-foreground">
            {loading ? 'Loading usage data...' : 'Unable to load usage data'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // At this point, usage is guaranteed to be defined
  const usageItems = [
    {
      icon: BarChart3,
      label: 'AI Analyses',
      used: usage.aiAnalyses.used,
      limit: usage.aiAnalyses.limit,
      description: 'Business health & valuation analyses',
    },
    {
      icon: Users,
      label: 'Portfolio Size',
      used: usage.portfolioSize.used,
      limit: usage.portfolioSize.limit,
      description: 'Businesses in your portfolio',
    },
    {
      icon: FileText,
      label: 'Report Generation',
      used: usage.reportGeneration.used,
      limit: usage.reportGeneration.limit,
      description: 'Professional PDF reports',
    },
  ]

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Usage & Limits</CardTitle>
          <CardDescription>
            Current plan:{' '}
            <Badge variant="outline">
              {session?.user?.subscriptionTier || 'FREE'}
            </Badge>
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/ai-tools/subscription">Manage Plan</a>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {usageItems.map(item => {
          const Icon = item.icon
          const percentage = (item.used / item.limit) * 100

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <span
                  className={`text-sm font-medium ${getUsageColor(item.used, item.limit)}`}
                >
                  {item.used} / {item.limit}
                </span>
              </div>

              <Progress value={percentage} className="h-2" />

              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>

              {percentage >= 90 && (
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs text-yellow-600">
                    Approaching limit - consider upgrading
                  </span>
                </div>
              )}
            </div>
          )
        })}

        <div className="pt-2 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Usage resets on {formatResetDate(usage.resetDate)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
