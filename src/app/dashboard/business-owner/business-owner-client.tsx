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
  TrendingDown,
  Plus,
  Star,
  DollarSign,
  Calendar,
  BarChart3,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Edit3,
  MoreHorizontal,
} from 'lucide-react'
import {
  formatDistanceToNow,
  format,
  subDays,
  startOfDay,
  endOfDay,
} from 'date-fns'

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
    contactEmail: string
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
  views: Array<{
    createdAt: string
    userId?: string
  }>
}

interface Analytics {
  currentPeriodViews: number
  previousPeriodViews: number
  currentPeriodInquiries: number
  previousPeriodInquiries: number
  dailyViews: Array<{ date: string; views: number }>
  viewsChange: number
  inquiriesChange: number
}

interface BusinessOwnerDashboardClientProps {
  user: any
  businesses: Business[]
  analytics: Analytics
}

export default function BusinessOwnerDashboardClient({
  user,
  businesses,
  analytics,
}: BusinessOwnerDashboardClientProps) {
  const router = useRouter()
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
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

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  // Calculate aggregate statistics
  const totalListings = businesses.length
  const activeListings = businesses.filter(b => b.status === 'ACTIVE').length
  const draftListings = businesses.filter(b => b.status === 'DRAFT').length
  const totalViews = businesses.reduce((sum, b) => sum + b._count.views, 0)
  const totalInquiries = businesses.reduce(
    (sum, b) => sum + b._count.inquiries,
    0
  )
  const totalFavorites = businesses.reduce(
    (sum, b) => sum + b._count.favorites,
    0
  )
  const unreadInquiries = businesses.reduce(
    (sum, b) => sum + b.inquiries.filter(i => !i.isRead).length,
    0
  )
  const averageValue =
    businesses.length > 0
      ? businesses
          .filter(b => b.askingPrice)
          .reduce((sum, b) => sum + (b.askingPrice || 0), 0) /
        businesses.filter(b => b.askingPrice).length
      : 0

  // Get recent activity
  const recentActivity = [
    ...businesses.flatMap(business =>
      business.inquiries.slice(0, 2).map(inquiry => ({
        id: `inquiry-${inquiry.id}`,
        type: 'inquiry',
        title: 'New Buyer Inquiry',
        description: `${inquiry.contactName} is interested in ${business.title}`,
        timestamp: inquiry.createdAt,
        businessId: business.id,
        isUnread: !inquiry.isRead,
      }))
    ),
    ...businesses.flatMap(business =>
      business.evaluations.slice(0, 1).map(evaluation => ({
        id: `evaluation-${evaluation.id}`,
        type: 'evaluation',
        title: 'Business Evaluation Completed',
        description: `${evaluation.title} - Score: ${evaluation.overallScore || 'N/A'}/100`,
        timestamp: evaluation.createdAt,
        businessId: business.id,
        isUnread: false,
      }))
    ),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5)

  // Prepare chart data for the last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
    const viewsForDay =
      analytics.dailyViews.find(d => d.date === date)?.views || 0
    return {
      date: format(subDays(new Date(), 29 - i), 'MMM dd'),
      views: viewsForDay,
    }
  })

  const maxViews = Math.max(...last30Days.map(d => d.views), 1)

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
          <p className="text-slate-600">Loading your business dashboard...</p>
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
              Business Owner Dashboard
            </h1>
            <p className="text-lg text-slate-600">
              Welcome back, {user.firstName || user.name || 'Business Owner'}!
              Manage your listings and track performance.
            </p>
          </div>
          <motion.div
            className="flex items-center gap-3 mt-4 lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <button
              onClick={() => router.push('/marketplace/create')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Listing
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
                  Active Listings
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">
                    {activeListings}
                  </p>
                  <p className="text-sm text-slate-500">of {totalListings}</p>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-white" />
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
                  Total Views
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">
                    {analytics.currentPeriodViews.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center text-sm ${
                      analytics.viewsChange >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {analytics.viewsChange >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {formatChange(analytics.viewsChange)}
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <Eye className="w-6 h-6 text-white" />
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
                <p className="text-sm font-medium text-slate-600">Inquiries</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">
                    {analytics.currentPeriodInquiries}
                  </p>
                  {unreadInquiries > 0 && (
                    <div className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                      {unreadInquiries} new
                    </div>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <MessageCircle className="w-6 h-6 text-white" />
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
                <p className="text-sm font-medium text-slate-600">Avg. Value</p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatPrice(averageValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts and Activity Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Views Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Views Trend (30 days)
              </h3>
              <div
                className={`flex items-center gap-1 text-sm ${
                  analytics.viewsChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                {formatChange(analytics.viewsChange)} vs last period
              </div>
            </div>

            <div className="space-y-3">
              {last30Days.slice(-7).map((item, index) => (
                <motion.div
                  key={item.date}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '100%' }}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
                  className="flex items-center gap-4"
                >
                  <span className="w-12 text-xs text-slate-600 text-right">
                    {item.date}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.max((item.views / maxViews) * 100, 2)}%`,
                      }}
                      transition={{ delay: 0.8 + index * 0.05, duration: 0.6 }}
                    />
                  </div>
                  <span className="w-8 text-xs text-slate-600 text-right">
                    {item.views}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Recent Activity
            </h3>

            <div className="space-y-4">
              <AnimatePresence>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.05, duration: 0.4 }}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50/50 transition-colors duration-200"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-3 flex-shrink-0 ${
                          activity.type === 'inquiry'
                            ? 'bg-purple-500'
                            : 'bg-blue-500'
                        } ${activity.isUnread ? 'animate-pulse' : ''}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 mb-1">
                          {activity.title}
                          {activity.isUnread && (
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full ml-2">
                              New
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-600 mb-2">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500">No recent activity</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {recentActivity.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                View all activity
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Create Listing',
                icon: Plus,
                color: 'blue',
                href: '/marketplace/create',
              },
              {
                label: 'My Listings',
                icon: Building2,
                color: 'green',
                href: '/dashboard/listings',
              },
              {
                label: 'Manage Inquiries',
                icon: MessageCircle,
                color: 'purple',
                href: '/dashboard/inquiries',
              },
              {
                label: 'Performance Analytics',
                icon: BarChart3,
                color: 'orange',
                href: '/dashboard/analytics',
              },
            ].map((action, index) => {
              const IconComponent = action.icon
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05, duration: 0.3 }}
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

        {/* Top Performing Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Top Performing Listings
            </h3>
            <button
              onClick={() => router.push('/dashboard/listings')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              View all listings
            </button>
          </div>

          <div className="space-y-4">
            {businesses.length > 0 ? (
              businesses
                .sort(
                  (a, b) =>
                    b._count.views +
                    b._count.inquiries -
                    (a._count.views + a._count.inquiries)
                )
                .slice(0, 3)
                .map((business, index) => (
                  <motion.div
                    key={business.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50/50 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      const slug =
                        business.slug ||
                        `${business.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${business.id.slice(-8)}`
                      router.push(`/business/${slug}`)
                    }}
                  >
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
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900 truncate">
                          {business.title}
                        </h4>
                        {business.featured && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {business._count.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {business._count.inquiries} inquiries
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {business._count.favorites} favorites
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {formatPrice(business.askingPrice)}
                      </p>
                      <p
                        className={`text-sm flex items-center gap-1 ${
                          business.status === 'ACTIVE'
                            ? 'text-green-600'
                            : 'text-slate-500'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {business.status}
                      </p>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">No listings yet</p>
                <button
                  onClick={() => router.push('/marketplace/create')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Listing
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
