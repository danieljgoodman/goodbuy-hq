'use client'

import { useState, useEffect } from 'react'
import { UserType } from '@prisma/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  MessageSquare,
  Heart,
  Building,
  Target,
  Zap,
  Brain,
  Activity,
  Star,
  ArrowUpRight,
  Calendar,
  Store,
  Plus,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CostMonitor from '@/components/ai/cost-monitor'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DashboardClientProps {
  session: any
  user: any
  dashboardTitle: string
  dashboardDescription: string
}

// Mock data for visualization
const mockChartData = [
  { month: 'Jan', value: 4000 },
  { month: 'Feb', value: 3000 },
  { month: 'Mar', value: 5000 },
  { month: 'Apr', value: 4500 },
  { month: 'May', value: 6000 },
  { month: 'Jun', value: 5500 },
]

const recentActivity = [
  {
    id: 1,
    type: 'valuation',
    title: 'AI Valuation Completed',
    description: 'TechCorp Solutions - $2.4M valuation',
    timestamp: '2 hours ago',
    color: 'blue',
  },
  {
    id: 2,
    type: 'inquiry',
    title: 'New Buyer Inquiry',
    description: 'Manufacturing business in Chicago',
    timestamp: '4 hours ago',
    color: 'green',
  },
  {
    id: 3,
    type: 'report',
    title: 'Monthly Report Generated',
    description: 'Q4 performance analytics',
    timestamp: '1 day ago',
    color: 'purple',
  },
]

