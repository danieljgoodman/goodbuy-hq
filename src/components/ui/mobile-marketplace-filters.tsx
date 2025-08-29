'use client'

import { useState } from 'react'
import {
  Filter,
  X,
  Search,
  MapPin,
  DollarSign,
  Building2,
  Star,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

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

interface MobileFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: Partial<SearchFilters>) => void
  onClearFilters: () => void
  totalResults: number
  isLoading: boolean
}

const BUSINESS_CATEGORIES = [
  { value: 'RESTAURANT', label: 'Restaurant', icon: '🍽️' },
  { value: 'RETAIL', label: 'Retail', icon: '🛍️' },
  { value: 'ECOMMERCE', label: 'E-commerce', icon: '💻' },
  { value: 'TECHNOLOGY', label: 'Technology', icon: '⚡' },
  { value: 'MANUFACTURING', label: 'Manufacturing', icon: '🏭' },
  { value: 'SERVICES', label: 'Services', icon: '🔧' },
  { value: 'HEALTHCARE', label: 'Healthcare', icon: '🏥' },
  { value: 'REAL_ESTATE', label: 'Real Estate', icon: '🏠' },
  { value: 'AUTOMOTIVE', label: 'Automotive', icon: '🚗' },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: '🎭' },
  { value: 'EDUCATION', label: 'Education', icon: '📚' },
  { value: 'OTHER', label: 'Other', icon: '📋' },
]

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Recently Listed' },
  { value: 'askingPrice', label: 'Price' },
  { value: 'viewCount', label: 'Most Viewed' },
  { value: 'inquiryCount', label: 'Most Inquired' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'title', label: 'Alphabetical' },
]

const PRICE_RANGES = [
  { label: 'Under $100K', min: '0', max: '100000' },
  { label: '$100K - $500K', min: '100000', max: '500000' },
  { label: '$500K - $1M', min: '500000', max: '1000000' },
  { label: '$1M - $5M', min: '1000000', max: '5000000' },
  { label: '$5M+', min: '5000000', max: '' },
]

