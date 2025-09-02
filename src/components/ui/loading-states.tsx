'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2, RefreshCw } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'primary' | 'secondary' | 'muted'
}

export function LoadingSpinner({
  size = 'md',
  className,
  variant = 'primary',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  const variantClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary-600',
    muted: 'text-muted-foreground',
  }

  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  lines?: number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted rounded'

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full',
              className
            )}
          />
        ))}
      </div>
    )
  }

  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'rounded-full aspect-square',
    rectangular: 'h-20 w-full',
  }

  return <div className={cn(baseClasses, variantClasses[variant], className)} />
}

interface LoadingCardProps {
  title?: boolean
  description?: boolean
  image?: boolean
  actions?: boolean
  className?: string
}

export function LoadingCard({
  title = true,
  description = true,
  image = false,
  actions = false,
  className,
}: LoadingCardProps) {
  return (
    <div className={cn('p-6 border rounded-lg', className)}>
      <div className="space-y-4">
        {image && <Skeleton variant="rectangular" className="h-48" />}

        <div className="space-y-2">
          {title && <Skeleton className="h-6 w-3/4" />}
          {description && <Skeleton variant="text" lines={2} />}
        </div>

        {actions && (
          <div className="flex space-x-2 pt-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        )}
      </div>
    </div>
  )
}

interface LoadingStateProps {
  loading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  error?: string | null
  retry?: () => void
}

export function LoadingState({
  loading,
  children,
  fallback,
  error,
  retry,
}: LoadingStateProps) {
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-2">Error loading content</div>
        <div className="text-sm text-muted-foreground mb-4">{error}</div>
        {retry && (
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        )}
      </div>
    )
  }

  if (loading) {
    return fallback || <LoadingSpinner size="lg" className="mx-auto" />
  }

  return <>{children}</>
}

interface InlineLoadingProps {
  loading: boolean
  text?: string
  size?: 'sm' | 'md'
}

export function InlineLoading({
  loading,
  text = 'Loading...',
  size = 'sm',
}: InlineLoadingProps) {
  if (!loading) return null

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <LoadingSpinner size={size} variant="muted" />
      <span className="text-sm">{text}</span>
    </div>
  )
}

// Form-specific loading states
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" /> {/* Label */}
      <Skeleton className="h-10 w-full" /> {/* Input */}
    </div>
  )
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <FormFieldSkeleton key={i} />
      ))}
    </div>
  )
}
