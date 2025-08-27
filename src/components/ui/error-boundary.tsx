'use client'

import React from 'react'
import { ErrorBoundaryState } from '@/types'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo)

    // Here you could send to an error reporting service
    // logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback

      return (
        <FallbackComponent
          error={this.state.error!}
          retry={() => this.setState({ hasError: false })}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({
  error,
  retry,
}: {
  error: Error
  retry: () => void
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-error-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          Something went wrong
        </h2>

        <p className="text-secondary-600 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <div className="space-y-2">
          <button
            onClick={retry}
            className="w-full btn-primary px-4 py-2 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full btn-ghost px-4 py-2 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2"
          >
            Reload Page
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-secondary-500 hover:text-secondary-700">
              Error Details
            </summary>
            <pre className="mt-2 p-3 bg-secondary-100 rounded text-xs overflow-auto text-secondary-800">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

export default ErrorBoundary
