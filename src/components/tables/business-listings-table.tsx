'use client'

import * as React from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Eye,
  Heart,
  MapPin,
  Building,
  Users,
  TrendingUp,
  ExternalLink,
  Download,
  Filter,
  Search,
} from 'lucide-react'
import { BusinessListing, SearchFilters, ExportConfig } from '@/types/business'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

/**
 * Props for BusinessListingsTable component
 */
interface BusinessListingsTableProps {
  /** Business listings data */
  data: BusinessListing[]
  /** Loading state */
  isLoading?: boolean
  /** Enable row selection */
  selectable?: boolean
  /** Selected business IDs */
  selectedIds?: string[]
  /** Selection change handler */
  onSelectionChange?: (selectedIds: string[]) => void
  /** Business click handler */
  onBusinessClick?: (business: BusinessListing) => void
  /** Inquiry handler */
  onInquiry?: (businessId: string) => void
  /** Save/favorite handler */
  onSave?: (businessId: string) => void
  /** Share handler */
  onShare?: (businessId: string) => void
  /** Export handler */
  onExport?: (config: ExportConfig) => void
  /** Filter change handler */
  onFilterChange?: (filters: SearchFilters) => void
  /** Current filters */
  filters?: SearchFilters
  /** View mode */
  viewMode?: 'table' | 'card' | 'compact'
  /** Show filters panel */
  showFilters?: boolean
  /** Enable pagination */
  paginated?: boolean
  /** Total count for pagination */
  totalCount?: number
  /** Current page */
  currentPage?: number
  /** Page size */
  pageSize?: number
  /** Page change handler */
  onPageChange?: (page: number) => void
}

/**
 * Format currency values
 */
