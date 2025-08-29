import React from 'react'
import { LoadingState } from '@/types'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <svg
      className={cn(
        'animate-spin text-primary-600',
        sizeClasses[size],
        className
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  className?: string
}

export function Loading({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
  className,
}: LoadingProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8'

  return (
    <div className={cn(containerClasses, className)}>
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-4" />
        {message && <p className="text-secondary-600 font-medium">{message}</p>}
      </div>
    </div>
  )
}

interface LoadingStateProps extends LoadingState {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LoadingWrapper({
  isLoading,
  message,
  children,
  fallback,
}: LoadingStateProps) {
  if (isLoading) {
    return fallback ? <>{fallback}</> : <Loading message={message} />
  }

  return <>{children}</>
}

// Page-level loading component
export function PageLoading({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
          <LoadingSpinner size="lg" />
        </div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          GoodBuy HQ
        </h2>
        <p className="text-secondary-600">
          {message || 'Setting things up for you...'}
        </p>
      </div>
    </div>
  )
}

// Button loading state
import { Button, ButtonProps } from '@/components/ui/button'

interface LoadingButtonProps extends Omit<ButtonProps, 'disabled'> {
  isLoading: boolean
  disabled?: boolean
}

export function LoadingButton({
  isLoading,
  children,
  disabled,
  className,
  variant = 'default',
  size = 'default',
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={cn(className)}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {children}
    </Button>
  )
}

// Skeleton loaders for content
export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-secondary-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-secondary-200 rounded"></div>
        <div className="h-3 bg-secondary-200 rounded w-5/6"></div>
        <div className="h-3 bg-secondary-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-3 bg-secondary-200 rounded',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}
