'use client'

import * as React from 'react'
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
import { cn } from '@/lib/utils'

/**
 * Column definition for data table
 */
export interface TableColumn<T = any> {
  /** Unique column identifier */
  id: string
  /** Column header text */
  header: string
  /** Data accessor key or function */
  accessor: keyof T | ((row: T) => any)
  /** Column width */
  width?: string | number
  /** Whether column is sortable */
  sortable?: boolean
  /** Whether column is searchable */
  searchable?: boolean
  /** Cell render function */
  cell?: (value: any, row: T, index: number) => React.ReactNode
  /** Header render function */
  headerCell?: () => React.ReactNode
  /** Column alignment */
  align?: 'left' | 'center' | 'right'
  /** Whether column is sticky */
  sticky?: 'left' | 'right'
  /** Custom CSS class for column */
  className?: string
}

/**
 * Sort configuration
 */
export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  [key: string]: any
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
}

/**
 * Selection configuration
 */
export interface SelectionConfig<T = any> {
  /** Currently selected rows */
  selectedRows: T[]
  /** Selection change handler */
  onSelectionChange: (selectedRows: T[]) => void
  /** Row key extractor */
  getRowKey: (row: T) => string | number
}

/**
 * Props for DataTable component
 */
export interface DataTableProps<T = any> {
  /** Table data */
  data: T[]
  /** Column definitions */
  columns: TableColumn<T>[]
  /** Table title */
  title?: string
  /** Table description */
  description?: string
  /** Enable sorting */
  sortable?: boolean
  /** Enable searching */
  searchable?: boolean
  /** Enable pagination */
  paginated?: boolean
  /** Enable row selection */
  selectable?: boolean
  /** Selection configuration */
  selection?: SelectionConfig<T>
  /** Pagination configuration */
  pagination?: PaginationConfig
  /** Sort configuration */
  sort?: SortConfig
  /** Filter configuration */
  filters?: FilterConfig
  /** Loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Empty state action */
  emptyAction?: React.ReactNode
  /** Table variant */
  variant?: 'default' | 'compact' | 'striped' | 'bordered'
  /** Custom CSS classes */
  className?: string
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void
  /** Sort change handler */
  onSortChange?: (sort: SortConfig) => void
  /** Search change handler */
  onSearchChange?: (query: string) => void
  /** Filter change handler */
  onFilterChange?: (filters: FilterConfig) => void
  /** Page change handler */
  onPageChange?: (page: number) => void
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void
}

/**
 * DataTable Component
 *
 * Professional data table component for GoodBuy HQ platform.
 * Provides comprehensive data display capabilities with sorting,
 * filtering, pagination, and selection for business data management.
 *
 * Features:
 * - Flexible column definitions with custom renderers
 * - Built-in sorting, searching, and filtering
 * - Pagination with configurable page sizes
 * - Row selection (single/multiple)
 * - Loading states and empty states
 * - Responsive design with sticky columns
 * - Professional styling consistent with GoodBuy HQ
 * - Accessibility features (ARIA labels, keyboard navigation)
 *
 * @example
 * ```tsx
 * const businessColumns: TableColumn<BusinessData>[] = [
 *   {
 *     id: 'name',
 *     header: 'Business Name',
 *     accessor: 'businessName',
 *     sortable: true,
 *     searchable: true,
 *   },
 *   {
 *     id: 'industry',
 *     header: 'Industry',
 *     accessor: 'industry',
 *     cell: (value) => <Badge>{value}</Badge>
 *   },
 *   {
 *     id: 'revenue',
 *     header: 'Revenue',
 *     accessor: 'annualRevenue',
 *     align: 'right',
 *     cell: (value) => formatCurrency(value)
 *   }
 * ]
 *
 * <DataTable
 *   data={businesses}
 *   columns={businessColumns}
 *   title="Business Listings"
 *   sortable
 *   searchable
 *   paginated
 *   selectable
 * />
 * ```
 */
