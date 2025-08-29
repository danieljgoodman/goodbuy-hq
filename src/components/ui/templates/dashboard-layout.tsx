'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Sidebar navigation item interface
 */
export interface SidebarItem {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Navigation href */
  href: string
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>
  /** Badge content */
  badge?: string | number
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  /** Whether item is active */
  active?: boolean
  /** Whether item is disabled */
  disabled?: boolean
  /** Children items (for nested navigation) */
  children?: SidebarItem[]
  /** Custom CSS classes */
  className?: string
}

/**
 * Quick action button configuration
 */
export interface QuickAction {
  /** Unique identifier */
  id: string
  /** Action label */
  label: string
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>
  /** Button variant */
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  /** Click handler */
  onClick: () => void
  /** Whether action is disabled */
  disabled?: boolean
  /** Custom CSS classes */
  className?: string
}

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string
  /** Navigation href (optional for current page) */
  href?: string
}

/**
 * Dashboard stats/metrics item
 */
export interface DashboardStat {
  /** Unique identifier */
  id: string
  /** Stat title */
  title: string
  /** Stat value */
  value: string | number
  /** Change indicator (positive/negative) */
  change?: {
    value: number
    label: string
    type: 'increase' | 'decrease'
  }
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>
  /** Stat trend data for sparkline */
  trend?: number[]
  /** Custom CSS classes */
  className?: string
}

/**
 * Props for DashboardLayout component
 */
export interface DashboardLayoutProps {
  /** Page title */
  title: string
  /** Page description */
  description?: string
  /** Sidebar navigation items */
  sidebarItems: SidebarItem[]
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[]
  /** Quick action buttons */
  quickActions?: QuickAction[]
  /** Dashboard statistics */
  stats?: DashboardStat[]
  /** Main content */
  children: React.ReactNode
  /** Sidebar collapsed state */
  sidebarCollapsed?: boolean
  /** Whether to show stats section */
  showStats?: boolean
  /** Layout variant */
  variant?: 'default' | 'minimal' | 'wide' | 'fluid'
  /** Custom CSS classes */
  className?: string
  /** Sidebar toggle handler */
  onSidebarToggle?: (collapsed: boolean) => void
  /** Sidebar item click handler */
  onSidebarItemClick?: (item: SidebarItem) => void
}

/**
 * DashboardLayout Component
 *
 * Comprehensive dashboard layout component for GoodBuy HQ platform.
 * Provides a professional business dashboard structure with sidebar navigation,
 * stats overview, breadcrumbs, and flexible content areas.
 *
 * Features:
 * - Collapsible sidebar with nested navigation
 * - Dashboard statistics/metrics cards
 * - Breadcrumb navigation
 * - Quick action buttons
 * - Responsive design with mobile-first approach
 * - Professional business styling
 * - Flexible layout variants (default, minimal, wide, fluid)
 * - Accessibility features (ARIA labels, keyboard navigation)
 *
 * @example
 * ```tsx
 * const sidebarItems: SidebarItem[] = [
 *   {
 *     id: 'overview',
 *     label: 'Overview',
 *     href: '/dashboard',
 *     icon: DashboardIcon,
 *     active: true
 *   },
 *   {
 *     id: 'businesses',
 *     label: 'Businesses',
 *     href: '/dashboard/businesses',
 *     icon: BuildingIcon,
 *     badge: 12
 *   }
 * ]
 *
 * const dashboardStats: DashboardStat[] = [
 *   {
 *     id: 'revenue',
 *     title: 'Total Revenue',
 *     value: '$2.4M',
 *     change: { value: 12.5, label: 'vs last month', type: 'increase' }
 *   }
 * ]
 *
 * <DashboardLayout
 *   title="Business Dashboard"
 *   sidebarItems={sidebarItems}
 *   stats={dashboardStats}
 *   showStats
 * >
 *   <YourDashboardContent />
 * </DashboardLayout>
 * ```
 */
