'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  Eye,
  Search,
  Bookmark,
  TrendingUp,
  DollarSign,
  Building2,
  MapPin,
  Calendar,
  Star,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Target,
  Activity,
  BarChart3,
  Zap,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Favorite {
  id: string
  createdAt: string
  business: {
    id: string
    title: string
    description: string
    category?: string
    askingPrice?: number
    status: string
    city?: string
    state?: string
    slug?: string
    images_rel: Array<{
      url: string
    }>
    owner: {
      firstName?: string
      lastName?: string
      company?: string
    }
    _count: {
      views: number
      inquiries: number
      favorites: number
    }
  }
}

interface Inquiry {
  id: string
  subject: string
  message: string
  contactName: string
  contactEmail: string
  isRead: boolean
  createdAt: string
  business: {
    id: string
    title: string
    slug?: string
    askingPrice?: number
    status: string
  }
}

interface SavedSearch {
  id: string
  name: string
  query: any
  emailAlerts: boolean
  createdAt: string
}

interface RecentView {
  id: string
  createdAt: string
  business: {
    id: string
    title: string
    askingPrice?: number
    status: string
    images_rel: Array<{
      url: string
    }>
    _count: {
      views: number
      inquiries: number
    }
  }
}

interface Analytics {
  totalFavorites: number
  totalInquiries: number
  totalSavedSearches: number
  recentActivity: {
    favorites: number
    inquiries: number
    views: number
  }
  preferences: {
    categories: Array<{
      category: string
      count: number
    }>
    priceRange: {
      average: number
      min: number
      max: number
    }
  }
}

interface BuyerDashboardClientProps {
  user: any
  favorites: Favorite[]
  inquiries: Inquiry[]
  savedSearches: SavedSearch[]
  recentViews: RecentView[]
  analytics: Analytics
}