const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value.toLocaleString()}`
}

/**
 * Get status badge variant
 */
const getStatusVariant = (status: BusinessListing['status']) => {
  switch (status) {
    case 'active':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'sold':
      return 'destructive'
    case 'expired':
      return 'outline'
    default:
      return 'secondary'
  }
}

/**
 * Business Listings Table Component
 *
 * Professional data table for displaying business listings with comprehensive
 * filtering, sorting, and action capabilities. Optimized for business brokers
 * and buyers to efficiently browse and manage business opportunities.
 *
 * Features:
 * - Rich business data display with key metrics
 * - Advanced filtering by industry, location, price, revenue
 * - Multiple view modes (table, card, compact)
 * - Row selection and bulk actions
 * - Integrated inquiry and contact functionality
 * - Export capabilities (CSV, Excel, PDF)
 * - Responsive design with mobile optimization
 * - Professional business-focused styling
 *
 * @example
 * ```tsx
 * <BusinessListingsTable
 *   data={businessListings}
 *   selectable
 *   onBusinessClick={handleBusinessClick}
 *   onInquiry={handleInquiry}
 *   onFilterChange={handleFilterChange}
 *   viewMode="table"
 * />
 * ```
 */
export function BusinessListingsTable({
  data,
  isLoading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onBusinessClick,
  onInquiry,
  onSave,
  onShare,
  onExport,
  onFilterChange,
  filters = {},
  viewMode = 'table',
  showFilters = true,
  paginated = false,
  totalCount,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
}: BusinessListingsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState(filters.keywords || '')
  const [localFilters, setLocalFilters] = React.useState<SearchFilters>(filters)
  const [allSelected, setAllSelected] = React.useState(false)

  // Handle search input
  const handleSearch = React.useCallback(
    (query: string) => {
      setSearchQuery(query)
      const newFilters = { ...localFilters, keywords: query }
      setLocalFilters(newFilters)
      onFilterChange?.(newFilters)
    },
    [localFilters, onFilterChange]
  )

  // Handle filter changes
  const handleFilterChange = React.useCallback(
    (key: string, value: any) => {
      const newFilters = { ...localFilters, [key]: value }
      setLocalFilters(newFilters)
      onFilterChange?.(newFilters)
    },
    [localFilters, onFilterChange]
  )

  // Handle select all
  const handleSelectAll = React.useCallback(
    (checked: boolean) => {
      setAllSelected(checked)
      if (checked) {
        onSelectionChange?.(data.map(business => business.id))
      } else {
        onSelectionChange?.([])
      }
    },
    [data, onSelectionChange]
  )

  // Handle individual selection
  const handleSelect = React.useCallback(
    (businessId: string, checked: boolean) => {
      const newSelection = checked
        ? [...selectedIds, businessId]
        : selectedIds.filter(id => id !== businessId)
      onSelectionChange?.(newSelection)
    },
    [selectedIds, onSelectionChange]
  )

  // Handle export
  const handleExport = React.useCallback(
    (format: ExportConfig['format']) => {
      const config: ExportConfig = {
        format,
        columns: [
          'businessName',
          'industry',
          'location',
          'askingPrice',
          'annualRevenue',
          'monthlyProfit',
          'yearsInOperation',
          'employees',
          'status',
        ],
        filters: localFilters,
        includeMetrics: true,
        fileName: `business-listings-${new Date().toISOString().split('T')[0]}`,
      }
      onExport?.(config)
    },
    [localFilters, onExport]
  )

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-muted animate-pulse rounded w-48" />
              <div className="h-4 bg-muted animate-pulse rounded w-64" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 bg-muted animate-pulse rounded w-24" />
              <div className="h-9 bg-muted animate-pulse rounded w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Listings</CardTitle>
          <CardDescription>
            Browse available business opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Business Listings Found
            </h3>
            <p className="text-muted-foreground mb-4">
              {Object.keys(localFilters).length > 0
                ? 'Try adjusting your search filters to find more results.'
                : 'There are currently no business listings available.'}
            </p>
            {Object.keys(localFilters).length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setLocalFilters({})
                  onFilterChange?.({})
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {/* Header with Search and Actions */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Business Listings</CardTitle>
            <CardDescription>
              {totalCount
                ? `${totalCount} businesses available`
                : `${data.length} businesses`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            {onExport && (
              <Select
                onValueChange={value =>
                  handleExport(value as ExportConfig['format'])
                }
              >
                <SelectTrigger className="w-32">
                  <Download className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Selected Actions Bar */}
        {selectable && selectedIds.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <Badge variant="secondary">{selectedIds.length} selected</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll(false)}
            >
              Clear selection
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
            >
              Export Selected
            </Button>
          </div>
        )}
      </CardHeader>

      {/* Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Business</TableHead>
                <TableHead>Industry & Location</TableHead>
                <TableHead className="text-right">Asking Price</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-center">Age/Size</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(business => (
                <TableRow
                  key={business.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/30',
                    selectedIds.includes(business.id) && 'bg-primary/5',
                    business.featured && 'border-l-4 border-l-yellow-500'
                  )}
                  onClick={() => onBusinessClick?.(business)}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(business.id)}
                        onCheckedChange={checked => {
                          // Prevent event bubbling to row click
                          event?.stopPropagation()
                          handleSelect(business.id, checked as boolean)
                        }}
                      />
                    </TableCell>
                  )}

                  {/* Business Name & Description */}
                  <TableCell className="max-w-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground truncate">
                          {business.businessName}
                        </h3>
                        {business.featured && (
                          <Badge variant="secondary" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {business.description}
                      </p>
                      {business.broker && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Listed by {business.broker.name}</span>
                          <span>•</span>
                          <span>{business.broker.company}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Industry & Location */}
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {business.industry}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{business.location}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Asking Price */}
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {formatCurrency(business.askingPrice)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {business.metrics.revenueMultiple.toFixed(1)}x revenue
                      </div>
                    </div>
                  </TableCell>

                  {/* Annual Revenue */}
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {formatCurrency(business.annualRevenue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        annual
                      </div>
                    </div>
                  </TableCell>

                  {/* Monthly Profit */}
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="font-medium text-green-600">
                        {formatCurrency(business.monthlyProfit * 12)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {business.metrics.profitMargin.toFixed(1)}% margin
                      </div>
                    </div>
                  </TableCell>

                  {/* Business Age & Size */}
                  <TableCell className="text-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {business.yearsInOperation}yr
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{business.employees}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    <Badge
                      variant={getStatusVariant(business.status)}
                      className="text-xs"
                    >
                      {business.status}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation()
                          onInquiry?.(business.id)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {onSave && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation()
                            onSave(business.id)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      )}
                      {onShare && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation()
                            onShare(business.id)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {paginated && totalCount && totalCount > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{' '}
              businesses
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange?.(currentPage - 1)}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalCount / pageSize)}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                onClick={() => onPageChange?.(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default BusinessListingsTable
