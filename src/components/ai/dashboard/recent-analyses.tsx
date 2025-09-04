'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FileText, TrendingUp, Activity, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalysisResult {
  id: string
  businessName: string
  type: 'health' | 'valuation' | 'forecast'
  score?: number
  status: 'completed' | 'processing' | 'failed'
  completedAt: Date
  exportUrl?: string
}

interface RecentAnalysesProps {
  limit?: number
  className?: string
}

export function RecentAnalyses({ limit = 5, className }: RecentAnalysesProps) {
  const { data: session } = useSession()
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchRecentAnalyses = async () => {
      try {
        const response = await fetch(`/api/businesses/history?limit=${limit}`)
        if (!response.ok) throw new Error('Failed to fetch analyses')

        const data = await response.json()
        setAnalyses(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analyses')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentAnalyses()
  }, [session?.user?.id, limit])

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'health':
        return Activity
      case 'valuation':
        return TrendingUp
      case 'forecast':
        return Calendar
      default:
        return FileText
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatScore = (score?: number, type?: string) => {
    if (score === undefined) return null

    switch (type) {
      case 'health':
        return `${score}/100`
      case 'valuation':
        return `$${(score / 1000).toFixed(0)}K`
      default:
        return score.toString()
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Recent Analyses</CardTitle>
          <CardDescription>
            Your latest business analysis results
          </CardDescription>
        </div>
        <Link href="/dashboard/health">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>

      <CardContent>
        {analyses.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No analyses yet</p>
            <p className="text-sm text-muted-foreground">
              Run your first analysis to see results here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map(analysis => {
              const Icon = getAnalysisIcon(analysis.type)
              const formattedScore = formatScore(analysis.score, analysis.type)

              return (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {analysis.businessName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {analysis.type}
                        </Badge>
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            getStatusColor(analysis.status)
                          )}
                        >
                          {analysis.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {formattedScore && (
                      <p className="font-semibold text-sm">{formattedScore}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(analysis.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
