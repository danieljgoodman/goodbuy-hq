'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Navigation item interface
 */
export interface NavigationItem {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Navigation href */
  href: string
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>
  /** Badge content (count, label, etc.) */
  badge?: string | number
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  /** Whether item is disabled */
  disabled?: boolean
  /** Children navigation items (for dropdowns) */
  children?: NavigationItem[]
  /** Whether item should be highlighted */
  highlight?: boolean
  /** Custom CSS classes */
  className?: string
}

/**
 * User profile data for navigation
 */
export interface UserProfile {
  /** User display name */
  name: string
  /** User email */
  email: string
  /** Avatar image URL */
  avatar?: string
  /** User role */
  role?: string
  /** User initials for fallback */
  initials?: string
}

/**
 * Props for NavigationHeader component
 */
export interface NavigationHeaderProps {
  /** Site/brand name */
  brandName?: string
  /** Brand logo URL */
  brandLogo?: string
  /** Navigation items */
  navigationItems: NavigationItem[]
  /** Current user profile */
  user?: UserProfile
  /** Whether user is authenticated */
  isAuthenticated?: boolean
  /** Show notifications indicator */
  showNotifications?: boolean
  /** Unread notifications count */
  notificationCount?: number
  /** Header variant */
  variant?: 'default' | 'transparent' | 'bordered' | 'compact'
  /** Whether navigation is sticky */
  sticky?: boolean
  /** Mobile menu state */
  mobileMenuOpen?: boolean
  /** Custom CSS classes */
  className?: string
  /** Sign in handler */
  onSignIn?: () => void
  /** Sign out handler */
  onSignOut?: () => void
  /** Profile click handler */
  onProfileClick?: () => void
  /** Notifications click handler */
  onNotificationsClick?: () => void
  /** Mobile menu toggle handler */
  onMobileMenuToggle?: (open: boolean) => void
  /** Logo click handler */
  onLogoClick?: () => void
}

/**
 * NavigationHeader Component
 *
 * Professional navigation header component for GoodBuy HQ platform.
 * Provides comprehensive navigation functionality with user authentication,
 * notifications, mobile responsiveness, and business-focused styling.
 *
 * Features:
 * - Responsive design with mobile hamburger menu
 * - User authentication state management
 * - Notification indicators and badges
 * - Multi-level navigation with dropdowns
 * - Professional business styling
 * - Sticky navigation support
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Active route highlighting
 *
 * @example
 * ```tsx
 * const navItems: NavigationItem[] = [
 *   {
 *     id: 'marketplace',
 *     label: 'Marketplace',
 *     href: '/marketplace',
 *     icon: ShoppingIcon
 *   },
 *   {
 *     id: 'dashboard',
 *     label: 'Dashboard',
 *     href: '/dashboard',
 *     badge: 'Pro',
 *     children: [
 *       { id: 'overview', label: 'Overview', href: '/dashboard' },
 *       { id: 'analytics', label: 'Analytics', href: '/dashboard/analytics' }
 *     ]
 *   }
 * ]
 *
 * <NavigationHeader
 *   brandName="GoodBuy HQ"
 *   navigationItems={navItems}
 *   user={currentUser}
 *   isAuthenticated={!!currentUser}
 *   showNotifications
 *   notificationCount={5}
 * />
 * ```
 */
