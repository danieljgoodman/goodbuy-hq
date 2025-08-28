'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  MapPin,
  Calendar,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  Globe,
  Heart,
  Share2,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  FileText,
  Shield,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import InquiryModal from '@/components/modals/inquiry-modal'

interface BusinessDetailProps {
  business: {
    id: string
    title: string
    description: string
    category?: string
    listingType: string

    // Location
    address?: string
    city?: string
    state?: string
    zipCode?: string
    location?: string
    latitude?: number
    longitude?: number

    // Contact
    website?: string
    phone?: string
    email?: string

    // Financial
    askingPrice?: number | null
    revenue?: number | null
    profit?: number | null
    cashFlow?: number | null
    ebitda?: number | null
    grossMargin?: number | null
    netMargin?: number | null
    monthlyRevenue?: number | null
    yearlyGrowth?: number | null

    // Business details
    established?: string
    employees?: number
    customerBase?: number

    // Assets
    inventory?: number | null
    equipment?: number | null
    realEstate?: number | null
    totalAssets?: number | null
    liabilities?: number | null

    // Operations
    hoursOfOperation?: string
    daysOpen: string[]
    seasonality?: string
    competition?: string

    // Sale details
    reasonForSelling?: string
    timeframe?: string
    negotiations?: string
    financing?: string

    // Status
    status: string
    featured: boolean
    priority: number
    viewCount: number
    inquiryCount: number

    // Media
    images: string[]
    documents: string[]
    virtualTour?: string

    // Meta
    slug?: string
    createdAt: string
    updatedAt: string
    publishedAt?: string
    lastViewedAt?: string

    // Relations
    owner: {
      id: string
      name: string
      userType: string
      image?: string
      company?: string
      bio?: string
      createdAt: string
    }

    images_rel: Array<{
      id: string
      url: string
      thumbnailUrl?: string
      alt?: string
      caption?: string
      isPrimary: boolean
      orderIndex: number
    }>

    documents_rel: Array<{
      id: string
      name: string
      description?: string
      url: string
      type: string
      size?: number
      accessLevel: string
      requiresNDA: boolean
    }>

    evaluations: Array<{
      id: string
      title: string
      summary?: string
      financialScore?: number
      operationalScore?: number
      marketScore?: number
      overallScore?: number
      estimatedValue?: number
      completedAt?: string
      evaluator: {
        id: string
        name: string
        userType: string
      }
    }>

    _count: {
      favorites: number
      inquiries: number
      views: number
    }
  }
}

