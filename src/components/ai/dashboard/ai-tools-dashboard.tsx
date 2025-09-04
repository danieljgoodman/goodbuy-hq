'use client'

import React from 'react'
import { SubscriptionTier } from '@prisma/client'
import { ToolCard, AIToolCard } from './tool-card'
import { RecentAnalyses } from './recent-analyses'
import { UsageTracker } from './usage-tracker'
import {
  Brain,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
  Activity,
} from 'lucide-react'

interface AIToolsDashboardProps {
  userId?: string
}

// Define available AI tools
const AI_TOOLS: AIToolCard[] = [
  {
    id: 'business-health',
    title: 'Business Health Analysis',
    description:
      'AI-powered business health scoring with comprehensive metrics',
    icon: Activity,
    href: '/ai-tools/analysis/health',
    analysisType: 'health',
    subscriptionRequired: SubscriptionTier.FREE,
    usageCount: 3,
    usageLimit: 5,
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'business-valuation',
    title: 'AI Business Valuation',
    description: 'Advanced valuation analysis using multiple methodologies',
    icon: TrendingUp,
    href: '/ai-tools/analysis/valuation',
    analysisType: 'valuation',
    subscriptionRequired: SubscriptionTier.PROFESSIONAL,
    usageCount: 1,
    usageLimit: 10,
    lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  },
  {
    id: 'financial-intelligence',
    title: 'Financial Intelligence',
    description: 'Deep financial analysis with predictive insights',
    icon: Brain,
    href: '/ai-tools/analysis/financial',
    analysisType: 'forecast',
    subscriptionRequired: SubscriptionTier.PROFESSIONAL,
    usageCount: 0,
    usageLimit: 10,
  },
  {
    id: 'portfolio-analysis',
    title: 'Portfolio Analysis',
    description: 'Multi-business portfolio management and comparison',
    icon: Users,
    href: '/ai-tools/portfolio',
    analysisType: 'portfolio',
    subscriptionRequired: SubscriptionTier.PROFESSIONAL,
    usageCount: 2,
    usageLimit: 50,
    lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'classic-analysis',
    title: 'Classic Analysis',
    description:
      'Traditional business evaluation tools (existing functionality)',
    icon: BarChart3,
    href: '/dashboard/health',
    analysisType: 'health',
    subscriptionRequired: SubscriptionTier.FREE,
    usageCount: 8,
    usageLimit: 999, // Unlimited for existing functionality
    lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: 'report-builder',
    title: 'Professional Reports',
    description: 'Generate white-label PDF reports for clients',
    icon: FileText,
    href: '/ai-tools/reports/builder',
    analysisType: 'health',
    subscriptionRequired: SubscriptionTier.PROFESSIONAL,
    usageCount: 1,
    usageLimit: 25,
    lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
]

export function AIToolsDashboard({ userId }: AIToolsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* AI Tools Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available AI Tools</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {AI_TOOLS.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentAnalyses limit={5} />
        <UsageTracker />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/dashboard/health"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Activity className="h-4 w-4 mr-2" />
            Run Health Analysis
          </a>
          <a
            href="/ai-tools/portfolio"
            className="inline-flex items-center px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Portfolio
          </a>
          <a
            href="/ai-tools/subscription"
            className="inline-flex items-center px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Upgrade Plan
          </a>
        </div>
      </div>
    </div>
  )
}
