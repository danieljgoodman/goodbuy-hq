'use client'

import * as React from 'react'
import { Shield, CheckCircle, Lock, Award, Star } from 'lucide-react'
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
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <div className="text-center">
        <div className="text-2xl font-bold text-trust-primary">50K+</div>
        <div className="text-sm text-muted-foreground">Trusted Clients</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-trust-success">98%</div>
        <div className="text-sm text-muted-foreground">Accuracy Rate</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-trust-primary">$2.8B</div>
        <div className="text-sm text-muted-foreground">Value Analyzed</div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="text-2xl font-bold text-premium-gold">4.9</span>
          <Star className="h-4 w-4 text-premium-gold fill-current" />
        </div>
        <div className="text-sm text-muted-foreground">User Rating</div>
      </div>
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