export function MobileMarketplaceFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults,
  isLoading,
}: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sort' || key === 'order') return false
    if (typeof value === 'boolean') return value
    return value && value !== ''
  }).length

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange(updates)
  }

  const clearAllFilters = () => {
    onClearFilters()
    setIsOpen(false)
  }

  const applyPriceRange = (min: string, max: string) => {
    updateFilters({ minPrice: min, maxPrice: max })
  }

  // Mobile search bar
  const SearchBar = () => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        type="text"
        placeholder="Search businesses..."
        value={filters.search}
        onChange={e => updateFilters({ search: e.target.value })}
        className="pl-10 h-12 text-base"
      />
    </div>
  )

  // Filter section component
  const FilterSection = ({
    title,
    children,
    isOpen,
    onToggle,
  }: {
    title: string
    children: React.ReactNode
    isOpen: boolean
    onToggle: () => void
  }) => (
    <div className="border-b border-border pb-4 mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <h3 className="font-semibold text-base">{title}</h3>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  )

  // Filter content
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Quick Search */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Quick Search</Label>
        <SearchBar />
      </div>

      {/* Category Filter */}
      <FilterSection
        title="Category"
        isOpen={activeSection === 'category'}
        onToggle={() =>
          setActiveSection(activeSection === 'category' ? null : 'category')
        }
      >
        <div className="grid grid-cols-2 gap-2">
          {BUSINESS_CATEGORIES.map(category => (
            <button
              key={category.value}
              onClick={() =>
                updateFilters({
                  category:
                    filters.category === category.value ? '' : category.value,
                })
              }
              className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                filters.category === category.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        isOpen={activeSection === 'price'}
        onToggle={() =>
          setActiveSection(activeSection === 'price' ? null : 'price')
        }
      >
        <div className="space-y-3">
          {/* Quick price ranges */}
          <div className="grid grid-cols-1 gap-2">
            {PRICE_RANGES.map((range, index) => (
              <button
                key={index}
                onClick={() => applyPriceRange(range.min, range.max)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  filters.minPrice === range.min &&
                  filters.maxPrice === range.max
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">{range.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="pt-3 border-t border-border">
            <Label className="text-sm font-medium mb-2 block">
              Custom Range
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice}
                  onChange={e => updateFilters({ minPrice: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice}
                  onChange={e => updateFilters({ maxPrice: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection
        title="Location"
        isOpen={activeSection === 'location'}
        onToggle={() =>
          setActiveSection(activeSection === 'location' ? null : 'location')
        }
      >
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="City, State or ZIP"
            value={filters.location}
            onChange={e => updateFilters({ location: e.target.value })}
            className="pl-10 h-12"
          />
        </div>
      </FilterSection>

      {/* Sort & Options */}
      <FilterSection
        title="Sort & Options"
        isOpen={activeSection === 'sort'}
        onToggle={() =>
          setActiveSection(activeSection === 'sort' ? null : 'sort')
        }
      >
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Sort by</Label>
            <Select
              value={`${filters.sort}-${filters.order}`}
              onValueChange={value => {
                const [sort, order] = value.split('-')
                updateFilters({ sort, order })
              }}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <div key={option.value}>
                    <SelectItem value={`${option.value}-desc`}>
                      {option.label} (High to Low)
                    </SelectItem>
                    <SelectItem value={`${option.value}-asc`}>
                      {option.label} (Low to High)
                    </SelectItem>
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.featured}
              onCheckedChange={checked =>
                updateFilters({ featured: !!checked })
              }
            />
            <Label htmlFor="featured" className="text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Featured listings only
              </div>
            </Label>
          </div>
        </div>
      </FilterSection>
    </div>
  )

  // Desktop version uses Sheet
  const DesktopFilters = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Filters</SheetTitle>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${totalResults} results found`}
          </div>
        </SheetHeader>
        <div className="overflow-y-auto max-h-[calc(100vh-150px)]">
          <FilterContent />
        </div>
      </SheetContent>
    </Sheet>
  )

  // Mobile version uses Drawer
  const MobileFilters = () => (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="lg" className="relative h-12">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl">Filter Businesses</DrawerTitle>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${totalResults} results found`}
          </div>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">
          <FilterContent />
        </div>
        <div className="p-4 border-t border-border bg-background">
          <Button onClick={() => setIsOpen(false)} className="w-full h-12">
            Show Results ({totalResults})
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )

  // Active filters display
  const ActiveFilters = () => {
    if (activeFilterCount === 0) return null

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {filters.search && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Search className="h-3 w-3" />
            {filters.search}
            <button
              onClick={() => updateFilters({ search: '' })}
              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {filters.category && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {BUSINESS_CATEGORIES.find(c => c.value === filters.category)?.label}
            <button
              onClick={() => updateFilters({ category: '' })}
              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {(filters.minPrice || filters.maxPrice) && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {filters.minPrice && filters.maxPrice
              ? `$${parseInt(filters.minPrice).toLocaleString()} - $${parseInt(filters.maxPrice).toLocaleString()}`
              : filters.minPrice
                ? `$${parseInt(filters.minPrice).toLocaleString()}+`
                : `Under $${parseInt(filters.maxPrice).toLocaleString()}`}
            <button
              onClick={() => updateFilters({ minPrice: '', maxPrice: '' })}
              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {filters.location && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {filters.location}
            <button
              onClick={() => updateFilters({ location: '' })}
              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {filters.featured && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Featured Only
            <button
              onClick={() => updateFilters({ featured: false })}
              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Filter button - responsive */}
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <DesktopFilters />
        </div>
        <div className="block md:hidden">
          <MobileFilters />
        </div>
      </div>

      {/* Active filters */}
      <ActiveFilters />
    </div>
  )
}
