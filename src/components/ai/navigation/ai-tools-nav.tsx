'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Brain,
  TrendingUp,
  Users,
  Settings,
  Calculator,
  Sparkles,
  Target,
} from 'lucide-react'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/ai-tools/dashboard',
    icon: BarChart3,
    description: 'AI tools overview',
    requiredTier: 'FREE' as const,
  },
  {
    name: 'Business Calculator',
    href: '/calculator',
    icon: Calculator,
    description: 'Calculate business value',
    requiredTier: 'FREE' as const,
  },
  {
    name: 'AI Valuation',
    href: '/ai-valuation',
    icon: Sparkles,
    description: 'AI-driven business valuation',
    requiredTier: 'PROFESSIONAL' as const,
  },
  {
    name: 'Financial Health',
    href: '/financial-health',
    icon: BarChart3,
    description: 'Analyze financial performance',
    requiredTier: 'FREE' as const,
  },
  {
    name: 'Market Analysis',
    href: '/market-analysis',
    icon: Target,
    description: 'Market position intelligence',
    requiredTier: 'PROFESSIONAL' as const,
  },
  {
    name: 'Growth Score',
    href: '/growth-score',
    icon: TrendingUp,
    description: 'Growth potential metrics',
    requiredTier: 'PROFESSIONAL' as const,
  },
  {
    name: 'Usage & Billing',
    href: '/ai-tools/subscription',
    icon: Settings,
    description: 'Subscription management',
    requiredTier: 'FREE' as const,
  },
]

export function AIToolsNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { hasAccess, userTier } = useFeatureAccess()

  return (
    <nav className="flex flex-col h-full p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">AI Tools</h2>
        <p className="text-sm text-muted-foreground">
          Advanced business analysis
        </p>
      </div>

      <div className="flex-1 space-y-2">
        {navigationItems.map(item => {
          const isActive = pathname === item.href
          const hasItemAccess = hasAccess(item.requiredTier)
          const Icon = item.icon

          return (
            <div key={item.name}>
              {hasItemAccess ? (
                <Link href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 h-auto p-3',
                      isActive && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-70">
                        {item.description}
                      </div>
                    </div>
                  </Button>
                </Link>
              ) : (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto p-3 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <Icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-70">
                        {item.description}
                      </div>
                    </div>
                  </Button>
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 text-xs"
                  >
                    {item.requiredTier}
                  </Badge>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-auto pt-4 border-t">
        <div className="text-xs text-muted-foreground">
          Current Plan: <Badge variant="outline">{userTier}</Badge>
        </div>
      </div>
    </nav>
  )
}
