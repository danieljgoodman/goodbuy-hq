'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Eye,
  MessageCircle,
  Heart,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  Users,
  Brain,
  Activity,
  Target,
  Zap,
  CheckCircle,
  Clock,
  Star,
  Plus,
  FileText,
  Award,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Business {
  id: string
  title: string
  description: string
  category?: string
  askingPrice?: number
  status: string
  featured: boolean
  viewCount: number
  inquiryCount: number
  slug?: string
  createdAt: string
  images_rel: Array<{
    url: string
  }>
  _count: {
    favorites: number
    inquiries: number
    views: number
    evaluations: number
  }
  inquiries: Array<{
    id: string
    subject: string
    contactName: string
    createdAt: string
    isRead: boolean
  }>
  evaluations: Array<{
    id: string
    title: string
    overallScore?: number
    estimatedValue?: number
    status: string
    createdAt: string
  }>
}

interface Evaluation {
  id: string
  title: string
  summary?: string
  financialScore?: number
  operationalScore?: number
  marketScore?: number
  overallScore?: number
  estimatedValue?: number
  status: string
  createdAt: string
  business: {
    id: string
    title: string
    askingPrice?: number
    status: string
  }
}

interface Analytics {
  totalClients: number
  activeListings: number
  totalEvaluations: number
  recentEvaluations: number
  totalCommissionValue: number
  completedDeals: number
}

interface BrokerDashboardClientProps {
  user: any
  businesses: Business[]
  evaluations: Evaluation[]
  analytics: Analytics
}

