'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  CreditCard,
  HelpCircle,
  Building,
  Calculator,
  TrendingUp,
  BarChart3,
  Target,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import * as React from 'react'

// Navigation items configuration
const navigationItems = [
  {
    title: 'Services',
    items: [
      {
        title: 'Business Calculator',
        href: '/calculator',
        description:
          'Calculate your business value with AI-powered analysis and comprehensive metrics',
        icon: Calculator,
        featured: true,
        badge: 'Popular',
      },
      {
        title: 'AI Valuation',
        href: '/ai-valuation',
        description:
          'Get comprehensive AI-driven business valuation with market insights',
        icon: Sparkles,
        badge: 'New',
      },
      {
        title: 'Financial Health',
        href: '/financial-health',
        description:
          'Analyze your business financial performance and identify growth opportunities',
        icon: BarChart3,
      },
      {
        title: 'Market Analysis',
        href: '/market-analysis',
        description:
          'Understand your market position with competitive intelligence',
        icon: Target,
      },
      {
        title: 'Growth Score',
        href: '/growth-score',
        description:
          'Measure your business growth potential and scalability metrics',
        icon: TrendingUp,
      },
    ],
  },
]

const mainNavItems = [
  { title: 'Calculator', href: '/calculator' },
  { title: 'Marketplace', href: '/marketplace' },
  { title: 'Pricing', href: '/pricing' },
  { title: 'About', href: '/about' },
  { title: 'Contact', href: '/contact' },
]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mock user data - replace with actual auth context
  const isAuthenticated = false // Replace with actual auth state
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatars/john-doe.jpg',
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              aria-label="GoodBuy HQ Home"
            >
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className="text-white font-bold text-sm"
                  aria-hidden="true"
                >
                  GB
                </span>
              </motion.div>
              <span className="text-xl font-bold text-secondary-900">
                GoodBuy HQ
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Services Dropdown */}
                {navigationItems.map(item => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuTrigger className="text-secondary-600 hover:text-primary-600 focus:text-primary-600 hover:shadow-sm">
                      {item.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[420px] lg:w-[600px] p-0">
                        <div className="grid lg:grid-cols-[280px_1fr] gap-0">
                          {/* Featured Section */}
                          <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-r border-border/50">
                            <NavigationMenuLink asChild>
                              <a
                                className="group flex h-full w-full select-none flex-col justify-between rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-6 no-underline outline-none transition-all duration-300 hover:from-primary/30 hover:to-primary/15 hover:shadow-lg hover:scale-[1.02] focus:shadow-lg focus:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
                                href="/services"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Building className="h-6 w-6 text-primary" />
                                    <ArrowRight className="h-4 w-4 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                                  </div>
                                  <div className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                    Business Services
                                  </div>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                  Comprehensive AI-powered tools for business
                                  valuation, growth analysis, and market
                                  insights.
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </div>

                          {/* Services Grid */}
                          <div className="p-6">
                            <div className="space-y-1">
                              {item.items.map(service => (
                                <ServiceItem
                                  key={service.title}
                                  title={service.title}
                                  href={service.href}
                                  description={service.description}
                                  icon={service.icon}
                                  badge={service.badge}
                                  featured={service.featured}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}

                {/* Other Navigation Items */}
                {mainNavItems.map(item => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink
                      href={item.href}
                      className="group inline-flex h-9 w-max items-center justify-center rounded-lg bg-background px-4 py-2 text-sm font-medium text-secondary-600 hover:text-primary-600 focus:text-primary-600 transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {item.title}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User Menu and CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    className="text-secondary-600 hover:text-primary-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden p-2 rounded-md text-secondary-600 hover:text-primary-600 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" aria-hidden="true" />
                  ) : (
                    <Menu className="w-6 h-6" aria-hidden="true" />
                  )}
                </motion.div>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">Navigation</SheetTitle>
                <SheetDescription className="text-left">
                  Explore GoodBuy HQ services and features
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Services Section */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Services
                  </h3>
                  <div className="space-y-2">
                    {navigationItems[0].items.map(service => (
                      <Link
                        key={service.title}
                        href={service.href}
                        className="block p-3 rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-start space-x-3">
                          <service.icon className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">
                              {service.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {service.description}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Main Navigation */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Navigate
                  </h3>
                  <div className="space-y-2">
                    {mainNavItems.map(item => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="block p-3 rounded-lg hover:bg-accent transition-colors font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Auth Buttons */}
                <div className="pt-6 border-t space-y-3">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/auth/signin" className="block">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/signup" className="block">
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

// Enhanced service item component
const ServiceItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    title: string
    description: string
    icon: React.ComponentType<any>
    badge?: string
    featured?: boolean
  }
>(
  (
    { className, title, description, icon: Icon, badge, featured, ...props },
    ref
  ) => {
    return (
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'group flex items-start space-x-4 rounded-lg p-3 no-underline outline-none transition-all duration-200 hover:bg-accent/60 hover:shadow-sm focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1',
            featured && 'bg-primary/5 hover:bg-primary/10',
            className
          )}
          {...props}
        >
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300',
              featured
                ? 'bg-primary/20 text-primary group-hover:bg-primary/30 group-hover:scale-110'
                : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-105'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                {title}
              </div>
              {badge && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
                    badge === 'New' && 'bg-green-100 text-green-700',
                    badge === 'Popular' && 'bg-blue-100 text-blue-700'
                  )}
                >
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
              {description}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
        </a>
      </NavigationMenuLink>
    )
  }
)
ServiceItem.displayName = 'ServiceItem'

// Helper component for navigation menu items (keeping for backward compatibility)
const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/60 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:ring-2 focus:ring-primary/20 focus:ring-offset-1',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'