export function NavigationHeader({
  brandName = 'GoodBuy HQ',
  brandLogo,
  navigationItems,
  user,
  isAuthenticated = false,
  showNotifications = false,
  notificationCount = 0,
  variant = 'default',
  sticky = false,
  mobileMenuOpen = false,
  className,
  onSignIn,
  onSignOut,
  onProfileClick,
  onNotificationsClick,
  onMobileMenuToggle,
  onLogoClick,
}: NavigationHeaderProps) {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = React.useState<string | null>(null)
  const [isMounted, setIsMounted] = React.useState(false)

  // Ensure component is mounted (for Next.js SSR)
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check if navigation item is active
  const isActiveItem = (item: NavigationItem): boolean => {
    if (item.href === pathname) return true
    if (item.children) {
      return item.children.some(child => child.href === pathname)
    }
    return false
  }

  // Handle dropdown toggle
  const handleDropdownToggle = (itemId: string) => {
    setDropdownOpen(dropdownOpen === itemId ? null : itemId)
  }

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Get header styling based on variant
  const getHeaderClasses = () => {
    const baseClasses = cn(
      'w-full border-b transition-all duration-200 z-50',
      sticky && 'sticky top-0'
    )

    switch (variant) {
      case 'transparent':
        return cn(
          baseClasses,
          'bg-background/80 backdrop-blur-sm border-border/40'
        )
      case 'bordered':
        return cn(baseClasses, 'bg-background border-border shadow-sm')
      case 'compact':
        return cn(baseClasses, 'bg-background border-border py-2')
      default:
        return cn(baseClasses, 'bg-background border-border')
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = (user: UserProfile): string => {
    if (user.initials) return user.initials
    return user.name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Render navigation item
  const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
    const isActive = isActiveItem(item)
    const hasChildren = item.children && item.children.length > 0
    const isDropdownActive = dropdownOpen === item.id

    if (hasChildren) {
      return (
        <div key={item.id} className="relative">
          <button
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive || isDropdownActive
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              item.disabled && 'opacity-50 cursor-not-allowed',
              item.highlight &&
                'bg-primary text-primary-foreground hover:bg-primary/90',
              isMobile && 'w-full justify-start',
              item.className
            )}
            onClick={e => {
              e.stopPropagation()
              if (!item.disabled) {
                handleDropdownToggle(item.id)
              }
            }}
            disabled={item.disabled}
            aria-expanded={isDropdownActive}
            aria-haspopup="true"
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.label}
            {item.badge && (
              <Badge
                variant={item.badgeVariant || 'secondary'}
                className="ml-auto text-xs"
              >
                {item.badge}
              </Badge>
            )}
            <svg
              className={cn(
                'h-4 w-4 transition-transform',
                isDropdownActive && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDropdownActive && (
            <div
              className={cn(
                'absolute top-full left-0 mt-1 min-w-[200px] bg-popover border border-border rounded-md shadow-lg py-1 z-50',
                isMobile &&
                  'static mt-0 shadow-none border-0 bg-transparent pl-4'
              )}
            >
              {item.children?.map(child => (
                <Link
                  key={child.id}
                  href={child.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                    pathname === child.href
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                    child.disabled && 'opacity-50 cursor-not-allowed',
                    child.className
                  )}
                  onClick={() => setDropdownOpen(null)}
                >
                  {child.icon && <child.icon className="h-4 w-4" />}
                  {child.label}
                  {child.badge && (
                    <Badge
                      variant={child.badgeVariant || 'secondary'}
                      className="ml-auto text-xs"
                    >
                      {child.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          isActive
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          item.highlight &&
            'bg-primary text-primary-foreground hover:bg-primary/90',
          isMobile && 'w-full justify-start',
          item.className
        )}
      >
        {item.icon && <item.icon className="h-4 w-4" />}
        {item.label}
        {item.badge && (
          <Badge
            variant={item.badgeVariant || 'secondary'}
            className="ml-auto text-xs"
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    )
  }

  if (!isMounted) {
    return null // Prevent SSR hydration issues
  }

  return (
    <header className={cn(getHeaderClasses(), className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand/Logo */}
          <div className="flex items-center gap-8">
            <button
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              onClick={onLogoClick}
            >
              {brandLogo ? (
                <img src={brandLogo} alt={brandName} className="h-8 w-auto" />
              ) : (
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    {brandName.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold text-foreground">
                {brandName}
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map(item => renderNavigationItem(item))}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            {showNotifications && isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNotificationsClick}
                className="relative"
                aria-label="Notifications"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Profile / Auth */}
            {isAuthenticated && user ? (
              <Button
                variant="ghost"
                onClick={onProfileClick}
                className="flex items-center gap-2 h-auto p-2"
              >
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    getUserInitials(user)
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user.name}</div>
                  {user.role && (
                    <div className="text-xs text-muted-foreground">
                      {user.role}
                    </div>
                  )}
                </div>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={onSignIn}>
                  Sign In
                </Button>
                <Button onClick={onSignIn}>Get Started</Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => onMobileMenuToggle?.(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-1">
              {navigationItems.map(item => renderNavigationItem(item, true))}

              {/* Mobile Auth Actions */}
              {!isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <Button
                    variant="ghost"
                    onClick={onSignIn}
                    className="w-full justify-start"
                  >
                    Sign In
                  </Button>
                  <Button onClick={onSignIn} className="w-full">
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile User Actions */}
              {isAuthenticated && user && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={onProfileClick}
                    className="w-full justify-start"
                  >
                    Profile Settings
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onSignOut}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default NavigationHeader