export default function BrokerDashboardClient({
  user,
  businesses,
  evaluations,
  analytics,
}: BrokerDashboardClientProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const formatPrice = (price?: number | null) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'Active' }
      case 'DRAFT':
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Draft' }
      case 'COMPLETED':
        return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Completed' }
      case 'SOLD':
        return { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Sold' }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: status }
    }
  }

  // Calculate performance metrics
  const averageScore =
    evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + (e.overallScore || 0), 0) /
        evaluations.length
      : 0

  const recentActivity = [
    ...businesses.flatMap(business =>
      business.evaluations.slice(0, 1).map(evaluation => ({
        id: `evaluation-${evaluation.id}`,
        type: 'evaluation',
        title: 'Business Evaluation Completed',
        description: `${business.title} - Score: ${evaluation.overallScore || 'N/A'}/100`,
        timestamp: evaluation.createdAt,
        businessId: business.id,
      }))
    ),
    ...businesses.flatMap(business =>
      business.inquiries.slice(0, 1).map(inquiry => ({
        id: `inquiry-${inquiry.id}`,
        type: 'inquiry',
        title: 'New Client Inquiry',
        description: `${inquiry.contactName} interested in ${business.title}`,
        timestamp: inquiry.createdAt,
        businessId: business.id,
      }))
    ),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-slate-600">Loading your broker dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Broker Dashboard
            </h1>
            <p className="text-lg text-slate-600">
              Welcome back, {user.firstName || user.name || 'Broker'}! Manage
              your clients and evaluations.
            </p>
          </div>
          <motion.div
            className="flex items-center gap-3 mt-4 lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <button
              onClick={() => router.push('/calculator')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
            >
              <Brain className="w-5 h-5 mr-2" />
              New Evaluation
            </button>
            <button
              onClick={() => router.push('/marketplace/create')}
              className="flex items-center px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Client Listing
            </button>
          </motion.div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Active Clients
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {analytics.totalClients}
                </p>
                <p className="text-sm text-slate-500">
                  {analytics.activeListings} active listings
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Evaluations
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">
                    {analytics.totalEvaluations}
                  </p>
                  {analytics.recentEvaluations > 0 && (
                    <p className="text-sm text-green-600">
                      +{analytics.recentEvaluations} this month
                    </p>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Completed Deals
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {analytics.completedDeals}
                </p>
                <p className="text-sm text-slate-500">Total transactions</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Commission Value
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatPrice(analytics.totalCommissionValue)}
                </p>
                <p className="text-sm text-slate-500">Estimated earnings</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Performance Overview
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-700">
                  {averageScore.toFixed(0)}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900">
                Average Evaluation Score
              </p>
              <p className="text-xs text-slate-500">Out of 100</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-700">
                  {analytics.activeListings}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900">
                Active Listings
              </p>
              <p className="text-xs text-slate-500">Currently live</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-purple-700">
                  {(
                    (analytics.completedDeals /
                      Math.max(analytics.totalClients, 1)) *
                    100
                  ).toFixed(0)}
                  %
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900">Success Rate</p>
              <p className="text-xs text-slate-500">Deals closed</p>
            </div>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg"
        >
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', count: '' },
                {
                  id: 'clients',
                  label: 'Client Listings',
                  count: businesses.length,
                },
                {
                  id: 'evaluations',
                  label: 'Evaluations',
                  count: evaluations.length,
                },
                {
                  id: 'activity',
                  label: 'Recent Activity',
                  count: recentActivity.length,
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label} {tab.count && `(${tab.count})`}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {selectedTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Top Performing Clients */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">
                        Top Performing Clients
                      </h4>
                      <div className="space-y-3">
                        {businesses
                          .sort(
                            (a, b) =>
                              b._count.views +
                              b._count.inquiries -
                              (a._count.views + a._count.inquiries)
                          )
                          .slice(0, 5)
                          .map((business, index) => (
                            <div
                              key={business.id}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                            >
                              <div className="w-12 h-8 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                                {business.images_rel[0]?.url ? (
                                  <img
                                    src={business.images_rel[0].url}
                                    alt={business.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 text-sm">
                                  {business.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {business._count.views} views •{' '}
                                  {business._count.inquiries} inquiries
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-slate-900 text-sm">
                                  {formatPrice(business.askingPrice)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Recent Evaluations */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">
                        Recent Evaluations
                      </h4>
                      <div className="space-y-3">
                        {evaluations.slice(0, 5).map((evaluation, index) => {
                          const statusConfig = getStatusConfig(
                            evaluation.status
                          )
                          return (
                            <div
                              key={evaluation.id}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                            >
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Brain className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 text-sm">
                                  {evaluation.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {evaluation.business.title}
                                </p>
                              </div>
                              <div className="text-right">
                                {evaluation.overallScore && (
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {evaluation.overallScore}/100
                                  </p>
                                )}
                                <span
                                  className={`text-xs px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.color}`}
                                >
                                  {statusConfig.label}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'clients' && (
                <motion.div
                  key="clients"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Client Listings ({businesses.length})
                    </h3>
                    <button
                      onClick={() => router.push('/marketplace/create')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      Add new client listing
                    </button>
                  </div>

                  {businesses.length > 0 ? (
                    <div className="space-y-4">
                      {businesses.map((business, index) => {
                        const statusConfig = getStatusConfig(business.status)
                        return (
                          <motion.div
                            key={business.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all duration-200"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-12 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                                {business.images_rel[0]?.url ? (
                                  <img
                                    src={business.images_rel[0].url}
                                    alt={business.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-slate-400" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-slate-900">
                                    {business.title}
                                  </h4>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.color}`}
                                  >
                                    {statusConfig.label}
                                  </span>
                                  {business.featured && (
                                    <Star className="w-4 h-4 text-yellow-500" />
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                  {business.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {business._count.views} views
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    {business._count.inquiries} inquiries
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Brain className="w-3 h-3" />
                                    {business._count.evaluations} evaluations
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="font-semibold text-slate-900 mb-2">
                                  {formatPrice(business.askingPrice)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Updated{' '}
                                  {formatDistanceToNow(
                                    new Date(business.createdAt),
                                    { addSuffix: true }
                                  )}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-slate-900 mb-2">
                        No client listings yet
                      </h4>
                      <p className="text-slate-600 mb-6">
                        Add your first client listing to get started.
                      </p>
                      <button
                        onClick={() => router.push('/marketplace/create')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Client Listing
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === 'evaluations' && (
                <motion.div
                  key="evaluations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Business Evaluations ({evaluations.length})
                    </h3>
                    <button
                      onClick={() => router.push('/calculator')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      Create new evaluation
                    </button>
                  </div>

                  {evaluations.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {evaluations.map((evaluation, index) => {
                        const statusConfig = getStatusConfig(evaluation.status)
                        return (
                          <motion.div
                            key={evaluation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 mb-1">
                                  {evaluation.title}
                                </h4>
                                <p className="text-sm text-slate-600">
                                  {evaluation.business.title}
                                </p>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.color}`}
                              >
                                {statusConfig.label}
                              </span>
                            </div>

                            {evaluation.overallScore && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-slate-500">
                                    Overall Score
                                  </span>
                                  <span className="text-sm font-medium text-slate-900">
                                    {evaluation.overallScore}/100
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                    style={{
                                      width: `${evaluation.overallScore}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>
                                {formatDistanceToNow(
                                  new Date(evaluation.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
                              {evaluation.estimatedValue && (
                                <span className="font-medium text-slate-700">
                                  Est. {formatPrice(evaluation.estimatedValue)}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-slate-900 mb-2">
                        No evaluations yet
                      </h4>
                      <p className="text-slate-600 mb-6">
                        Create your first business evaluation to provide
                        professional insights.
                      </p>
                      <button
                        onClick={() => router.push('/calculator')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Evaluation
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    Recent Activity
                  </h3>

                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                          className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-3 flex-shrink-0 ${
                              activity.type === 'evaluation'
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 mb-1">
                              {activity.title}
                            </p>
                            <p className="text-sm text-slate-600 mb-2">
                              {activity.description}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDistanceToNow(
                                new Date(activity.timestamp),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No recent activity</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'New Evaluation',
                icon: Brain,
                color: 'blue',
                href: '/calculator',
              },
              {
                label: 'Add Client Listing',
                icon: Plus,
                color: 'green',
                href: '/marketplace/create',
              },
              {
                label: 'Browse Marketplace',
                icon: Building2,
                color: 'purple',
                href: '/marketplace',
              },
              {
                label: 'Generate Report',
                icon: FileText,
                color: 'orange',
                href: '/reports',
              },
            ].map((action, index) => {
              const IconComponent = action.icon
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(action.href)}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 rounded-lg flex items-center justify-center shadow-sm`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 text-center">
                    {action.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
