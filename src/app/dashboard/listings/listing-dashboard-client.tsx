'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  Heart,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Building2,
  DollarSign,
  Calendar,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Business {
  id: string
  title: string
  description: string
  category?: string
  listingType: string
  city?: string
  state?: string
  askingPrice?: number | null
  revenue?: number | null
  status: string
  featured: boolean
  priority: number
  viewCount: number
  inquiryCount: number
  images: string[]
  slug?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  expiresAt?: string
  images_rel: Array<{
    id: string
    url: string
    isPrimary: boolean
  }>
  _count: {
    favorites: number
    inquiries: number
    views: number
  }
  inquiries: Array<{
    id: string
    subject: string
    contactName: string
    contactEmail: string
    createdAt: string
    isRead: boolean
  }>
}

interface ListingDashboardClientProps {
  businesses: Business[]
}

const STATUS_CONFIG = {
  DRAFT: {
    label: 'Draft',
    color: 'bg-secondary-100 text-secondary-800',
    icon: Edit3,
    description: 'Not yet published',
  },
  ACTIVE: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Live and visible to buyers',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Being reviewed by admin',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Needs revision',
  },
  SOLD: {
    label: 'Sold',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    description: 'Successfully sold',
  },
  ARCHIVED: {
    label: 'Archived',
    color: 'bg-secondary-100 text-secondary-600',
    icon: XCircle,
    description: 'No longer active',
  },
  EXPIRED: {
    label: 'Expired',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle,
    description: 'Listing has expired',
  },
}

