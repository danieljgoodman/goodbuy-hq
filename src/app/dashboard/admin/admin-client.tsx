'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Building2,
  MessageCircle,
  Brain,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  userType: string
  status: string
  createdAt: string
}

interface Business {
  id: string
  title: string
  description: string
  category?: string
  askingPrice?: number
  status: string
  createdAt: string
  updatedAt: string
  owner: {
    firstName?: string
    lastName?: string
    email: string
  }
  images_rel: Array<{
    url: string
  }>
}

interface Analytics {
  totals: {
    users: number
    businesses: number
    inquiries: number
    evaluations: number
  }
  growth: {
    users: number
    businesses: number
  }
  distributions: {
    userTypes: Array<{
      type: string
      count: number
    }>
    businessStatuses: Array<{
      status: string
      count: number
    }>
  }
  activity: Array<{
    date: string
    newUsers: number
    newBusinesses: number
    newInquiries: number
  }>
}

interface AdminDashboardClientProps {
  user: any
  recentUsers: User[]
  recentBusinesses: Business[]
  analytics: Analytics
}

export default function AdminDashboardClient({
  user,
  recentUsers,
  recentBusinesses,
  analytics,
}: AdminDashboardClientProps) {
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

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          color: 'text-green-600',
          bg: 'bg-green-100',
          icon: CheckCircle,
        }
      case 'UNDER_REVIEW':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock }
      case 'DRAFT':
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: Edit }
      case 'PENDING':
        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock }
      case 'SUSPENDED':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: CheckCircle }
    }
  }

  const getUserTypeConfig = (userType: string) => {
    switch (userType) {
      case 'BUSINESS_OWNER':
        return {
          label: 'Business Owner',
          color: 'text-blue-600',
          bg: 'bg-blue-100',
        }
      case 'BUYER':
        return { label: 'Buyer', color: 'text-green-600', bg: 'bg-green-100' }
      case 'BROKER':
        return {
          label: 'Broker',
          color: 'text-purple-600',
          bg: 'bg-purple-100',
        }
      case 'ADMIN':
        return { label: 'Admin', color: 'text-red-600', bg: 'bg-red-100' }
      default:
        return { label: userType, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  // Calculate activity trend for last 7 days
  const last7Days = analytics.activity.slice(0, 7).reverse()
  const maxActivity = Math.max(
    ...last7Days.map(d => d.newUsers + d.newBusinesses + d.newInquiries),
    1
  )

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
          <p className="text-slate-600">Loading admin dashboard...</p>
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
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-red-600" />
              Admin Dashboard
            </h1>
            <p className="text-lg text-slate-600">
              Welcome back, {user.firstName || user.name || 'Admin'}! Monitor
              and manage your platform.
            </p>
          </div>
          <motion.div
            className="flex items-center gap-3 mt-4 lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <button
              onClick={() => router.push('/admin/settings')}
              className="flex items-center px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200"
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md"
            >
              <Users className="w-5 h-5 mr-2" />
              Manage Users
            </button>
          </motion.div>
        </motion.div>

        {/* System Overview Cards */}
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
                  Total Users
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">
                    {analytics.totals.users.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center text-sm ${
                      analytics.growth.users >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {analytics.growth.users >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {formatChange(analytics.growth.users)}
                  </div>
                </div>
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
                  Total Businesses
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">
                    {analytics.totals.businesses.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center text-sm ${
                      analytics.growth.businesses >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {analytics.growth.businesses >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {formatChange(analytics.growth.businesses)}
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-white" />
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
                  Total Inquiries
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {analytics.totals.inquiries.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500">Platform activity</p>
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
                <p className="text-sm font-medium text-slate-600">
                  Total Evaluations
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {analytics.totals.evaluations.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500">AI assessments</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Platform Activity (Last 7 Days)
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-600">New Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">New Businesses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-slate-600">New Inquiries</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {last7Days.map((item, index) => {
              const totalActivity =
                item.newUsers + item.newBusinesses + item.newInquiries
              return (
                <motion.div
                  key={item.date}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '100%' }}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
                  className="flex items-center gap-4"
                >
                  <span className="w-16 text-sm text-slate-600 text-right">
                    {format(new Date(item.date), 'MMM dd')}
                  </span>
                  <div className="flex-1 relative">
                    <div className="flex bg-slate-100 rounded-full h-4 overflow-hidden">
                      <motion.div
                        className="bg-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(item.newUsers / maxActivity) * 100}%`,
                        }}
                        transition={{
                          delay: 0.8 + index * 0.05,
                          duration: 0.6,
                        }}
                      />
                      <motion.div
                        className="bg-green-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(item.newBusinesses / maxActivity) * 100}%`,
                        }}
                        transition={{
                          delay: 0.8 + index * 0.05,
                          duration: 0.6,
                        }}
                      />
                      <motion.div
                        className="bg-purple-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(item.newInquiries / maxActivity) * 100}%`,
                        }}
                        transition={{
                          delay: 0.8 + index * 0.05,
                          duration: 0.6,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-sm text-slate-600 text-right">
                    {totalActivity}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Content Management Tabs */}
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
                  id: 'users',
                  label: 'Recent Users',
                  count: recentUsers.length,
                },
                {
                  id: 'businesses',
                  label: 'Pending Review',
                  count: recentBusinesses.length,
                },
                { id: 'analytics', label: 'Analytics', count: '' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    selectedTab === tab.id
                      ? 'border-red-500 text-red-600'
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
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* User Distribution */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">
                        User Distribution
                      </h4>
                      <div className="space-y-3">
                        {analytics.distributions.userTypes.map(
                          (userType, index) => {
                            const config = getUserTypeConfig(userType.type)
                            const percentage =
                              (userType.count / analytics.totals.users) * 100
                            return (
                              <div
                                key={userType.type}
                                className="flex items-center gap-3"
                              >
                                <span
                                  className={`text-sm px-2 py-1 rounded ${config.bg} ${config.color}`}
                                >
                                  {config.label}
                                </span>
                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{
                                      delay: 0.7 + index * 0.1,
                                      duration: 0.6,
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-slate-600 w-12 text-right">
                                  {userType.count}
                                </span>
                              </div>
                            )
                          }
                        )}
                      </div>
                    </div>

                    {/* Business Status Distribution */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">
                        Business Status
                      </h4>
                      <div className="space-y-3">
                        {analytics.distributions.businessStatuses.map(
                          (status, index) => {
                            const config = getStatusConfig(status.status)
                            const percentage =
                              (status.count / analytics.totals.businesses) * 100
                            return (
                              <div
                                key={status.status}
                                className="flex items-center gap-3"
                              >
                                <span
                                  className={`text-sm px-2 py-1 rounded ${config.bg} ${config.color}`}
                                >
                                  {status.status.replace('_', ' ')}
                                </span>
                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{
                                      delay: 0.7 + index * 0.1,
                                      duration: 0.6,
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-slate-600 w-12 text-right">
                                  {status.count}
                                </span>
                              </div>
                            )
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Recent Users ({recentUsers.length})
                    </h3>
                    <button
                      onClick={() => router.push('/admin/users')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      View all users
                    </button>
                  </div>

                  {recentUsers.length > 0 ? (
                    <div className="space-y-3">
                      {recentUsers.map((user, index) => {
                        const userTypeConfig = getUserTypeConfig(user.userType)
                        const statusConfig = getStatusConfig(user.status)
                        return (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {(
                                  user.firstName?.[0] ||
                                  user.name?.[0] ||
                                  user.email[0]
                                ).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.name || user.email}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xs px-2 py-1 rounded ${userTypeConfig.bg} ${userTypeConfig.color}`}
                              >
                                {userTypeConfig.label}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.color}`}
                              >
                                {user.status}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(user.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                              <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No recent users</p>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === 'businesses' && (
                <motion.div
                  key="businesses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Businesses Pending Review ({recentBusinesses.length})
                    </h3>
                    <button
                      onClick={() => router.push('/admin/businesses')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      View all businesses
                    </button>
                  </div>

                  {recentBusinesses.length > 0 ? (
                    <div className="space-y-4">
                      {recentBusinesses.map((business, index) => {
                        const statusConfig = getStatusConfig(business.status)
                        return (
                          <motion.div
                            key={business.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
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
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-slate-900">
                                  {business.title}
                                </h4>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.color}`}
                                >
                                  {business.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                {business.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>
                                  Owner:{' '}
                                  {business.owner.firstName ||
                                    business.owner.email}
                                </span>
                                <span>
                                  {formatDistanceToNow(
                                    new Date(business.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold text-slate-900 mb-2">
                                {formatPrice(business.askingPrice)}
                              </p>
                              <div className="flex gap-2">
                                <button className="p-1 text-green-600 hover:text-green-700 transition-colors">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-blue-600 hover:text-blue-700 transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-red-600 hover:text-red-700 transition-colors">
                                  <AlertTriangle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">
                        No businesses pending review
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    Platform Analytics
                  </h3>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-blue-700">
                          {(
                            (analytics.totals.inquiries /
                              Math.max(analytics.totals.businesses, 1)) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        Engagement Rate
                      </p>
                      <p className="text-xs text-slate-500">
                        Inquiries per business
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-green-700">
                          {formatChange(analytics.growth.users)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        User Growth
                      </p>
                      <p className="text-xs text-slate-500">Last 30 days</p>
                    </div>

                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-purple-700">
                          {(
                            (analytics.totals.evaluations /
                              Math.max(analytics.totals.businesses, 1)) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        Evaluation Rate
                      </p>
                      <p className="text-xs text-slate-500">
                        Businesses evaluated
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
