'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Building2,
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
} from 'lucide-react'

interface Business {
  id: string
  title: string
  description: string
  category?: string
  askingPrice?: number
  status: string
  createdAt: string
}

export default function FinancialHealthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchUserBusinesses()
  }, [session, status, router])

  const fetchUserBusinesses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/businesses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch businesses: ${response.status}`)
      }

      const result = await response.json()
      if (result.businesses) {
        setBusinesses(result.businesses || [])
      } else {
        throw new Error(result.error || 'Failed to load businesses')
      }
    } catch (err) {
      console.error('Error fetching businesses:', err)
      setError(err instanceof Error ? err.message : 'Failed to load businesses')
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessSelect = (businessId: string) => {
    router.push(`/dashboard/health/${businessId}`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto py-12">
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-lg font-medium">
              Loading financial health dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Financial Health Dashboard
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive insights into your business financial
              performance, growth potential, and sale readiness
            </p>
          </motion.div>
        </div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Financial Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Deep dive into revenue, profit margins, and financial stability
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Growth Potential</h3>
              <p className="text-sm text-muted-foreground">
                Assess scalability and market expansion opportunities
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Operational Health</h3>
              <p className="text-sm text-muted-foreground">
                Evaluate process efficiency and operational metrics
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Sale Readiness</h3>
              <p className="text-sm text-muted-foreground">
                Determine preparation level for potential acquisition
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Building2 className="w-6 h-6" />
                Select Your Business
              </CardTitle>
              <CardDescription>
                Choose a business to analyze its financial health and get
                comprehensive insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-6 border-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {businesses.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No businesses found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You need to add a business listing before you can analyze
                    its financial health.
                  </p>
                  <Button
                    onClick={() => router.push('/sell')}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Business
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {businesses.map(business => (
                    <motion.div
                      key={business.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="group"
                    >
                      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-primary/50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">
                                  {business.title}
                                </h3>
                                <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                                  {business.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  {business.category && (
                                    <Badge variant="secondary">
                                      {business.category}
                                    </Badge>
                                  )}
                                  {business.askingPrice && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      {business.askingPrice.toLocaleString()}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Added{' '}
                                    {new Date(
                                      business.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge
                                variant={
                                  business.status === 'ACTIVE'
                                    ? 'default'
                                    : business.status === 'DRAFT'
                                      ? 'secondary'
                                      : 'outline'
                                }
                              >
                                {business.status}
                              </Badge>
                              <Button
                                onClick={() =>
                                  handleBusinessSelect(business.id)
                                }
                                className="gap-2 group-hover:gap-3 transition-all"
                              >
                                Analyze Health
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI-Powered Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">
                AI-Powered Business Intelligence
              </h3>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Comprehensive Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Our AI analyzes 50+ financial and operational metrics
                  </p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Actionable Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Get specific recommendations to improve your business value
                  </p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Market Benchmarks</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare your performance against industry standards
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