export default function BuyerDashboardClient({
  user,
  favorites,
  inquiries,
  savedSearches,
  recentViews,
  analytics,
}: BuyerDashboardClientProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('favorites')
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
      case 'UNDER_REVIEW':
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          label: 'Under Review',
        }
      case 'SOLD':
        return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Sold' }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: status }
    }
  }

  const handleBusinessClick = (businessId: string, slug?: string) => {
    const finalSlug = slug || `business-${businessId.slice(-8)}`
    router.push(`/business/${finalSlug}`)
  }

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      await fetch(`/api/favorites/${favoriteId}`, { method: 'DELETE' })
      window.location.reload() // Simple refresh for now
    } catch (error) {
      console.error('Error removing favorite:', error)
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
          <p className="text-slate-600">Loading your buyer dashboard...</p>
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
              Buyer Dashboard
            </h1>
            <p className="text-lg text-slate-600">
              Welcome back, {user.firstName || user.name || 'Buyer'}! Discover
              your next business opportunity.
            </p>
          </div>
          <motion.div
            className="flex items-center gap-3 mt-4 lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <button
              onClick={() => router.push('/marketplace')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
            >
              <Search className="w-5 h-5 mr-2" />
              Browse Businesses
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
                  Saved Businesses
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">
                    {analytics.totalFavorites}
                  </p>
                  {analytics.recentActivity.favorites > 0 && (
                    <p className="text-sm text-green-600">
                      +{analytics.recentActivity.favorites} this month
                    </p>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                <Heart className="w-6 h-6 text-white" />
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
                  Active Inquiries
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">
                    {analytics.totalInquiries}
                  </p>
                  {analytics.recentActivity.inquiries > 0 && (
                    <p className="text-sm text-blue-600">
                      +{analytics.recentActivity.inquiries} this month
                    </p>
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
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Recent Views
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {analytics.recentActivity.views}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <Eye className="w-6 h-6 text-white" />
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
                  Avg. Interest
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatPrice(analytics.preferences.priceRange.average)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Investment Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Your Investment Preferences
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Category Preferences */}
            <div>
              <h4 className="text-sm font-medium text-slate-600 mb-4">
                Favorite Categories
              </h4>
              {analytics.preferences.categories.length > 0 ? (
                <div className="space-y-3">
                  {analytics.preferences.categories.map((category, index) => (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: '100%' }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                      className="flex items-center gap-3"
                    >
                      <span className="w-20 text-sm text-slate-600 capitalize">
                        {category.category.toLowerCase().replace('_', ' ')}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(category.count / Math.max(...analytics.preferences.categories.map(c => c.count))) * 100}%`,
                          }}
                          transition={{
                            delay: 0.8 + index * 0.1,
                            duration: 0.6,
                          }}
                        />
                      </div>
                      <span className="w-8 text-sm text-slate-600 text-right">
                        {category.count}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">
                  No category preferences yet. Start saving businesses to see
                  patterns!
                </p>
              )}
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-sm font-medium text-slate-600 mb-4">
                Price Range Interest
              </h4>
              {analytics.preferences.priceRange.average > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Average</span>
                    <span className="font-medium text-slate-900">
                      {formatPrice(analytics.preferences.priceRange.average)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Range</span>
                    <span className="font-medium text-slate-900">
                      {formatPrice(analytics.preferences.priceRange.min)} -{' '}
                      {formatPrice(analytics.preferences.priceRange.max)}
                    </span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-blue-600 rounded-full" />
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">
                  No price preferences yet. Save some businesses to see your
                  range!
                </p>
              )}
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
                {
                  id: 'favorites',
                  label: 'Saved Businesses',
                  count: favorites.length,
                },
                {
                  id: 'inquiries',
                  label: 'My Inquiries',
                  count: inquiries.length,
                },
                {
                  id: 'searches',
                  label: 'Saved Searches',
                  count: savedSearches.length,
                },
                {
                  id: 'recent',
                  label: 'Recently Viewed',
                  count: recentViews.length,
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
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {selectedTab === 'favorites' && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Saved Businesses ({favorites.length})
                    </h3>
                    <button
                      onClick={() => router.push('/marketplace')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      Browse more businesses
                    </button>
                  </div>

                  {favorites.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {favorites.map((favorite, index) => {
                        const statusConfig = getStatusConfig(
                          favorite.business.status
                        )
                        return (
                          <motion.div
                            key={favorite.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 overflow-hidden group cursor-pointer"
                            onClick={() =>
                              handleBusinessClick(
                                favorite.business.id,
                                favorite.business.slug
                              )
                            }
                          >
                            <div className="aspect-video bg-slate-200 overflow-hidden">
                              {favorite.business.images_rel[0]?.url ? (
                                <img
                                  src={favorite.business.images_rel[0].url}
                                  alt={favorite.business.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Building2 className="w-12 h-12 text-slate-400" />
                                </div>
                              )}
                            </div>

                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                                    {favorite.business.title}
                                  </h4>
                                  <p className="text-sm text-slate-600 line-clamp-2">
                                    {favorite.business.description}
                                  </p>
                                </div>
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleRemoveFavorite(favorite.id)
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                  title="Remove from favorites"
                                >
                                  <Heart className="w-4 h-4 fill-current" />
                                </button>
                              </div>

                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  {favorite.business.category && (
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                      {favorite.business.category.replace(
                                        '_',
                                        ' '
                                      )}
                                    </span>
                                  )}
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.color}`}
                                  >
                                    {statusConfig.label}
                                  </span>
                                </div>
                                <span className="font-semibold text-slate-900">
                                  {formatPrice(favorite.business.askingPrice)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>
                                  {favorite.business.city &&
                                    favorite.business.state && (
                                      <>
                                        <MapPin className="w-3 h-3 inline mr-1" />
                                        {favorite.business.city},{' '}
                                        {favorite.business.state}
                                      </>
                                    )}
                                </span>
                                <span>
                                  Saved{' '}
                                  {formatDistanceToNow(
                                    new Date(favorite.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-slate-900 mb-2">
                        No saved businesses yet
                      </h4>
                      <p className="text-slate-600 mb-6">
                        Start browsing and save businesses you're interested in.
                      </p>
                      <button
                        onClick={() => router.push('/marketplace')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Businesses
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === 'inquiries' && (
                <motion.div
                  key="inquiries"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      My Inquiries ({inquiries.length})
                    </h3>
                  </div>

                  {inquiries.length > 0 ? (
                    <div className="space-y-4">
                      {inquiries.map((inquiry, index) => {
                        const statusConfig = getStatusConfig(
                          inquiry.business.status
                        )
                        return (
                          <motion.div
                            key={inquiry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-slate-900">
                                    {inquiry.subject}
                                  </h4>
                                  {!inquiry.isRead && (
                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                                      New
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                  {inquiry.message}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                  <span>
                                    Business: {inquiry.business.title}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.color}`}
                                  >
                                    {statusConfig.label}
                                  </span>
                                  <span>
                                    {formatDistanceToNow(
                                      new Date(inquiry.createdAt),
                                      { addSuffix: true }
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-slate-900 mb-2">
                                  {formatPrice(inquiry.business.askingPrice)}
                                </p>
                                <button
                                  onClick={() =>
                                    handleBusinessClick(
                                      inquiry.business.id,
                                      inquiry.business.slug
                                    )
                                  }
                                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  View Business
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-slate-900 mb-2">
                        No inquiries yet
                      </h4>
                      <p className="text-slate-600 mb-6">
                        Contact business owners to show your interest.
                      </p>
                      <button
                        onClick={() => router.push('/marketplace')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Find Businesses
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === 'searches' && (
                <motion.div
                  key="searches"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Saved Searches ({savedSearches.length})
                    </h3>
                    <button
                      onClick={() => router.push('/marketplace')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      Create new search
                    </button>
                  </div>

                  {savedSearches.length > 0 ? (
                    <div className="space-y-4">
                      {savedSearches.map((search, index) => (
                        <motion.div
                          key={search.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-slate-900">
                                  {search.name}
                                </h4>
                                {search.emailAlerts && (
                                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                    Alerts On
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">
                                Created{' '}
                                {formatDistanceToNow(
                                  new Date(search.createdAt),
                                  { addSuffix: true }
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bookmark className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-slate-900 mb-2">
                        No saved searches
                      </h4>
                      <p className="text-slate-600 mb-6">
                        Save your search criteria to get notified of new
                        matches.
                      </p>
                      <button
                        onClick={() => router.push('/marketplace')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Start Searching
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === 'recent' && (
                <motion.div
                  key="recent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Recently Viewed ({recentViews.length})
                    </h3>
                  </div>

                  {recentViews.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recentViews.map((view, index) => (
                        <motion.div
                          key={view.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                          className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 overflow-hidden cursor-pointer"
                          onClick={() => handleBusinessClick(view.business.id)}
                        >
                          <div className="aspect-video bg-slate-200 overflow-hidden">
                            {view.business.images_rel[0]?.url ? (
                              <img
                                src={view.business.images_rel[0].url}
                                alt={view.business.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-slate-400" />
                              </div>
                            )}
                          </div>

                          <div className="p-3">
                            <h4 className="font-medium text-slate-900 mb-1 line-clamp-1">
                              {view.business.title}
                            </h4>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900">
                                {formatPrice(view.business.askingPrice)}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(view.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Eye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-slate-900 mb-2">
                        No recent views
                      </h4>
                      <p className="text-slate-600 mb-6">
                        Start exploring businesses to see them here.
                      </p>
                      <button
                        onClick={() => router.push('/marketplace')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Now
                      </button>
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
                label: 'Browse Businesses',
                icon: Search,
                color: 'blue',
                href: '/marketplace',
              },
              {
                label: 'Valuation Tool',
                icon: BarChart3,
                color: 'green',
                href: '/calculator',
              },
              {
                label: 'My Inquiries',
                icon: MessageCircle,
                color: 'purple',
                href: '/dashboard/buyer?tab=inquiries',
              },
              {
                label: 'Investment Criteria',
                icon: Target,
                color: 'orange',
                href: '/dashboard/preferences',
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
