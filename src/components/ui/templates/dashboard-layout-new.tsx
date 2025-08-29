'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  BreadcrumbNav,
  BreadcrumbItem,
} from '@/components/navigation/breadcrumb-nav'
import { Menu, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

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
 * Enhanced DashboardLayout Component with ShadCN NavigationMenu
 *
 * Comprehensive dashboard layout component for GoodBuy HQ platform.
 * Now uses ShadCN NavigationMenu components for better accessibility and consistency.
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

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

  // Render sidebar item with enhanced navigation
  const renderSidebarItem = (
    item: SidebarItem,
    level = 0,
    isMobile = false
  ) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)

    const handleClick = () => {
      if (hasChildren) {
        handleItemExpansion(item.id)
      } else {
        onSidebarItemClick?.(item)
        if (isMobile) {
          setMobileMenuOpen(false)
        }
      }
    }

    return (
      <div key={item.id}>
        {hasChildren ? (
          <button
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
              item.active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              item.disabled && 'opacity-50 cursor-not-allowed',
              sidebarCollapsed && !isMobile && 'justify-center px-2',
              level > 0 && 'ml-4',
              item.className
            )}
            onClick={handleClick}
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

            {(!sidebarCollapsed || isMobile) && (
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

                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-auto"
                >
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </motion.div>
              </>
            )}
          </button>
        ) : (
          <Link href={item.href}>
            <button
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
                item.active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                item.disabled && 'opacity-50 cursor-not-allowed',
                sidebarCollapsed && !isMobile && 'justify-center px-2',
                level > 0 && 'ml-4',
                item.className
              )}
              onClick={() => {
                onSidebarItemClick?.(item)
                if (isMobile) {
                  setMobileMenuOpen(false)
                }
              }}
              disabled={item.disabled}
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

              {(!sidebarCollapsed || isMobile) && (
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
                </>
              )}
            </button>
          </Link>
        )}

        {/* Nested children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (!sidebarCollapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 space-y-1 overflow-hidden"
            >
              {item.children?.map(child =>
                renderSidebarItem(child, level + 1, isMobile)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (!isMounted) {
    return null // Prevent SSR hydration issues
  }

  return (
    <div className={cn(getLayoutClasses(), className)}>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'flex flex-col bg-background border-r border-border transition-all duration-300',
            sidebarCollapsed ? 'w-16' : 'w-64',
            'hidden lg:flex'
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
              <motion.div
                animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {sidebarItems.map(item => renderSidebarItem(item))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Navigation
                </h2>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {sidebarItems.map(item => renderSidebarItem(item, 0, true))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-background border-b border-border px-6 py-4">
            <div className={getContentClasses()}>
              <div className="flex items-center gap-4 mb-4 lg:mb-0 lg:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle sidebar</span>
                    </Button>
                  </SheetTrigger>
                </Sheet>
              </div>

              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="mb-4">
                  <BreadcrumbNav items={breadcrumbs} />
                </div>
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
                              <motion.svg
                                className={cn('h-3 w-3')}
                                animate={{
                                  rotate:
                                    stat.change.type === 'decrease' ? 180 : 0,
                                }}
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
                              </motion.svg>
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