export default function BusinessDetailClient({
  business,
}: BusinessDetailProps) {
  const { data: session } = useSession()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const images =
    business.images_rel.length > 0
      ? business.images_rel.map(img => img.url)
      : business.images

  const formatPrice = (price?: number | null) => {
    if (!price) return 'Price on request'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatNumber = (num?: number | null) => {
    if (!num) return 'N/A'
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPercentage = (num?: number | null) => {
    if (!num) return 'N/A'
    return `${num.toFixed(1)}%`
  }

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)
  }

  const handleFavorite = async () => {
    if (!session) {
      alert('Please sign in to save favorites')
      return
    }

    try {
      const response = await fetch('/api/businesses/favorites', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id }),
      })

      if (response.ok) {
        setIsFavorited(!isFavorited)
      }
    } catch (error) {
      console.error('Favorite error:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.title,
          text: business.description,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Image Gallery */}
      <div className="relative h-96 bg-secondary-200">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={business.title}
              className="w-full h-full object-cover"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-16 h-16 text-secondary-400" />
          </div>
        )}

        {business.featured && (
          <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 inline mr-1" />
            Featured
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                      {business.title}
                    </h1>

                    <div className="flex items-center space-x-4 text-secondary-600 mb-4">
                      {business.category && (
                        <span className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {business.category.charAt(0) +
                            business.category
                              .slice(1)
                              .toLowerCase()
                              .replace('_', ' ')}
                        </span>
                      )}

                      {business.location && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {business.location}
                        </span>
                      )}

                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Listed{' '}
                        {formatDistanceToNow(new Date(business.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={handleFavorite}
                      className={`
                        p-2 rounded-full transition-colors
                        ${
                          isFavorited
                            ? 'bg-red-100 text-red-600'
                            : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                        }
                      `}
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`}
                      />
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full bg-secondary-100 text-secondary-600 hover:bg-secondary-200 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-primary-600">
                    {formatPrice(business.askingPrice)}
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-secondary-600">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {formatNumber(business._count.views)} views
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {formatNumber(business._count.favorites)} favorites
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {formatNumber(business._count.inquiries)} inquiries
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                  Business Description
                </h2>
                <div className="prose max-w-none">
                  <p className="text-secondary-700 leading-relaxed whitespace-pre-wrap">
                    {business.description}
                  </p>
                </div>
              </div>

              {/* Financial Information */}
              {(business.revenue || business.profit || business.cashFlow) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                    Financial Overview
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {business.revenue && (
                      <div className="text-center p-4 bg-primary-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600">
                          {formatPrice(business.revenue)}
                        </div>
                        <div className="text-sm text-secondary-600">
                          Annual Revenue
                        </div>
                      </div>
                    )}

                    {business.profit && (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(business.profit)}
                        </div>
                        <div className="text-sm text-secondary-600">
                          Annual Profit
                        </div>
                      </div>
                    )}

                    {business.cashFlow && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPrice(business.cashFlow)}
                        </div>
                        <div className="text-sm text-secondary-600">
                          Cash Flow
                        </div>
                      </div>
                    )}

                    {business.ebitda && (
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPrice(business.ebitda)}
                        </div>
                        <div className="text-sm text-secondary-600">EBITDA</div>
                      </div>
                    )}

                    {business.grossMargin && (
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {formatPercentage(business.grossMargin)}
                        </div>
                        <div className="text-sm text-secondary-600">
                          Gross Margin
                        </div>
                      </div>
                    )}

                    {business.netMargin && (
                      <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatPercentage(business.netMargin)}
                        </div>
                        <div className="text-sm text-secondary-600">
                          Net Margin
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Business Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                  Business Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {business.established && (
                    <div>
                      <div className="text-sm text-secondary-600 mb-1">
                        Established
                      </div>
                      <div className="font-medium text-secondary-900">
                        {business.established}
                      </div>
                    </div>
                  )}

                  {business.employees && (
                    <div>
                      <div className="text-sm text-secondary-600 mb-1">
                        Employees
                      </div>
                      <div className="font-medium text-secondary-900">
                        {formatNumber(business.employees)}
                      </div>
                    </div>
                  )}

                  {business.customerBase && (
                    <div>
                      <div className="text-sm text-secondary-600 mb-1">
                        Customer Base
                      </div>
                      <div className="font-medium text-secondary-900">
                        {formatNumber(business.customerBase)}
                      </div>
                    </div>
                  )}

                  {business.hoursOfOperation && (
                    <div>
                      <div className="text-sm text-secondary-600 mb-1">
                        Hours
                      </div>
                      <div className="font-medium text-secondary-900">
                        {business.hoursOfOperation}
                      </div>
                    </div>
                  )}

                  {business.daysOpen.length > 0 && (
                    <div>
                      <div className="text-sm text-secondary-600 mb-1">
                        Days Open
                      </div>
                      <div className="font-medium text-secondary-900">
                        {business.daysOpen.join(', ')}
                      </div>
                    </div>
                  )}

                  {business.yearlyGrowth && (
                    <div>
                      <div className="text-sm text-secondary-600 mb-1">
                        Yearly Growth
                      </div>
                      <div className="font-medium text-secondary-900">
                        {formatPercentage(business.yearlyGrowth)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Assets & Liabilities */}
              {(business.inventory ||
                business.equipment ||
                business.realEstate) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                    Assets & Liabilities
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {business.inventory && (
                      <div>
                        <div className="text-sm text-secondary-600 mb-1">
                          Inventory Value
                        </div>
                        <div className="font-medium text-secondary-900">
                          {formatPrice(business.inventory)}
                        </div>
                      </div>
                    )}

                    {business.equipment && (
                      <div>
                        <div className="text-sm text-secondary-600 mb-1">
                          Equipment Value
                        </div>
                        <div className="font-medium text-secondary-900">
                          {formatPrice(business.equipment)}
                        </div>
                      </div>
                    )}

                    {business.realEstate && (
                      <div>
                        <div className="text-sm text-secondary-600 mb-1">
                          Real Estate Value
                        </div>
                        <div className="font-medium text-secondary-900">
                          {formatPrice(business.realEstate)}
                        </div>
                      </div>
                    )}

                    {business.totalAssets && (
                      <div>
                        <div className="text-sm text-secondary-600 mb-1">
                          Total Assets
                        </div>
                        <div className="font-medium text-secondary-900">
                          {formatPrice(business.totalAssets)}
                        </div>
                      </div>
                    )}

                    {business.liabilities && (
                      <div>
                        <div className="text-sm text-secondary-600 mb-1">
                          Liabilities
                        </div>
                        <div className="font-medium text-secondary-900">
                          {formatPrice(business.liabilities)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sale Information */}
              {(business.reasonForSelling ||
                business.timeframe ||
                business.financing) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                    Sale Information
                  </h2>

                  {business.reasonForSelling && (
                    <div className="mb-4">
                      <h3 className="font-medium text-secondary-900 mb-2">
                        Reason for Selling
                      </h3>
                      <p className="text-secondary-700">
                        {business.reasonForSelling}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {business.timeframe && (
                      <div>
                        <div className="text-sm text-secondary-600 mb-1">
                          Sale Timeframe
                        </div>
                        <div className="font-medium text-secondary-900">
                          {business.timeframe
                            .replace('_', ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    )}

                    {business.negotiations && (
                      <div>
                        <div className="text-sm text-secondary-600 mb-1">
                          Price Negotiations
                        </div>
                        <div className="font-medium text-secondary-900">
                          {business.negotiations
                            .replace('_', ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    )}
                  </div>

                  {business.financing && (
                    <div className="mt-4">
                      <h3 className="font-medium text-secondary-900 mb-2">
                        Financing Options
                      </h3>
                      <p className="text-secondary-700">{business.financing}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Evaluation */}
              {business.evaluations.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                    Professional Evaluation
                  </h2>

                  {business.evaluations.map(evaluation => (
                    <div
                      key={evaluation.id}
                      className="border-l-4 border-primary-500 pl-4"
                    >
                      <h3 className="font-medium text-secondary-900 mb-2">
                        {evaluation.title}
                      </h3>

                      {evaluation.summary && (
                        <p className="text-secondary-700 mb-4">
                          {evaluation.summary}
                        </p>
                      )}

                      {evaluation.overallScore && (
                        <div className="flex items-center mb-4">
                          <span className="text-sm text-secondary-600 mr-3">
                            Overall Score:
                          </span>
                          <div className="flex-1 bg-secondary-200 rounded-full h-2 mr-3">
                            <div
                              className="bg-primary-500 h-2 rounded-full"
                              style={{ width: `${evaluation.overallScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-secondary-900">
                            {evaluation.overallScore}/100
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-secondary-500">
                        Evaluated by {evaluation.evaluator.name} •{' '}
                        {evaluation.completedAt
                          ? format(
                              new Date(evaluation.completedAt),
                              'MMM d, yyyy'
                            )
                          : 'Recent'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <button
                  onClick={() => setShowInquiryModal(true)}
                  className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium mb-4"
                >
                  Contact Seller
                </button>

                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-secondary-200">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      {business.owner.image ? (
                        <img
                          src={business.owner.image}
                          alt={business.owner.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                    <div className="font-medium text-secondary-900">
                      {business.owner.name}
                    </div>
                    <div className="text-sm text-secondary-600">
                      {business.owner.userType
                        .replace('_', ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    {business.owner.company && (
                      <div className="text-sm text-secondary-600">
                        {business.owner.company}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    {business.website && (
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary-600 hover:text-primary-700"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                      </a>
                    )}

                    {business.phone && (
                      <a
                        href={`tel:${business.phone}`}
                        className="flex items-center text-secondary-600 hover:text-secondary-700"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {business.phone}
                      </a>
                    )}

                    {business.email && (
                      <a
                        href={`mailto:${business.email}`}
                        className="flex items-center text-secondary-600 hover:text-secondary-700"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {business.email}
                      </a>
                    )}
                  </div>

                  <div className="pt-4 border-t border-secondary-200 text-xs text-secondary-500">
                    Member since{' '}
                    {format(new Date(business.owner.createdAt), 'MMM yyyy')}
                  </div>
                </div>
              </div>

              {/* Documents */}
              {business.documents_rel.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                    Available Documents
                  </h3>

                  <div className="space-y-3">
                    {business.documents_rel.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                      >
                        <div className="flex items-center flex-1">
                          <FileText className="w-4 h-4 text-secondary-400 mr-3" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-secondary-900">
                              {doc.name}
                            </div>
                            {doc.description && (
                              <div className="text-xs text-secondary-600">
                                {doc.description}
                              </div>
                            )}
                          </div>
                        </div>

                        {doc.requiresNDA && (
                          <Shield className="w-4 h-4 text-yellow-600 ml-2" />
                        )}
                      </div>
                    ))}

                    <div className="text-xs text-secondary-500 mt-3">
                      Contact seller to access confidential documents
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Quick Stats
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Listed</span>
                    <span className="font-medium text-secondary-900">
                      {formatDistanceToNow(new Date(business.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-secondary-600">Views</span>
                    <span className="font-medium text-secondary-900">
                      {formatNumber(business._count.views)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-secondary-600">Inquiries</span>
                    <span className="font-medium text-secondary-900">
                      {formatNumber(business._count.inquiries)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-secondary-600">Listing ID</span>
                    <span className="font-medium text-secondary-900 text-xs">
                      {business.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        business={{
          id: business.id,
          title: business.title,
          owner: {
            name: business.owner.name,
          },
        }}
        onSuccess={() => {
          // Could show a success message or refresh data
          console.log('Inquiry sent successfully')
        }}
      />
    </div>
  )
}
