'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Building2, 
  Star,
  Eye,
  Heart,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Business {
  id: string
  title: string
  description: string
  category?: string
  listingType: string
  city?: string
  state?: string
  location?: string
  askingPrice?: number
  revenue?: number
  profit?: number
  employees?: number
  established?: string
  status: string
  featured: boolean
  priority: number
  viewCount: number
  inquiryCount: number
  images: string[]
  slug?: string
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string
    userType: string
  }
  _count: {
    favorites: number
    inquiries: number
    views: number
  }
}

interface SearchFilters {
  search: string
  category: string
  minPrice: string
  maxPrice: string
  location: string
  listingType: string
  featured: boolean
  sort: string
  order: string
}

const BUSINESS_CATEGORIES = [
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'ECOMMERCE', label: 'E-commerce' },
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'OTHER', label: 'Other' }
]

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Recently Listed' },
  { value: 'askingPrice', label: 'Price' },
  { value: 'viewCount', label: 'Most Viewed' },
  { value: 'inquiryCount', label: 'Most Inquired' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'title', label: 'Alphabetical' }
]

export default function MarketplacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  
  const [filters, setFilters] = useState<SearchFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    location: searchParams.get('location') || '',
    listingType: searchParams.get('listingType') || '',
    featured: searchParams.get('featured') === 'true',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc'
  })
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const fetchBusinesses = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      params.set('page', page.toString())
      params.set('limit', pagination.limit.toString())
      params.set('status', 'ACTIVE')
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== false) {
          params.set(key, value.toString())
        }
      })

      const response = await fetch(`/api/businesses?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch businesses')
      }

      const data = await response.json()
      setBusinesses(data.businesses)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.limit])

  useEffect(() => {
    fetchBusinesses(1)
  }, [filters])

  const updateFilters = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    
    // Update URL
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        params.set(key, value.toString())
      }
    })
    
    router.push(`/marketplace?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      listingType: '',
      featured: false,
      sort: 'createdAt',
      order: 'desc'
    })
    router.push('/marketplace')
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleBusinessClick = (business: Business) => {
    const slug = business.slug || `${business.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${business.id.slice(-8)}`
    router.push(`/business/${slug}`)
  }

  const renderBusinessCard = (business: Business) => {
    const primaryImage = business.images[0] || '/placeholder-business.jpg'
    
    if (viewMode === 'list') {
      return (
        <div
          key={business.id}
          onClick={() => handleBusinessClick(business)}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
        >
          <div className="flex">
            <div className="w-64 h-48 flex-shrink-0">
              <img
                src={primaryImage}
                alt={business.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {business.title}
                  </h3>
                  <p className="text-secondary-600 line-clamp-2 mb-3">
                    {business.description}
                  </p>
                </div>
                
                {business.featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                    <Star className="w-3 h-3 inline mr-1" />
                    Featured
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-secondary-600 space-x-4 mb-4">
                <span className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  {business.category?.charAt(0) + business.category?.slice(1).toLowerCase().replace('_', ' ')}
                </span>
                
                {business.location && (
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {business.location}
                  </span>
                )}
                
                {business.employees && (
                  <span>
                    {business.employees} employees
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(business.askingPrice)}
                  </span>
                  
                  {business.revenue && (
                    <span className="text-sm text-secondary-600">
                      Rev: {formatPrice(business.revenue)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-secondary-500">
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {business._count.views}
                  </span>
                  <span className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {business._count.favorites}
                  </span>
                  <span>
                    {formatDistanceToNow(new Date(business.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        key={business.id}
        onClick={() => handleBusinessClick(business)}
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      >
        <div className="relative">
          <img
            src={primaryImage}
            alt={business.title}
            className="w-full h-48 object-cover"
          />
          
          {business.featured && (
            <div className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
              <Star className="w-3 h-3 inline mr-1" />
              Featured
            </div>
          )}
          
          <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-secondary-600" />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-1">
            {business.title}
          </h3>
          
          <p className="text-secondary-600 text-sm line-clamp-2 mb-3">
            {business.description}
          </p>
          
          <div className="flex items-center text-sm text-secondary-600 space-x-3 mb-3">
            {business.category && (
              <span className="flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                {business.category.charAt(0) + business.category.slice(1).toLowerCase().replace('_', ' ')}
              </span>
            )}
            
            {business.location && (
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {business.location}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary-600">
              {formatPrice(business.askingPrice)}
            </span>
            
            <div className="flex items-center space-x-2 text-sm text-secondary-500">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {business._count.views}
              </span>
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {business._count.favorites}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-secondary-900">
              Business Marketplace
            </h1>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${showFilters 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }
                `}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </button>
              
              <div className="flex items-center bg-secondary-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-secondary-200'}
                  `}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-secondary-200'}
                  `}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 bg-white rounded-lg shadow-md p-6 h-fit">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-secondary-900">
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilters({ category: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {BUSINESS_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => updateFilters({ minPrice: e.target.value })}
                      className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                      className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={filters.location}
                    onChange={(e) => updateFilters({ location: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Featured Only */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => updateFilters({ featured: e.target.checked })}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-700">
                      Featured listings only
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-secondary-600">
                {loading ? (
                  'Loading...'
                ) : (
                  `${pagination.total} business${pagination.total !== 1 ? 'es' : ''} found`
                )}
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-secondary-600">Sort by:</span>
                <select
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-')
                    updateFilters({ sort, order })
                  }}
                  className="px-3 py-1 border border-secondary-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {SORT_OPTIONS.map(option => (
                    <>
                      <option key={`${option.value}-desc`} value={`${option.value}-desc`}>
                        {option.label} (High to Low)
                      </option>
                      <option key={`${option.value}-asc`} value={`${option.value}-asc`}>
                        {option.label} (Low to High)
                      </option>
                    </>
                  ))}
                </select>
              </div>
            </div>

            {/* Business Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-secondary-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-secondary-200 rounded"></div>
                      <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                      <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-secondary-900 mb-2">
                  No businesses found
                </h3>
                <p className="text-secondary-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-6'
                }
              `}>
                {businesses.map(renderBusinessCard)}
              </div>
            )}

            {/* Pagination */}
            {!loading && businesses.length > 0 && pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <button
                  onClick={() => fetchBusinesses(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-secondary-300 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(page => {
                    return Math.abs(page - pagination.page) <= 2 || page === 1 || page === pagination.pages
                  })
                  .map((page, index, array) => (
                    <div key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-secondary-400">...</span>
                      )}
                      <button
                        onClick={() => fetchBusinesses(page)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${page === pagination.page
                            ? 'bg-primary-500 text-white'
                            : 'border border-secondary-300 text-secondary-700 hover:bg-secondary-50'
                          }
                        `}
                      >
                        {page}
                      </button>
                    </div>
                  ))}

                <button
                  onClick={() => fetchBusinesses(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-secondary-300 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}