export function DashboardLayout({
  title,
  description,
  sidebarItems,
  breadcrumbs,
  quickActions,
  stats,
  children,
  sidebarCollapsed = false,
  showStats = false,
  variant = 'default',
  className,
  onSidebarToggle,
  onSidebarItemClick,
}: DashboardLayoutProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  // Ensure component is mounted (for Next.js SSR)
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle sidebar item expansion
  const handleItemExpansion = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Format stat value
  const formatStatValue = (value: string | number): string => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return value.toLocaleString()
    }
    return String(value)
  }

  // Get layout classes based on variant
  const getLayoutClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'min-h-screen bg-background'
      case 'wide':
        return 'min-h-screen bg-background'
      case 'fluid':
        return 'min-h-screen bg-background'
      default:
        return 'min-h-screen bg-background'
    }
  }

  // Get content container classes
  const getContentClasses = () => {
    switch (variant) {
      case 'wide':
        return 'max-w-7xl mx-auto'
      case 'fluid':
        return 'w-full'
      default:
        return 'max-w-6xl mx-auto'
    }
  }

  // Render sidebar item
  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)

    return (
      <div key={item.id}>
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group',
            item.active
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            item.disabled && 'opacity-50 cursor-not-allowed',
            sidebarCollapsed && 'justify-center px-2',
            level > 0 && 'ml-4',
            item.className
          )}
          onClick={() => {
            if (hasChildren) {
              handleItemExpansion(item.id)
            } else {
              onSidebarItemClick?.(item)
            }
          }}
          disabled={item.disabled}
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          {item.icon && (
            <item.icon
              className={cn(
                'h-5 w-5 shrink-0',
                item.active
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground group-hover:text-foreground'
              )}
            />
          )}

          {!sidebarCollapsed && (
            <>
              <span className="truncate">{item.label}</span>

              {item.badge && (
                <Badge
                  variant={item.badgeVariant || 'secondary'}
                  className="ml-auto text-xs shrink-0"
                >
                  {item.badge}
                </Badge>
              )}

              {hasChildren && (
                <svg
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </>
          )}
        </button>

        {/* Nested children */}
        {hasChildren && isExpanded && !sidebarCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!isMounted) {
    return null // Prevent SSR hydration issues
  }

  return (
    <div className={cn(getLayoutClasses(), className)}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            'flex flex-col bg-background border-r border-border transition-all duration-300',
            sidebarCollapsed ? 'w-16' : 'w-64',
            'hidden lg:flex' // Hide on mobile by default
          )}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-foreground">
                Navigation
              </h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSidebarToggle?.(!sidebarCollapsed)}
              className="h-8 w-8"
              aria-label={
                sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
              }
            >
              <svg
                className={cn(
                  'h-4 w-4 transition-transform',
                  sidebarCollapsed && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {sidebarItems.map(item => renderSidebarItem(item))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-background border-b border-border px-6 py-4">
            <div className={getContentClasses()}>
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {crumb.href ? (
                        <a
                          href={crumb.href}
                          className="hover:text-foreground transition-colors"
                        >
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="text-foreground font-medium">
                          {crumb.label}
                        </span>
                      )}
                      {index < breadcrumbs.length - 1 && (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}

              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-muted-foreground mt-1">{description}</p>
                  )}
                </div>

                {/* Quick Actions */}
                {quickActions && quickActions.length > 0 && (
                  <div className="flex items-center gap-2">
                    {quickActions.map(action => (
                      <Button
                        key={action.id}
                        variant={action.variant || 'default'}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={cn(
                          'flex items-center gap-2',
                          action.className
                        )}
                      >
                        {action.icon && <action.icon className="h-4 w-4" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Stats Section */}
          {showStats && stats && stats.length > 0 && (
            <section className="bg-background border-b border-border px-6 py-6">
              <div className={getContentClasses()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map(stat => (
                    <Card key={stat.id} className={cn('p-4', stat.className)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {formatStatValue(stat.value)}
                          </p>
                          {stat.change && (
                            <p
                              className={cn(
                                'text-sm flex items-center gap-1 mt-1',
                                stat.change.type === 'increase'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              )}
                            >
                              <svg
                                className={cn(
                                  'h-3 w-3',
                                  stat.change.type === 'decrease' &&
                                    'rotate-180'
                                )}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                                />
                              </svg>
                              {stat.change.value}% {stat.change.label}
                            </p>
                          )}
                        </div>
                        {stat.icon && (
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <stat.icon className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Content Area */}
          <section className="flex-1 overflow-y-auto p-6">
            <div className={getContentClasses()}>{children}</div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
