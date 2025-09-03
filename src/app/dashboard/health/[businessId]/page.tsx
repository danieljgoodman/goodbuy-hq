'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  HealthOverview,
  type BusinessHealthData,
} from '@/components/health/health-overview'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  RefreshCw,
  Download,
  AlertTriangle,
  Clock,
  Zap,
  FileText,
  Share2,
} from 'lucide-react'

interface HealthDashboardPageProps {
  params: {
    businessId: string
  }
}

export default function HealthDashboardPage({
  params,
}: HealthDashboardPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { businessId } = params

  const [healthData, setHealthData] = useState<BusinessHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [businessInfo, setBusinessInfo] = useState<{
    name: string
    id: string
  } | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  // Fetch business info and health data
  useEffect(() => {
    if (!session?.user?.id || !businessId) return

    fetchHealthData()
  }, [session, businessId])

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch health data
      const response = await fetch(`/api/health/${businessId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // No health metrics found, trigger calculation
          await triggerHealthCalculation()
          return
        }
        throw new Error(`Failed to fetch health data: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Transform API response to component props
        const transformedData: BusinessHealthData = {
          businessId: result.data.businessId || businessId,
          businessName: businessInfo?.name || 'Business',
          calculatedAt: result.data.calculatedAt,
          overallScore: result.data.overallScore,
          growthScore: result.data.growthScore,
          operationalScore: result.data.operationalScore,
          financialScore: result.data.financialScore,
          saleReadinessScore: result.data.saleReadinessScore,
          confidenceLevel: result.data.confidenceLevel,
          trajectory: result.data.trajectory,
          dataSources: result.data.dataSources,
          calculationMetadata: result.data.calculationMetadata,
          dataQuality: determineDataQuality(result.data.dataSources),
          lastUpdated: result.data.updatedAt,
        }

        setHealthData(transformedData)

        // Fetch business info if not available
        if (!businessInfo) {
          fetchBusinessInfo()
        }
      } else {
        throw new Error(result.error || 'Failed to load health data')
      }
    } catch (err) {
      console.error('Error fetching health data:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to load health data'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchBusinessInfo = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setBusinessInfo({
            id: result.data.id,
            name: result.data.title || result.data.name || 'Business',
          })

          // Update health data with business name
          setHealthData(prev =>
            prev
              ? {
                  ...prev,
                  businessName:
                    result.data.title || result.data.name || 'Business',
                }
              : null
          )
        }
      }
    } catch (err) {
      console.error('Error fetching business info:', err)
      // Non-critical error, don't show to user
    }
  }

  const triggerHealthCalculation = async (force = false) => {
    try {
      setCalculating(true)
      setError(null)

      toast.info('Calculating health scores...', {
        description: 'This may take a moment to analyze all business metrics.',
        duration: 3000,
      })

      const response = await fetch('/api/health/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          forceRecalculation: force,
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }
        throw new Error(`Calculation failed: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        toast.success('Health calculation completed!', {
          description: `Calculation took ${result.data.calculationDuration}`,
        })

        // Reload the page data
        await fetchHealthData()
      } else {
        throw new Error(result.error || 'Calculation failed')
      }
    } catch (err) {
      console.error('Error calculating health:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to calculate health scores'
      setError(errorMessage)
      toast.error('Calculation failed', {
        description: errorMessage,
      })
    } finally {
      setCalculating(false)
    }
  }

  const handleExport = async () => {
    if (!healthData) return

    try {
      // Create export data
      const exportData = {
        businessName: healthData.businessName,
        calculatedAt: healthData.calculatedAt,
        overallScore: healthData.overallScore,
        scores: {
          financial: healthData.financialScore,
          growth: healthData.growthScore,
          operational: healthData.operationalScore,
          saleReadiness: healthData.saleReadinessScore,
        },
        trajectory: healthData.trajectory,
        confidence: healthData.confidenceLevel,
        insights: healthData.calculationMetadata?.insights,
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `health-report-${healthData.businessName.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Health report exported successfully!')
    } catch (err) {
      console.error('Export error:', err)
      toast.error('Failed to export health report')
    }
  }

  const determineDataQuality = (
    dataSources: any
  ): 'high' | 'medium' | 'low' => {
    if (!dataSources) return 'low'

    const availableSources = Object.values(dataSources).filter(Boolean).length
    const totalSources = Object.keys(dataSources).length
    const ratio = availableSources / totalSources

    if (ratio >= 0.8) return 'high'
    if (ratio >= 0.6) return 'medium'
    return 'low'
  }

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-center space-y-2">
            <p className="font-medium">Loading health dashboard...</p>
            <p className="text-sm text-muted-foreground">
              Fetching business health metrics and analysis
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return null // Redirect will happen in useEffect
  }

  // Error state
  if (error && !healthData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-2xl font-bold">Health Dashboard</h1>
        </div>

        <Alert className="border-destructive max-w-2xl">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="space-y-3">
            <div>{error}</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerHealthCalculation()}
                disabled={calculating}
                className="flex items-center gap-2"
              >
                {calculating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {calculating ? 'Calculating...' : 'Calculate Health Scores'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchHealthData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-2xl font-bold">Health Dashboard</h1>
          {businessInfo && (
            <p className="text-sm text-muted-foreground">{businessInfo.name}</p>
          )}
        </div>
      </div>

      {/* Calculation Status */}
      {calculating && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Calculating Health Scores
            </CardTitle>
            <CardDescription>
              Analyzing business metrics and generating insights...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">
                This process typically takes 30-60 seconds
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Dashboard */}
      {healthData && (
        <HealthOverview
          data={healthData}
          loading={calculating}
          error={error || undefined}
          onRefresh={fetchHealthData}
          onExport={handleExport}
          onForceRecalculation={() => triggerHealthCalculation(true)}
        />
      )}

      {/* Footer Info */}
      <div className="mt-12 pt-6 border-t">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                Last updated:{' '}
                {healthData?.calculatedAt
                  ? new Date(healthData.calculatedAt).toLocaleString()
                  : 'Never'}
              </span>
            </div>

            {healthData?.dataQuality && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>Data quality: </span>
                <Badge
                  variant={
                    healthData.dataQuality === 'high'
                      ? 'default'
                      : healthData.dataQuality === 'medium'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="text-xs capitalize"
                >
                  {healthData.dataQuality}
                </Badge>
              </div>
            )}
          </div>

          <div className="text-xs">
            Health scores are calculated using proprietary algorithms and market
            benchmarks.
          </div>
        </div>
      </div>
    </div>
  )
}