export default function DashboardClient({
  session,
  user,
  dashboardTitle,
  dashboardDescription,
}: DashboardClientProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const getStatsForUserType = () => {
    switch (session.user.userType) {
      case UserType.BUSINESS_OWNER:
        return [
          {
            label: 'Active Listings',
            value: user?.businesses?.length || 3,
            change: '+12%',
            trend: 'up',
            color: 'blue',
            icon: Building,
          },
          {
            label: 'Total Inquiries',
            value: 24,
            change: '+8%',
            trend: 'up',
            color: 'green',
            icon: MessageSquare,
          },
          {
            label: 'Profile Views',
            value: 1847,
            change: '+23%',
            trend: 'up',
            color: 'purple',
            icon: Eye,
          },
          {
            label: 'Avg. Valuation',
            value: '$2.1M',
            change: '+5%',
            trend: 'up',
            color: 'orange',
            icon: DollarSign,
          },
        ]
      case UserType.BUYER:
        return [
          {
            label: 'Saved Businesses',
            value: 12,
            change: '+3',
            trend: 'up',
            color: 'blue',
            icon: Heart,
          },
          {
            label: 'Active Inquiries',
            value: 5,
            change: '+2',
            trend: 'up',
            color: 'green',
            icon: MessageSquare,
          },
          {
            label: 'Recently Viewed',
            value: 38,
            change: '+15%',
            trend: 'up',
            color: 'purple',
            icon: Eye,
          },
          {
            label: 'Avg. Investment',
            value: '$850K',
            change: '+12%',
            trend: 'up',
            color: 'orange',
            icon: Target,
          },
        ]
      case UserType.BROKER:
        return [
          {
            label: 'Client Listings',
            value: user?.businesses?.length || 8,
            change: '+4',
            trend: 'up',
            color: 'blue',
            icon: Building,
          },
          {
            label: 'Evaluations',
            value: user?.evaluations?.length || 15,
            change: '+7',
            trend: 'up',
            color: 'green',
            icon: Brain,
          },
          {
            label: 'Active Deals',
            value: 3,
            change: '+1',
            trend: 'up',
            color: 'purple',
            icon: Activity,
          },
          {
            label: 'Commission',
            value: '$45K',
            change: '+18%',
            trend: 'up',
            color: 'orange',
            icon: DollarSign,
          },
        ]
      default:
        return []
    }
  }

  const stats = getStatsForUserType()

  const getQuickActionsForUserType = () => {
    switch (session.user.userType) {
      case UserType.BUSINESS_OWNER:
        return [
          {
            label: 'Create Listing',
            icon: Plus,
            color: 'blue',
            href: '/marketplace/create',
          },
          {
            label: 'My Listings',
            icon: Building,
            color: 'green',
            href: '/dashboard/listings',
          },
          {
            label: 'Browse Marketplace',
            icon: Store,
            color: 'purple',
            href: '/marketplace',
          },
          {
            label: 'Generate Report',
            icon: BarChart3,
            color: 'orange',
            href: '/calculator',
          },
        ]
      case UserType.BUYER:
        return [
          {
            label: 'Browse Businesses',
            icon: Search,
            color: 'blue',
            href: '/marketplace',
          },
          {
            label: 'Saved Businesses',
            icon: Heart,
            color: 'red',
            href: '/dashboard/saved',
          },
          {
            label: 'My Inquiries',
            icon: MessageSquare,
            color: 'green',
            href: '/dashboard/inquiries',
          },
          {
            label: 'Valuation Tool',
            icon: Brain,
            color: 'purple',
            href: '/calculator',
          },
        ]
      case UserType.BROKER:
        return [
          {
            label: 'Client Listings',
            icon: Building,
            color: 'blue',
            href: '/dashboard/listings',
          },
          {
            label: 'Browse Marketplace',
            icon: Store,
            color: 'green',
            href: '/marketplace',
          },
          {
            label: 'Create Evaluation',
            icon: Brain,
            color: 'purple',
            href: '/calculator',
          },
          {
            label: 'Generate Report',
            icon: BarChart3,
            color: 'orange',
            href: '/reports',
          },
        ]
      default:
        return [
          {
            label: 'Browse Marketplace',
            icon: Store,
            color: 'blue',
            href: '/marketplace',
          },
          {
            label: 'Valuation Tool',
            icon: Brain,
            color: 'green',
            href: '/calculator',
          },
          {
            label: 'Schedule Call',
            icon: Calendar,
            color: 'purple',
            href: '/contact',
          },
          {
            label: 'Generate Report',
            icon: BarChart3,
            color: 'orange',
            href: '/calculator',
          },
        ]
    }
  }

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
          <p className="text-slate-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {dashboardTitle}
            </h1>
            <p className="text-lg text-slate-600">{dashboardDescription}</p>
          </div>
          <motion.div
            className="flex items-center gap-2 mt-4 lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <select
              value={selectedTimeRange}
              onChange={e => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </motion.div>
        </motion.div>

        {/* Enhanced User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
        >
          <div className="flex items-center gap-6">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {user?.firstName?.[0] || session.user.name?.[0] || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full" />
            </motion.div>

            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-slate-900 mb-1">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : session.user.name || 'User'}
              </h2>
              <p className="text-slate-600 mb-2">{session.user.email}</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
                  {session.user.userType.replace('_', ' ').toLowerCase()}
                </span>
                <div className="flex items-center text-sm text-slate-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Member since 2024
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                Edit Profile
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -4 }}
                className="relative group"
              >
                <Card className="backdrop-blur-sm border-white/20 shadow-lg bg-white/80 h-full overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-lg flex items-center justify-center shadow-md`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <motion.div
                      className={`flex items-center text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      {stat.change}
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      className="text-3xl font-bold text-slate-900 mb-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    >
                      {stat.value}
                    </motion.div>
                    <CardDescription className="text-slate-600">
                      {stat.label}
                    </CardDescription>
                  </CardContent>

                  {/* Background gradient effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/5 to-${stat.color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg`}
                  />
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Marketplace Navigation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Store className="w-7 h-7" />
                Business Marketplace
              </h3>
              <p className="text-blue-100 mb-4">
                {session.user.userType === UserType.BUSINESS_OWNER
                  ? 'List your business for sale or browse investment opportunities'
                  : session.user.userType === UserType.BUYER
                    ? 'Discover profitable businesses for sale across various industries'
                    : 'Explore business opportunities and manage client listings'}
              </p>
              <div className="flex flex-wrap gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => (window.location.href = '/marketplace')}
                    variant="outline"
                    className="bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white backdrop-blur-sm"
                  >
                    Browse Marketplace
                  </Button>
                </motion.div>
                {session.user.userType === UserType.BUSINESS_OWNER && (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() =>
                          (window.location.href = '/marketplace/create')
                        }
                        variant="secondary"
                        className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Create Listing
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() =>
                          (window.location.href = '/dashboard/listings')
                        }
                        variant="outline"
                        className="bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white backdrop-blur-sm"
                      >
                        Manage Listings
                      </Button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <motion.div
                className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
                whileHover={{ rotate: 10, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Building className="w-12 h-12 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Data Visualization Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chart Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="backdrop-blur-sm border-white/20 shadow-lg bg-white/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Performance Overview
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    +24% vs last month
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Simple Bar Chart */}
                <div className="space-y-4">
                  {mockChartData.map((item, index) => (
                    <motion.div
                      key={item.month}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: '100%' }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      className="flex items-center gap-4"
                    >
                      <span className="w-8 text-sm text-slate-600">
                        {item.month}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value / 6000) * 100}%` }}
                          transition={{
                            delay: 0.7 + index * 0.1,
                            duration: 0.8,
                          }}
                        />
                      </div>
                      <span className="w-16 text-sm text-slate-600 text-right">
                        ${(item.value / 1000).toFixed(1)}K
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Recent Activity
            </h3>

            <div className="space-y-4">
              <AnimatePresence>
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50/50 transition-colors duration-200"
                  >
                    <div
                      className={`w-2 h-2 rounded-full bg-${activity.color}-500 mt-3 flex-shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 mb-1">
                        {activity.title}
                      </p>
                      <p className="text-sm text-slate-600 mb-2">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {activity.timestamp}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4 text-blue-600 hover:text-blue-700"
              >
                View all activity
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getQuickActionsForUserType().map((action, index) => {
              const IconComponent = action.icon
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() =>
                      action.href && (window.location.href = action.href)
                    }
                    variant="outline"
                    className="flex flex-col items-center gap-3 h-auto p-4 hover:shadow-md"
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 rounded-lg flex items-center justify-center shadow-sm`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {action.label}
                    </span>
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* AI Cost Monitor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <CostMonitor />
        </motion.div>
      </div>
    </div>
  )
}