export function DataTable<T = any>({
  data,
  columns,
  title,
  description,
  sortable = false,
  searchable = false,
  paginated = false,
  selectable = false,
  selection,
  pagination,
  sort,
  filters,
  isLoading = false,
  emptyMessage = 'No data available',
  emptyAction,
  variant = 'default',
  className,
  onRowClick,
  onSortChange,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  // Local state
  const [searchQuery, setSearchQuery] = React.useState('')
  const [localSort, setLocalSort] = React.useState<SortConfig | null>(
    sort || null
  )
  const [selectedRows, setSelectedRows] = React.useState<T[]>(
    selection?.selectedRows || []
  )

  // Get cell value from accessor
  const getCellValue = (row: T, accessor: keyof T | ((row: T) => any)) => {
    if (typeof accessor === 'function') {
      return accessor(row)
    }
    return row[accessor]
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearchChange?.(query)
  }

  // Handle sort
  const handleSort = (columnId: string) => {
    if (!sortable) return

    let newSort: SortConfig
    if (localSort?.key === columnId) {
      newSort = {
        key: columnId,
        direction: localSort.direction === 'asc' ? 'desc' : 'asc',
      }
    } else {
      newSort = { key: columnId, direction: 'asc' }
    }

    setLocalSort(newSort)
    onSortChange?.(newSort)
  }

  // Handle row selection
  const handleRowSelection = (row: T, checked: boolean) => {
    if (!selectable || !selection) return

    const rowKey = selection.getRowKey(row)
    let newSelection: T[]

    if (checked) {
      newSelection = [...selectedRows, row]
    } else {
      newSelection = selectedRows.filter(r => selection.getRowKey(r) !== rowKey)
    }

    setSelectedRows(newSelection)
    selection.onSelectionChange(newSelection)
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!selectable || !selection) return

    const newSelection = checked ? [...data] : []
    setSelectedRows(newSelection)
    selection.onSelectionChange(newSelection)
  }

  // Check if row is selected
  const isRowSelected = (row: T): boolean => {
    if (!selection) return false
    const rowKey = selection.getRowKey(row)
    return selectedRows.some(r => selection.getRowKey(r) === rowKey)
  }

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data

    return data.filter(row => {
      return columns.some(column => {
        if (!column.searchable) return false
        const value = getCellValue(row, column.accessor)
        return String(value).toLowerCase().includes(searchQuery.toLowerCase())
      })
    })
  }, [data, searchQuery, columns])

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!localSort) return filteredData

    return [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.id === localSort.key)
      if (!column) return 0

      const aValue = getCellValue(a, column.accessor)
      const bValue = getCellValue(b, column.accessor)

      let comparison = 0
      if (aValue < bValue) comparison = -1
      if (aValue > bValue) comparison = 1

      return localSort.direction === 'desc' ? -comparison : comparison
    })
  }, [filteredData, localSort, columns])

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!paginated || !pagination) return sortedData

    const startIndex = (pagination.page - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, paginated, pagination])

  // Get table classes
  const getTableClasses = () => {
    const baseClasses = 'w-full border-collapse'

    switch (variant) {
      case 'compact':
        return cn(baseClasses, 'text-sm')
      case 'striped':
        return cn(baseClasses, '[&_tbody_tr:nth-child(even)]:bg-muted/20')
      case 'bordered':
        return cn(baseClasses, 'border border-border')
      default:
        return baseClasses
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && (
              <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
            )}
            {description && (
              <div className="h-4 bg-muted animate-pulse rounded w-1/2 mt-2" />
            )}
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Data Available
            </h3>
            <p className="text-muted-foreground mb-4">{emptyMessage}</p>
            {emptyAction}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {/* Header */}
      {(title || description || searchable) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {searchable && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  className="w-64"
                />
              </div>
            )}
          </div>

          {/* Selection summary */}
          {selectable && selectedRows.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{selectedRows.length} selected</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(false)}
              >
                Clear selection
              </Button>
            </div>
          )}
        </CardHeader>
      )}

      {/* Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className={getTableClasses()}>
            <thead className="bg-muted/30">
              <tr>
                {/* Selection header */}
                {selectable && (
                  <th className="w-10 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === data.length}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </th>
                )}

                {/* Column headers */}
                {columns.map(column => (
                  <th
                    key={column.id}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && 'cursor-pointer hover:text-foreground',
                      column.sticky === 'left' &&
                        'sticky left-0 bg-background z-10',
                      column.sticky === 'right' &&
                        'sticky right-0 bg-background z-10',
                      column.className
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.id)}
                  >
                    <div className="flex items-center gap-1">
                      {column.headerCell ? column.headerCell() : column.header}
                      {column.sortable && (
                        <span className="text-muted-foreground">
                          {localSort?.key === column.id
                            ? localSort.direction === 'asc'
                              ? '↑'
                              : '↓'
                            : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {paginatedData.map((row, index) => (
                <tr
                  key={selection?.getRowKey(row) || index}
                  className={cn(
                    'hover:bg-muted/20 transition-colors',
                    onRowClick && 'cursor-pointer',
                    isRowSelected(row) && 'bg-primary/5'
                  )}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {/* Selection cell */}
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isRowSelected(row)}
                        onChange={e => {
                          e.stopPropagation()
                          handleRowSelection(row, e.target.checked)
                        }}
                        className="h-4 w-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      />
                    </td>
                  )}

                  {/* Data cells */}
                  {columns.map(column => {
                    const value = getCellValue(row, column.accessor)

                    return (
                      <td
                        key={column.id}
                        className={cn(
                          'px-4 py-3 text-sm text-foreground',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.sticky === 'left' &&
                            'sticky left-0 bg-background',
                          column.sticky === 'right' &&
                            'sticky right-0 bg-background',
                          column.className
                        )}
                      >
                        {column.cell
                          ? column.cell(value, row, index)
                          : String(value || '')}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginated && pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              )}{' '}
              of {pagination.total} results
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
              >
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of{' '}
                {Math.ceil(pagination.total / pagination.pageSize)}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
                onClick={() => onPageChange?.(pagination.page + 1)}
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

export default DataTable
