'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Calculator,
  Building,
  Search,
  Home,
  ShoppingCart,
  MessageCircle,
  Settings,
  User,
  HelpCircle,
  CreditCard,
  Star,
  Phone,
  TrendingUp,
  BarChart3,
  FileText,
  DollarSign,
  MapPin,
  Tag,
  Clock,
  Heart,
  Filter,
  SortAsc,
  Download,
  Share,
  Bell,
  LogOut,
  LogIn,
  UserPlus,
  Zap,
  Target,
  BookOpen,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

interface CommandAction {
  id: string
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  category:
    | 'navigation'
    | 'business'
    | 'search'
    | 'settings'
    | 'help'
    | 'recent'
  keywords?: string[]
  shortcut?: string[]
  requiresAuth?: boolean
}

interface RecentSearch {
  id: string
  query: string
  timestamp: Date
  type: 'business' | 'location' | 'category'
}

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandPalette({
  open: externalOpen,
  onOpenChange,
}: CommandPaletteProps = {}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [internalOpen, setInternalOpen] = React.useState(false)

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [recentSearches, setRecentSearches] = React.useState<RecentSearch[]>([])

  // Load recent searches from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('goodbuy-recent-searches')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRecentSearches(
          parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
        )
      } catch (error) {
        // Failed to parse recent searches
      }
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = React.useCallback(
    (search: Omit<RecentSearch, 'id' | 'timestamp'>) => {
      const newSearch: RecentSearch = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        ...search,
      }

      setRecentSearches(prev => {
        const updated = [
          newSearch,
          ...prev.filter(s => s.query !== search.query),
        ].slice(0, 10)
        localStorage.setItem('goodbuy-recent-searches', JSON.stringify(updated))
        return updated
      })
    },
    []
  )

  // Handle command execution
  const runCommand = React.useCallback((command: CommandAction) => {
    setOpen(false)
    command.action()
  }, [])

  // Navigation actions
  const navigateToPage = React.useCallback(
    (path: string) => {
      router.push(path)
    },
    [router]
  )

  // Business actions
  const evaluateBusiness = React.useCallback(
    (businessId?: string) => {
      if (businessId) {
        router.push(`/business/${businessId}?action=evaluate`)
      } else {
        router.push('/calculator')
      }
    },
    [router]
  )

  const contactSeller = React.useCallback(
    (businessId?: string) => {
      if (businessId) {
        router.push(`/business/${businessId}?action=contact`)
      } else {
        router.push('/marketplace')
      }
    },
    [router]
  )

  const favoriteBusiness = React.useCallback((businessId?: string) => {
    // Implementation for favoriting business
  }, [])

  // Search actions
  const searchBusinesses = React.useCallback(
    (query: string = '') => {
      saveRecentSearch({ query, type: 'business' })
      router.push(
        `/marketplace${query ? `?search=${encodeURIComponent(query)}` : ''}`
      )
    },
    [router, saveRecentSearch]
  )

  const searchByLocation = React.useCallback(
    (location: string = '') => {
      saveRecentSearch({ query: location, type: 'location' })
      router.push(
        `/marketplace${location ? `?location=${encodeURIComponent(location)}` : ''}`
      )
    },
    [router, saveRecentSearch]
  )

  const searchByCategory = React.useCallback(
    (category: string = '') => {
      saveRecentSearch({ query: category, type: 'category' })
      router.push(
        `/marketplace${category ? `?category=${encodeURIComponent(category)}` : ''}`
      )
    },
    [router, saveRecentSearch]
  )

  // Define all available commands
  const commands: CommandAction[] = React.useMemo(
    () => [
      // Navigation commands
      {
        id: 'nav-home',
        title: 'Go to Home',
        description: 'Navigate to the homepage',
        icon: Home,
        action: () => navigateToPage('/'),
        category: 'navigation',
        keywords: ['home', 'homepage', 'main'],
        shortcut: ['g', 'h'],
      },
      {
        id: 'nav-marketplace',
        title: 'Browse Marketplace',
        description: 'View all business listings',
        icon: ShoppingCart,
        action: () => navigateToPage('/marketplace'),
        category: 'navigation',
        keywords: ['marketplace', 'listings', 'businesses', 'browse'],
        shortcut: ['g', 'm'],
      },
      {
        id: 'nav-calculator',
        title: 'Business Calculator',
        description: 'Calculate business valuation',
        icon: Calculator,
        action: () => navigateToPage('/calculator'),
        category: 'navigation',
        keywords: ['calculator', 'valuation', 'evaluate', 'worth'],
        shortcut: ['g', 'c'],
      },
      {
        id: 'nav-dashboard',
        title: 'Dashboard',
        description: 'View your dashboard',
        icon: BarChart3,
        action: () => navigateToPage('/dashboard'),
        category: 'navigation',
        keywords: ['dashboard', 'profile', 'stats'],
        shortcut: ['g', 'd'],
        requiresAuth: true,
      },
      {
        id: 'nav-messages',
        title: 'Messages',
        description: 'View your messages',
        icon: MessageCircle,
        action: () => navigateToPage('/messages'),
        category: 'navigation',
        keywords: ['messages', 'inbox', 'communication'],
        shortcut: ['g', 'i'],
        requiresAuth: true,
      },
      {
        id: 'nav-sell',
        title: 'Sell Business',
        description: 'List your business for sale',
        icon: Building,
        action: () => navigateToPage('/sell'),
        category: 'navigation',
        keywords: ['sell', 'list', 'business', 'for sale'],
        shortcut: ['g', 's'],
      },

      // Business actions
      {
        id: 'action-evaluate',
        title: 'Evaluate Business',
        description: 'Get AI-powered business valuation',
        icon: TrendingUp,
        action: () => evaluateBusiness(),
        category: 'business',
        keywords: ['evaluate', 'valuation', 'analysis', 'worth', 'ai'],
        shortcut: ['e'],
      },
      {
        id: 'action-contact-seller',
        title: 'Contact Seller',
        description: 'Reach out to business sellers',
        icon: Phone,
        action: () => contactSeller(),
        category: 'business',
        keywords: ['contact', 'seller', 'inquiry', 'message'],
        shortcut: ['c'],
      },
      {
        id: 'action-favorite',
        title: 'Add to Favorites',
        description: 'Save businesses to favorites',
        icon: Heart,
        action: () => favoriteBusiness(),
        category: 'business',
        keywords: ['favorite', 'save', 'bookmark', 'wishlist'],
        shortcut: ['f'],
        requiresAuth: true,
      },

      // Search actions
      {
        id: 'search-businesses',
        title: 'Search Businesses',
        description: 'Find businesses by name or keyword',
        icon: Search,
        action: () => searchBusinesses(),
        category: 'search',
        keywords: ['search', 'find', 'businesses', 'companies'],
        shortcut: ['/'],
      },
      {
        id: 'search-location',
        title: 'Search by Location',
        description: 'Find businesses in specific locations',
        icon: MapPin,
        action: () => searchByLocation(),
        category: 'search',
        keywords: ['location', 'city', 'state', 'area', 'region'],
        shortcut: ['l'],
      },
      {
        id: 'search-category',
        title: 'Search by Category',
        description: 'Browse businesses by industry',
        icon: Tag,
        action: () => searchByCategory(),
        category: 'search',
        keywords: ['category', 'industry', 'type', 'sector'],
        shortcut: ['t'],
      },

      // Settings & Help
      {
        id: 'settings-profile',
        title: 'Profile Settings',
        description: 'Manage your account settings',
        icon: User,
        action: () => navigateToPage('/dashboard?tab=profile'),
        category: 'settings',
        keywords: ['profile', 'account', 'settings', 'preferences'],
        requiresAuth: true,
      },
      {
        id: 'settings-billing',
        title: 'Billing & Payments',
        description: 'Manage billing and subscription',
        icon: CreditCard,
        action: () => navigateToPage('/dashboard?tab=billing'),
        category: 'settings',
        keywords: ['billing', 'payment', 'subscription', 'pricing'],
        requiresAuth: true,
      },
      {
        id: 'settings-notifications',
        title: 'Notifications',
        description: 'Configure notification preferences',
        icon: Bell,
        action: () => navigateToPage('/dashboard?tab=notifications'),
        category: 'settings',
        keywords: ['notifications', 'alerts', 'preferences'],
        requiresAuth: true,
      },
      {
        id: 'help-support',
        title: 'Help & Support',
        description: 'Get help and contact support',
        icon: HelpCircle,
        action: () => navigateToPage('/help'),
        category: 'help',
        keywords: ['help', 'support', 'contact', 'faq', 'documentation'],
      },
      {
        id: 'help-docs',
        title: 'Documentation',
        description: 'View platform documentation',
        icon: BookOpen,
        action: () => navigateToPage('/docs'),
        category: 'help',
        keywords: ['docs', 'documentation', 'guide', 'manual'],
      },

      // Auth actions (shown based on authentication state)
      ...(status === 'unauthenticated'
        ? [
            {
              id: 'auth-signin',
              title: 'Sign In',
              description: 'Sign in to your account',
              icon: LogIn,
              action: () => navigateToPage('/auth/signin'),
              category: 'settings' as const,
              keywords: ['signin', 'login', 'authenticate'],
            },
            {
              id: 'auth-signup',
              title: 'Sign Up',
              description: 'Create a new account',
              icon: UserPlus,
              action: () => navigateToPage('/auth/signup'),
              category: 'settings' as const,
              keywords: ['signup', 'register', 'create account'],
            },
          ]
        : [
            {
              id: 'auth-logout',
              title: 'Sign Out',
              description: 'Sign out of your account',
              icon: LogOut,
              action: () => navigateToPage('/auth/signout'),
              category: 'settings' as const,
              keywords: ['logout', 'signout', 'exit'],
            },
          ]),
    ],
    [
      status,
      navigateToPage,
      evaluateBusiness,
      contactSeller,
      favoriteBusiness,
      searchBusinesses,
      searchByLocation,
      searchByCategory,
    ]
  )

  // Filter commands based on authentication
  const availableCommands = React.useMemo(() => {
    return commands.filter(command => {
      if (command.requiresAuth && status === 'unauthenticated') {
        return false
      }
      return true
    })
  }, [commands, status])

  // Create recent search commands
  const recentCommands: CommandAction[] = React.useMemo(() => {
    return recentSearches.slice(0, 5).map(search => ({
      id: `recent-${search.id}`,
      title: `Search: ${search.query}`,
      description: `Recent ${search.type} search`,
      icon: Clock,
      action: () => {
        switch (search.type) {
          case 'business':
            searchBusinesses(search.query)
            break
          case 'location':
            searchByLocation(search.query)
            break
          case 'category':
            searchByCategory(search.query)
            break
        }
      },
      category: 'recent',
      keywords: [search.query, search.type, 'recent'],
    }))
  }, [recentSearches, searchBusinesses, searchByLocation, searchByCategory])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Group commands by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandAction[]> = {}

    // Add recent searches first if they exist
    if (recentCommands.length > 0) {
      groups['Recent Searches'] = recentCommands
    }

    // Group available commands
    availableCommands.forEach(command => {
      const categoryName =
        {
          navigation: 'Navigation',
          business: 'Business Actions',
          search: 'Search',
          settings: 'Settings & Account',
          help: 'Help & Support',
          recent: 'Recent Searches',
        }[command.category] || 'Other'

      if (!groups[categoryName]) {
        groups[categoryName] = []
      }
      groups[categoryName].push(command)
    })

    return groups
  }, [availableCommands, recentCommands])

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Type a command or search..."
      className="max-w-2xl"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {Object.entries(groupedCommands).map(
          ([category, commands], groupIndex) => (
            <React.Fragment key={category}>
              {groupIndex > 0 && <CommandSeparator />}
              <CommandGroup heading={category}>
                {commands.map(command => (
                  <CommandItem
                    key={command.id}
                    onSelect={() => runCommand(command)}
                    className="flex items-center gap-2 px-4 py-3"
                  >
                    <command.icon className="h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{command.title}</div>
                      {command.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {command.description}
                        </div>
                      )}
                    </div>
                    {command.shortcut && (
                      <CommandShortcut>
                        {command.shortcut.map((key, index) => (
                          <span key={index}>
                            {index > 0 && ' '}
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          )
        )}
      </CommandList>
    </CommandDialog>
  )
}
