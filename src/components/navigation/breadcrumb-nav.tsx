import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  /** Display label */
  label: string
  /** Navigation href (optional for current page) */
  href?: string
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>
}

export interface BreadcrumbNavProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[]
  /** Show home icon on first item */
  showHomeIcon?: boolean
  /** Maximum items to show before ellipsis */
  maxItems?: number
  /** Custom separator component */
  separator?: React.ReactNode
  /** Custom CSS classes */
  className?: string
  /** Show current page as link */
  currentPageAsLink?: boolean
}

export function BreadcrumbNav({
  items,
  showHomeIcon = true,
  maxItems = 4,
  separator,
  className,
  currentPageAsLink = false,
}: BreadcrumbNavProps) {
  // If we have too many items, show ellipsis
  const shouldShowEllipsis = items.length > maxItems

  // Calculate which items to show
  const displayItems = shouldShowEllipsis
    ? [
        ...items.slice(0, 2), // Show first 2 items
        ...items.slice(-2), // Show last 2 items
      ]
    : items

  const renderBreadcrumbItem = (
    item: BreadcrumbItem,
    index: number,
    isLast: boolean,
    originalIndex?: number
  ) => {
    const isCurrentPage = isLast && !currentPageAsLink
    const showIcon = showHomeIcon && (index === 0 || originalIndex === 0)

    return (
      <BreadcrumbItem key={`${item.label}-${index}`}>
        {isCurrentPage ? (
          <BreadcrumbPage className="flex items-center gap-1.5">
            {showIcon && <Home className="h-4 w-4" />}
            {item.icon && !showIcon && <item.icon className="h-4 w-4" />}
            {item.label}
          </BreadcrumbPage>
        ) : (
          <BreadcrumbLink asChild>
            <Link
              href={item.href || '#'}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              {showIcon && <Home className="h-4 w-4" />}
              {item.icon && !showIcon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    )
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {shouldShowEllipsis ? (
          <>
            {/* First 2 items */}
            {displayItems.slice(0, 2).map((item, index) => (
              <div key={`first-${index}`} className="flex items-center">
                {renderBreadcrumbItem(item, index, false, index)}
                <BreadcrumbSeparator>
                  {separator || <ChevronRight className="h-4 w-4" />}
                </BreadcrumbSeparator>
              </div>
            ))}

            {/* Ellipsis */}
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              {separator || <ChevronRight className="h-4 w-4" />}
            </BreadcrumbSeparator>

            {/* Last 2 items */}
            {displayItems.slice(2).map((item, index) => {
              const actualIndex = items.length - 2 + index
              const isLast = actualIndex === items.length - 1

              return (
                <div key={`last-${index}`} className="flex items-center">
                  {renderBreadcrumbItem(item, index + 2, isLast, actualIndex)}
                  {!isLast && (
                    <BreadcrumbSeparator>
                      {separator || <ChevronRight className="h-4 w-4" />}
                    </BreadcrumbSeparator>
                  )}
                </div>
              )
            })}
          </>
        ) : (
          /* Show all items */
          items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <div key={index} className="flex items-center">
                {renderBreadcrumbItem(item, index, isLast, index)}
                {!isLast && (
                  <BreadcrumbSeparator>
                    {separator || <ChevronRight className="h-4 w-4" />}
                  </BreadcrumbSeparator>
                )}
              </div>
            )
          })
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

// Helper function to generate breadcrumbs from path
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean)

  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Home',
      href: '/',
    },
  ]

  let currentPath = ''

  paths.forEach((path, index) => {
    currentPath += `/${path}`

    // Convert path to readable label
    const label = path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    const isLast = index === paths.length - 1

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath, // Don't link the current page
    })
  })

  return breadcrumbs
}

// Route-based breadcrumb configurations
export const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ label: 'Home', href: '/' }, { label: 'Dashboard' }],
  '/dashboard/businesses': [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Businesses' },
  ],
  '/dashboard/businesses/[id]': [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Businesses', href: '/dashboard/businesses' },
    { label: 'Business Details' },
  ],
  '/calculator': [
    { label: 'Home', href: '/' },
    { label: 'Business Calculator' },
  ],
  '/ai-valuation': [{ label: 'Home', href: '/' }, { label: 'AI Valuation' }],
  '/marketplace': [{ label: 'Home', href: '/' }, { label: 'Marketplace' }],
  '/pricing': [{ label: 'Home', href: '/' }, { label: 'Pricing' }],
  '/about': [{ label: 'Home', href: '/' }, { label: 'About' }],
  '/contact': [{ label: 'Home', href: '/' }, { label: 'Contact' }],
}
