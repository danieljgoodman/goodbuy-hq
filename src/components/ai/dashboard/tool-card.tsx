'use client'

import React from 'react'
import Link from 'next/link'
import { SubscriptionTier } from '@prisma/client'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export interface AIToolCard {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  analysisType: 'health' | 'valuation' | 'forecast' | 'portfolio'
  subscriptionRequired: SubscriptionTier
  usageCount?: number
  usageLimit?: number
  lastUsed?: Date
}

interface ToolCardProps {
  tool: AIToolCard
  className?: string
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const { hasAccess, userTier } = useFeatureAccess()
  const hasToolAccess = hasAccess(tool.subscriptionRequired)
  const Icon = tool.icon

  const usagePercentage =
    tool.usageCount && tool.usageLimit
      ? (tool.usageCount / tool.usageLimit) * 100
      : 0

  const formatLastUsed = (date?: Date) => {
    if (!date) return 'Never used'
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString()
  }

  return (
    <Card
      className={cn(
        'relative transition-all duration-200 hover:shadow-md',
        !hasToolAccess && 'opacity-75',
        className
      )}
    >
      {!hasToolAccess && (
        <Badge className="absolute -top-2 -right-2 z-10" variant="secondary">
          {tool.subscriptionRequired}
        </Badge>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg',
              hasToolAccess
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{tool.title}</CardTitle>
            <CardDescription className="text-sm">
              {tool.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {hasToolAccess && (tool.usageCount !== undefined || tool.lastUsed) && (
        <CardContent className="py-2">
          {tool.usageCount !== undefined && tool.usageLimit && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Usage this month</span>
                <span>
                  {tool.usageCount} / {tool.usageLimit}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
          )}

          {tool.lastUsed && (
            <p className="text-xs text-muted-foreground mt-2">
              Last used: {formatLastUsed(tool.lastUsed)}
            </p>
          )}
        </CardContent>
      )}

      <CardFooter className="pt-3">
        {hasToolAccess ? (
          <Link href={tool.href} className="w-full">
            <Button className="w-full" size="sm">
              Open Tool
            </Button>
          </Link>
        ) : (
          <Button
            className="w-full"
            size="sm"
            variant="outline"
            onClick={() => {
              window.location.href = `/ai-tools/subscription?upgrade=${tool.subscriptionRequired}`
            }}
          >
            Upgrade to Access
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
