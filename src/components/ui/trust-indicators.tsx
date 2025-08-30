'use client'

import * as React from 'react'
import {
  Shield,
  CheckCircle,
  Lock,
  Award,
  Star,
  Users,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustIndicatorProps {
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export function TrustIndicators({
  variant = 'default',
  className,
}: TrustIndicatorProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-muted-foreground',
          className
        )}
      >
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4 text-trust-success" />
          <span>256-bit SSL</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-trust-success" />
          <span>SOC 2 Certified</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="h-4 w-4 text-trust-success" />
          <span>GDPR Compliant</span>
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
          <Shield className="h-8 w-8 text-trust-success" />
          <div>
            <h4 className="font-semibold text-sm">Bank-Grade Security</h4>
            <p className="text-xs text-muted-foreground">
              256-bit SSL encryption
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
          <Award className="h-8 w-8 text-premium-gold" />
          <div>
            <h4 className="font-semibold text-sm">SOC 2 Certified</h4>
            <p className="text-xs text-muted-foreground">Compliance verified</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
          <Lock className="h-8 w-8 text-trust-primary" />
          <div>
            <h4 className="font-semibold text-sm">GDPR Compliant</h4>
            <p className="text-xs text-muted-foreground">Privacy protected</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-6 text-sm',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-trust-success" />
        <span className="text-muted-foreground">256-bit SSL</span>
      </div>
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-premium-gold" />
        <span className="text-muted-foreground">SOC 2 Certified</span>
      </div>
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-trust-primary" />
        <span className="text-muted-foreground">GDPR Compliant</span>
      </div>
    </div>
  )
}

interface TrustMetricsProps {
  className?: string
}

export function TrustMetrics({ className }: TrustMetricsProps) {
  const stats = [
    {
      value: '50K+',
      label: 'Trusted Clients',
      icon: Users,
      color: 'text-trust-primary',
      bgColor: 'bg-trust-primary/10',
    },
    {
      value: '98%',
      label: 'Accuracy Rate',
      icon: Award,
      color: 'text-trust-success',
      bgColor: 'bg-trust-success/10',
    },
    {
      value: '$2.8B',
      label: 'Value Analyzed',
      icon: DollarSign,
      color: 'text-trust-primary',
      bgColor: 'bg-trust-primary/10',
    },
    {
      value: '4.9/5',
      label: 'User Rating',
      icon: Star,
      color: 'text-premium-gold',
      bgColor: 'bg-premium-gold/10',
    },
  ]

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="text-center group">
            {/* Icon */}
            <div
              className={cn(
                'inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 transition-all duration-300',
                stat.bgColor,
                'group-hover:scale-110'
              )}
            >
              <Icon className={cn('w-6 h-6', stat.color)} />
            </div>

            {/* Value */}
            <div className="text-2xl font-bold mb-1 text-trust-primary">
              {stat.value}
            </div>

            {/* Label */}
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        )
      })}
    </div>
  )
}

export function SecurityBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trust-success/10 text-trust-success border border-trust-success/20',
        className
      )}
    >
      <Shield className="h-4 w-4" />
      <span className="text-sm font-medium">Secured Platform</span>
    </div>
  )
}