export default function ListingDashboardClient({
  businesses,
}: ListingDashboardClientProps) {
  const router = useRouter()
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)

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
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.DRAFT
    )
  }

  const handleBusinessAction = (action: string, businessId: string) => {
    switch (action) {
      case 'view':
        const business = businesses.find(b => b.id === businessId)
        const slug =
          business?.slug ||
          `${business?.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${businessId.slice(-8)}`
        router.push(`/business/${slug}`)
        break
      case 'edit':
        router.push(`/dashboard/listings/${businessId}/edit`)
        break
      case 'duplicate':
        // TODO: Implement duplicate functionality
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this listing?')) {
          handleDeleteBusiness(businessId)
        }
        break
    }
  }

  const handleDeleteBusiness = async (businessId: string) => {
    try {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete business')
      }

      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete business. Please try again.')
    }
  }

  const stats = businesses.reduce(
    (acc, business) => {
      acc.totalViews += business._count.views
      acc.totalInquiries += business._count.inquiries
      acc.totalFavorites += business._count.favorites

      if (business.status === 'ACTIVE') acc.activeListings++
      if (business.status === 'DRAFT') acc.draftListings++
      if (business.inquiries.some(i => !i.isRead)) acc.unreadInquiries++

      return acc
    },
    {
      totalViews: 0,
      totalInquiries: 0,
      totalFavorites: 0,
      activeListings: 0,
      draftListings: 0,
      unreadInquiries: 0,
    }
  )

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              My Listings
            </h1>
            <p className="text-secondary-600 mt-2">
              Manage your business listings and track performance
            </p>
          </div>

          <button
            onClick={() => router.push('/sell')}
            className="flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Listing
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  Active Listings
                </p>
                <p className="text-3xl font-bold text-secondary-900 mt-2">
                  {stats.activeListings}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  Total Views
                </p>
                <p className="text-3xl font-bold text-secondary-900 mt-2">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  Inquiries
                </p>
                <p className="text-3xl font-bold text-secondary-900 mt-2">
                  {stats.totalInquiries}
                </p>
                {stats.unreadInquiries > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    {stats.unreadInquiries} unread
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  Favorites
                </p>
                <p className="text-3xl font-bold text-secondary-900 mt-2">
                  {stats.totalFavorites}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900">
              Your Business Listings ({businesses.length})
            </h2>
          </div>

          {businesses.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-secondary-900 mb-2">
                No listings yet
              </h3>
              <p className="text-secondary-600 mb-6">
                Create your first business listing to start attracting buyers.
              </p>
              <button
                onClick={() => router.push('/sell')}
                className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="divide-y divide-secondary-200">
              {businesses.map(business => {
                const statusConfig = getStatusConfig(business.status)
                const StatusIcon = statusConfig.icon
                const primaryImage =
                  business.images_rel[0]?.url || business.images[0]

                return (
                  <div
                    key={business.id}
                    className="p-6 hover:bg-secondary-50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Business Image */}
                      <div className="w-24 h-18 bg-secondary-200 rounded-lg overflow-hidden flex-shrink-0">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={business.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-secondary-400" />
                          </div>
                        )}
                      </div>

                      {/* Business Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-secondary-900 mb-1 truncate">
                              {business.title}
                              {business.featured && (
                                <Star className="w-4 h-4 text-yellow-500 inline ml-2" />
                              )}
                            </h3>

                            <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-2">
                              {business.category && (
                                <span>
                                  {business.category.replace('_', ' ')}
                                </span>
                              )}
                              {business.city && business.state && (
                                <span>
                                  {business.city}, {business.state}
                                </span>
                              )}
                              <span className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {formatPrice(business.askingPrice)}
                              </span>
                            </div>

                            {/* Status */}
                            <div className="flex items-center mb-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </span>
                              <span className="text-xs text-secondary-500 ml-3">
                                {statusConfig.description}
                              </span>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center space-x-6 text-sm text-secondary-600">
                              <span className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {business._count.views} views
                              </span>
                              <span className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {business._count.inquiries} inquiries
                                {business.inquiries.some(i => !i.isRead) && (
                                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-2">
                                    {
                                      business.inquiries.filter(i => !i.isRead)
                                        .length
                                    }
                                  </span>
                                )}
                              </span>
                              <span className="flex items-center">
                                <Heart className="w-4 h-4 mr-1" />
                                {business._count.favorites} favorites
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() =>
                                handleBusinessAction('view', business.id)
                              }
                              className="p-2 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100 rounded-lg transition-colors"
                              title="View listing"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                handleBusinessAction('edit', business.id)
                              }
                              className="p-2 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100 rounded-lg transition-colors"
                              title="Edit listing"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <div className="relative">
                              <button
                                onClick={() =>
                                  setSelectedBusiness(
                                    selectedBusiness === business.id
                                      ? null
                                      : business.id
                                  )
                                }
                                className="p-2 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {selectedBusiness === business.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-secondary-200 rounded-lg shadow-lg z-10">
                                  <button
                                    onClick={() => {
                                      handleBusinessAction(
                                        'duplicate',
                                        business.id
                                      )
                                      setSelectedBusiness(null)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 rounded-t-lg"
                                  >
                                    Duplicate
                                  </button>
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/dashboard/inquiries?businessId=${business.id}`
                                      )
                                      setSelectedBusiness(null)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50"
                                  >
                                    View Inquiries
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleBusinessAction(
                                        'delete',
                                        business.id
                                      )
                                      setSelectedBusiness(null)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                  >
                                    <Trash2 className="w-4 h-4 inline mr-2" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Recent Inquiries */}
                        {business.inquiries.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-secondary-100">
                            <h4 className="text-sm font-medium text-secondary-900 mb-2">
                              Recent Inquiries:
                            </h4>
                            <div className="space-y-2">
                              {business.inquiries.slice(0, 2).map(inquiry => (
                                <div
                                  key={inquiry.id}
                                  className="flex items-center justify-between p-2 bg-secondary-50 rounded text-sm"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-secondary-900 truncate">
                                      {inquiry.subject}
                                    </p>
                                    <p className="text-secondary-600">
                                      From {inquiry.contactName} •{' '}
                                      {formatDistanceToNow(
                                        new Date(inquiry.createdAt),
                                        { addSuffix: true }
                                      )}
                                    </p>
                                  </div>
                                  {!inquiry.isRead && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
                                  )}
                                </div>
                              ))}
                              {business.inquiries.length > 2 && (
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/inquiries?businessId=${business.id}`
                                    )
                                  }
                                  className="text-sm text-primary-600 hover:text-primary-700"
                                >
                                  View all {business.inquiries.length} inquiries
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="mt-4 pt-4 border-t border-secondary-100 flex items-center justify-between text-xs text-secondary-500">
                          <span>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Created{' '}
                            {formatDistanceToNow(new Date(business.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <span>
                            Last updated{' '}
                            {formatDistanceToNow(new Date(business.updatedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {selectedBusiness && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setSelectedBusiness(null)}
        />
      )}
    </div>
  )
}
