# GoodBuy HQ Frontend Architecture Document

**Version:** 1.0  
**Date:** January 3, 2025  
**Document Owner:** Winston (Architect)  
**Status:** Ready for Implementation

---

## Template and Framework Selection

### Existing Project Foundation Detected

Your GoodBuy HQ project is built on **Next.js 14.2.32** with **React 18.3.1** and **TypeScript 5.7.2**, representing a mature, production-ready codebase with:

- **Comprehensive ShadCN UI component library** with Radix UI primitives
- **Professional styling system** using Tailwind CSS 3.4.17 with established colors.md theming
- **Advanced data visualization** with Chart.js, Recharts, and D3-scale
- **Real-time capabilities** via Socket.IO already integrated
- **Enterprise-grade authentication** using NextAuth.js with Prisma adapter
- **Professional tooling** with comprehensive testing, linting, and type checking

**Framework Decision:** ✅ **Continue with existing Next.js 14 App Router** - No starter template needed as you have a sophisticated brownfield application.

**Brownfield Integration Constraints:**

1. Must maintain existing ShadCN UI component patterns and Radix UI foundations
2. Must preserve established Tailwind CSS configuration and theme system
3. Must integrate with existing authentication, database, and real-time infrastructure
4. Must maintain backward compatibility for current users and workflows

### Change Log

| Date       | Version | Description                                   | Author              |
| ---------- | ------- | --------------------------------------------- | ------------------- |
| 2025-01-03 | 1.0     | Frontend Architecture for AI SaaS Enhancement | Winston (Architect) |

---

## Frontend Tech Stack

Based on analysis of your existing brownfield Next.js application, I'm documenting the current technology stack that will serve as the foundation for AI SaaS enhancements. This stack represents a mature, production-ready architecture that must be preserved and enhanced rather than replaced.

### Technology Stack Table

| Category              | Technology                           | Version        | Purpose                                    | Rationale                                                                                                          |
| --------------------- | ------------------------------------ | -------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Framework**         | Next.js                              | 14.2.32        | Full-stack React framework with App Router | Industry-leading performance, built-in API routes, optimal for AI streaming analysis, existing codebase foundation |
| **UI Library**        | React                                | 18.3.1         | Component-based UI library                 | Concurrent features enable real-time AI analysis streaming, extensive ecosystem, established patterns in codebase  |
| **State Management**  | React Hook Form + Zustand (inferred) | 7.62.0         | Form state and global application state    | React Hook Form for complex financial data entry, lightweight state management for AI tool preferences             |
| **Routing**           | Next.js App Router                   | 14.2.32        | File-system based routing with layouts     | Built-in authentication integration, parallel routes for AI analysis, existing route structure preservation        |
| **Build Tool**        | Next.js (Turbopack/Webpack)          | 14.2.32        | Bundling and optimization                  | Automatic code splitting, API route optimization, existing build configuration                                     |
| **Styling**           | Tailwind CSS                         | 3.4.17         | Utility-first CSS framework                | Professional design system, existing theme configuration, responsive AI dashboard layouts                          |
| **Testing**           | Jest                                 | Latest         | Unit and integration testing               | Existing test patterns, AI algorithm validation, component testing for financial data display                      |
| **Component Library** | ShadCN UI + Radix UI                 | Latest         | Professional business UI components        | Enterprise-grade accessibility, existing theme integration, financial data visualization components                |
| **Form Handling**     | React Hook Form + Hookform Resolvers | 7.62.0 + 5.2.1 | Complex form management with validation    | Essential for business data input, Zod schema validation, existing form patterns                                   |
| **Animation**         | Framer Motion                        | 12.23.12       | UI animations and transitions              | Real-time AI analysis progress visualization, professional micro-interactions, existing usage                      |
| **Dev Tools**         | TypeScript + ESLint + Prettier       | 5.7.2          | Type safety and code quality               | Financial data accuracy, existing configuration, AI algorithm type safety                                          |

---

## Project Structure

Based on your existing Next.js 14 App Router architecture, I'm defining the enhanced project structure that preserves current organization while adding AI SaaS capabilities. This structure follows Next.js best practices and maintains backward compatibility.

```
goodbuy-hq/
├── app/                          # Next.js 14 App Router (existing)
│   ├── (auth)/                   # Auth route group (existing)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Main app route group (existing)
│   │   ├── dashboard/            # Current dashboard (preserved)
│   │   ├── businesses/           # Business management (existing)
│   │   └── settings/             # User settings (enhanced with subscriptions)
│   ├── ai-tools/                 # NEW: AI SaaS features route group
│   │   ├── dashboard/            # AI tools hub and overview
│   │   ├── analysis/             # Real-time AI analysis interface
│   │   │   └── [businessId]/     # Dynamic business analysis routes
│   │   ├── portfolio/            # Portfolio management dashboard
│   │   │   └── [portfolioId]/    # Individual portfolio views
│   │   ├── reports/              # Professional report builder
│   │   │   ├── builder/          # Report customization interface
│   │   │   └── [reportId]/       # Generated report views
│   │   └── subscription/         # Usage analytics and billing
│   ├── api/                      # API routes (existing + enhanced)
│   │   ├── auth/                 # NextAuth routes (existing)
│   │   ├── businesses/           # Business CRUD (existing)
│   │   ├── ai/                   # NEW: AI analysis endpoints
│   │   │   ├── analyze/          # Real-time analysis API
│   │   │   ├── stream/           # WebSocket streaming handlers
│   │   │   ├── health/           # Health scoring API
│   │   │   └── portfolio/        # Bulk analysis endpoints
│   │   ├── reports/              # NEW: Professional report generation
│   │   │   ├── generate/         # PDF/Excel export API
│   │   │   └── templates/        # White-label template management
│   │   ├── subscription/         # NEW: Stripe billing integration
│   │   │   ├── webhook/          # Billing event handlers
│   │   │   └── usage/            # Usage tracking endpoints
│   │   └── upload/               # File processing (enhanced for CSV/Excel)
│   ├── globals.css               # Global styles with AI component themes
│   ├── layout.tsx                # Root layout with theme provider
│   └── page.tsx                  # Landing page
├── components/                   # React components (existing + enhanced)
│   ├── ui/                       # ShadCN UI components (existing)
│   ├── forms/                    # Form components (enhanced validation)
│   ├── charts/                   # Data visualization (existing)
│   ├── ai/                       # NEW: AI-specific components
│   │   ├── analysis/             # Real-time analysis components
│   │   │   ├── StreamingProgress.tsx
│   │   │   ├── HealthScoreRing.tsx
│   │   │   └── ConfidenceIndicator.tsx
│   │   ├── dashboard/            # AI dashboard components
│   │   │   ├── ToolCard.tsx
│   │   │   ├── UsageTracker.tsx
│   │   │   └── RecentAnalyses.tsx
│   │   ├── portfolio/            # Portfolio management components
│   │   │   ├── BusinessGrid.tsx
│   │   │   ├── ComparisonTable.tsx
│   │   │   └── BulkActions.tsx
│   │   └── reports/              # Professional reporting components
│   │       ├── ReportBuilder.tsx
│   │       ├── TemplateSelector.tsx
│   │       └── WhiteLabelConfig.tsx
│   ├── subscription/             # NEW: Subscription management components
│   │   ├── PlanSelector.tsx
│   │   ├── UsageMetrics.tsx
│   │   └── BillingHistory.tsx
│   └── navigation/               # Enhanced navigation with AI tools
├── lib/                          # Utility libraries (existing + enhanced)
│   ├── auth.ts                   # NextAuth configuration (existing)
│   ├── db.ts                     # Prisma client (existing)
│   ├── ai/                       # NEW: AI analysis utilities
│   │   ├── analysis-engine.ts    # Core AI analysis algorithms
│   │   ├── health-calculator.ts  # Health scoring logic
│   │   ├── confidence-scorer.ts  # Analysis confidence calculation
│   │   └── streaming-client.ts   # WebSocket streaming utilities
│   ├── reports/                  # NEW: Report generation utilities
│   │   ├── pdf-generator.ts      # Professional PDF creation
│   │   ├── excel-exporter.ts     # Excel report generation
│   │   └── template-engine.ts    # White-label template processing
│   ├── subscription/             # NEW: Subscription management
│   │   ├── stripe-client.ts      # Stripe API integration
│   │   ├── usage-tracker.ts      # Credit consumption tracking
│   │   └── tier-manager.ts       # Feature access control
│   ├── validation/               # Enhanced Zod schemas
│   └── utils.ts                  # Utility functions (existing)
├── prisma/                       # Database schema (existing + enhanced)
│   ├── schema.prisma             # Enhanced with subscription tables
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Database seeding
├── public/                       # Static assets (existing + AI assets)
│   ├── images/
│   ├── ai-icons/                 # NEW: AI tool icons and illustrations
│   └── report-templates/         # NEW: Professional report assets
├── hooks/                        # Custom React hooks (existing + enhanced)
│   ├── use-auth.ts               # Authentication hook (existing)
│   ├── use-ai-analysis.ts        # NEW: AI analysis state management
│   ├── use-streaming.ts          # NEW: Real-time streaming hook
│   ├── use-subscription.ts       # NEW: Subscription management hook
│   └── use-portfolio.ts          # NEW: Portfolio management hook
├── types/                        # TypeScript definitions (enhanced)
│   ├── auth.ts                   # Authentication types (existing)
│   ├── business.ts               # Business data types (existing)
│   ├── ai.ts                     # NEW: AI analysis types
│   ├── subscription.ts           # NEW: Subscription and billing types
│   └── reports.ts                # NEW: Professional reporting types
├── styles/                       # Styling configuration (existing)
│   └── globals.css               # Enhanced with AI component styles
└── tests/                        # Testing (existing + enhanced)
    ├── components/               # Component tests
    ├── api/                      # API route tests
    ├── ai/                       # NEW: AI algorithm validation tests
    └── integration/              # End-to-end tests
```

---

## Component Standards

Based on your existing ShadCN UI foundation and React 18 patterns, I'm defining component standards that maintain consistency while supporting AI SaaS enhancements. These standards preserve your established development patterns while enabling sophisticated AI features.

### Component Template

```typescript
'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// AI-specific types building on existing patterns
interface AIAnalysisCardProps {
  businessId: string
  analysisType: 'health' | 'valuation' | 'forecast'
  isStreaming?: boolean
  confidence?: number
  onAnalyze?: () => void
  className?: string
}

// Component following established ShadCN patterns
export function AIAnalysisCard({
  businessId,
  analysisType,
  isStreaming = false,
  confidence,
  onAnalyze,
  className
}: AIAnalysisCardProps) {
  // Hooks follow existing patterns
  const [isLoading, setIsLoading] = React.useState(false)

  // Event handlers maintain existing patterns
  const handleAnalyze = React.useCallback(() => {
    setIsLoading(true)
    onAnalyze?.()
  }, [onAnalyze])

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {analysisType === 'health' && 'Business Health Analysis'}
          {analysisType === 'valuation' && 'AI Valuation'}
          {analysisType === 'forecast' && 'Financial Forecast'}
          {confidence && (
            <span className="text-sm text-muted-foreground">
              {Math.round(confidence * 100)}% confidence
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* AI-specific content using existing UI patterns */}
          {isStreaming && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analyzing...</span>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={isLoading || isStreaming}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Start Analysis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Export component with display name for debugging
AIAnalysisCard.displayName = 'AIAnalysisCard'

// Type exports for reuse
export type { AIAnalysisCardProps }
```

### Naming Conventions

**Component Naming**:

- **AI Components**: Prefix with `AI` for analysis-specific components (`AIHealthScoreRing`, `AIStreamingProgress`)
- **Generic Components**: Use descriptive names following existing patterns (`SubscriptionPlanCard`, `UsageMetrics`)
- **Page Components**: Suffix with `Page` for route components (`AIToolsDashboardPage`, `PortfolioManagementPage`)

**File Naming**:

- **Components**: PascalCase matching component name (`AIAnalysisCard.tsx`, `ReportBuilder.tsx`)
- **Hooks**: kebab-case with `use-` prefix (`use-ai-analysis.ts`, `use-subscription.ts`)
- **Utilities**: kebab-case descriptive (`health-calculator.ts`, `streaming-client.ts`)
- **Types**: kebab-case with domain prefix (`ai-types.ts`, `subscription-types.ts`)

**Props and State**:

- **Props**: camelCase with descriptive names (`businessId`, `analysisType`, `isStreaming`)
- **State**: camelCase with action prefixes (`isLoading`, `hasError`, `streamingData`)
- **Handlers**: camelCase with `handle` prefix (`handleAnalyze`, `handleSubscriptionChange`)

**Directory Organization**:

- **Feature Groups**: kebab-case directories (`ai-analysis/`, `subscription-management/`)
- **Component Collections**: plural descriptive names (`charts/`, `forms/`, `dashboards/`)
- **Shared Utilities**: singular descriptive names (`validation/`, `utils/`, `constants/`)

---

## State Management

Based on your existing React Hook Form integration and established patterns, I'm defining state management approaches that handle AI analysis complexity while preserving current form and application state patterns.

### Store Structure

```
state/
├── global/                       # Application-wide state
│   ├── auth-store.ts            # User authentication (existing)
│   ├── theme-store.ts           # Theme and UI preferences (existing)
│   └── subscription-store.ts    # NEW: Subscription tier and usage tracking
├── ai/                          # NEW: AI analysis state management
│   ├── analysis-store.ts        # Active analysis sessions and results
│   ├── streaming-store.ts       # Real-time analysis progress and WebSocket state
│   ├── health-store.ts          # Business health scoring cache and history
│   └── confidence-store.ts      # Analysis confidence tracking and validation
├── portfolio/                   # NEW: Portfolio management state
│   ├── portfolio-store.ts       # Portfolio organization and bulk operations
│   ├── comparison-store.ts      # Multi-business comparison state
│   └── bulk-analysis-store.ts   # Batch processing queue and results
├── reports/                     # NEW: Professional reporting state
│   ├── report-builder-store.ts  # Report customization and template state
│   ├── export-queue-store.ts    # PDF/Excel generation queue management
│   └── white-label-store.ts     # Branding and customization preferences
└── forms/                       # Enhanced form state (building on existing)
    ├── business-form-store.ts   # Business data entry (enhanced validation)
    ├── upload-store.ts          # CSV/Excel upload processing state
    └── validation-store.ts      # Intelligent data mapping and validation
```

### State Management Template

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// AI Analysis State Types
interface AIAnalysisState {
  // Active analysis sessions
  activeAnalyses: Record<string, AnalysisSession>

  // Streaming state for real-time progress
  streamingConnections: Record<string, WebSocketConnection>

  // Analysis results cache
  results: Record<string, AnalysisResult>

  // Loading and error states
  isAnalyzing: boolean
  error: string | null

  // Actions
  startAnalysis: (businessId: string, type: AnalysisType) => Promise<void>
  updateProgress: (sessionId: string, progress: ProgressUpdate) => void
  completeAnalysis: (sessionId: string, result: AnalysisResult) => void
  clearError: () => void
}

// Store implementation following existing patterns
export const useAIAnalysisStore = create<AIAnalysisState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      activeAnalyses: {},
      streamingConnections: {},
      results: {},
      isAnalyzing: false,
      error: null,

      // Analysis lifecycle management
      startAnalysis: async (businessId: string, type: AnalysisType) => {
        set(state => {
          state.isAnalyzing = true
          state.error = null

          const sessionId = `${businessId}-${type}-${Date.now()}`
          state.activeAnalyses[sessionId] = {
            id: sessionId,
            businessId,
            type,
            status: 'initializing',
            progress: 0,
            startTime: new Date(),
          }
        })

        try {
          // Integration with existing API patterns
          const response = await fetch(`/api/ai/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId, type }),
          })

          if (!response.ok) throw new Error('Analysis failed to start')

          const { sessionId, streamUrl } = await response.json()

          // Establish WebSocket connection for real-time updates
          get().setupStreaming(sessionId, streamUrl)
        } catch (error) {
          set(state => {
            state.isAnalyzing = false
            state.error =
              error instanceof Error ? error.message : 'Unknown error'
          })
        }
      },

      // Real-time progress updates
      updateProgress: (sessionId: string, progress: ProgressUpdate) => {
        set(state => {
          if (state.activeAnalyses[sessionId]) {
            state.activeAnalyses[sessionId].progress = progress.percentage
            state.activeAnalyses[sessionId].status = progress.stage
            state.activeAnalyses[sessionId].partialResults =
              progress.partialResults
          }
        })
      },

      // Analysis completion handling
      completeAnalysis: (sessionId: string, result: AnalysisResult) => {
        set(state => {
          state.isAnalyzing = false

          // Move from active to completed
          const analysis = state.activeAnalyses[sessionId]
          if (analysis) {
            state.results[sessionId] = {
              ...result,
              sessionId,
              businessId: analysis.businessId,
              completedAt: new Date(),
            }

            // Clean up active analysis
            delete state.activeAnalyses[sessionId]
          }

          // Clean up streaming connection
          if (state.streamingConnections[sessionId]) {
            state.streamingConnections[sessionId].close()
            delete state.streamingConnections[sessionId]
          }
        })
      },

      // Error handling
      clearError: () => {
        set(state => {
          state.error = null
        })
      },

      // WebSocket connection management
      setupStreaming: (sessionId: string, streamUrl: string) => {
        const ws = new WebSocket(streamUrl)

        ws.onmessage = event => {
          const update = JSON.parse(event.data) as ProgressUpdate
          get().updateProgress(sessionId, update)
        }

        ws.onclose = () => {
          set(state => {
            delete state.streamingConnections[sessionId]
          })
        }

        ws.onerror = () => {
          set(state => {
            state.error = 'Streaming connection failed'
            delete state.streamingConnections[sessionId]
          })
        }

        set(state => {
          state.streamingConnections[sessionId] = ws
        })
      },
    }))
  )
)

// Custom hooks for component integration
export const useAIAnalysis = (businessId?: string) => {
  const store = useAIAnalysisStore()

  // Filter active analyses for specific business
  const businessAnalyses = businessId
    ? Object.values(store.activeAnalyses).filter(
        a => a.businessId === businessId
      )
    : Object.values(store.activeAnalyses)

  // Get results for business
  const businessResults = businessId
    ? Object.values(store.results).filter(r => r.businessId === businessId)
    : Object.values(store.results)

  return {
    activeAnalyses: businessAnalyses,
    results: businessResults,
    isAnalyzing: store.isAnalyzing,
    error: store.error,
    startAnalysis: store.startAnalysis,
    clearError: store.clearError,
  }
}
```

---

## API Integration

Based on your existing Next.js API routes and established patterns, I'm defining API integration approaches that extend current architecture while supporting AI analysis streaming, subscription management, and professional reporting capabilities.

### Service Template

```typescript
// /lib/services/ai-analysis-service.ts
import { z } from 'zod'

// API client configuration building on existing patterns
class AIAnalysisService {
  private baseUrl = '/api/ai'
  private wsBaseUrl =
    process.env.NODE_ENV === 'production'
      ? 'wss://your-domain.com/ws'
      : 'ws://localhost:3000/ws'

  // Analysis request validation using existing Zod patterns
  private analyzeRequestSchema = z.object({
    businessId: z.string().uuid(),
    analysisType: z.enum(['health', 'valuation', 'forecast', 'comprehensive']),
    options: z
      .object({
        includeConfidence: z.boolean().default(true),
        streamProgress: z.boolean().default(true),
        priority: z.enum(['normal', 'high']).default('normal'),
      })
      .optional(),
  })

  // Start AI analysis with streaming support
  async startAnalysis(request: AnalysisRequest): Promise<AnalysisSession> {
    try {
      // Validate request using existing validation patterns
      const validatedRequest = this.analyzeRequestSchema.parse(request)

      // API call following existing error handling patterns
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(validatedRequest),
      })

      if (!response.ok) {
        throw new APIError(
          `Analysis failed: ${response.status}`,
          response.status,
          await response.text()
        )
      }

      const session = await response.json()

      // Return session with WebSocket URL for streaming
      return {
        ...session,
        streamUrl: `${this.wsBaseUrl}/analysis/${session.sessionId}`,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid analysis request', error.errors)
      }
      throw error
    }
  }

  // WebSocket streaming client for real-time updates
  createStreamingClient(sessionId: string): StreamingClient {
    return new StreamingClient(`${this.wsBaseUrl}/analysis/${sessionId}`)
  }

  // Authentication token retrieval (integrating with existing NextAuth)
  private async getAuthToken(): Promise<string> {
    const session = await fetch('/api/auth/session').then(r => r.json())
    if (!session?.accessToken) {
      throw new AuthError('Authentication required')
    }
    return session.accessToken
  }
}

// Streaming client for real-time progress updates
class StreamingClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectDelay = 1000

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onerror = error => {
          console.error('WebSocket error:', error)
          reject(new Error('Failed to establish streaming connection'))
        }

        this.ws.onclose = event => {
          if (
            event.code !== 1000 &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            setTimeout(() => {
              this.reconnectAttempts++
              this.connect()
            }, this.reconnectDelay * this.reconnectAttempts)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  onProgress(callback: (progress: ProgressUpdate) => void): void {
    if (!this.ws) throw new Error('WebSocket not connected')

    this.ws.onmessage = event => {
      try {
        const progress = JSON.parse(event.data) as ProgressUpdate
        callback(progress)
      } catch (error) {
        console.error('Failed to parse progress update:', error)
      }
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
  }
}

// Export configured service instances
export const aiAnalysisService = new AIAnalysisService()

// Custom errors for better error handling
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: z.ZodIssue[]
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}
```

### API Client Configuration

```typescript
// /lib/api-client.ts
import { z } from 'zod'

// HTTP client configuration extending existing patterns
export class APIClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  // Generic request method with error handling
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    // Add authentication header from existing NextAuth session
    const authHeaders = await this.getAuthHeaders()

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...authHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      // Handle authentication errors
      if (response.status === 401) {
        // Trigger re-authentication using existing patterns
        window.location.href = '/api/auth/signin'
        throw new AuthError('Authentication required')
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after')
        throw new RateLimitError(
          'Rate limit exceeded',
          parseInt(retryAfter || '60')
        )
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new APIError(
          errorData?.message || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError || error instanceof AuthError) {
        throw error
      }
      throw new APIError('Network error', 0, error)
    }
  }

  // Authentication header integration with NextAuth
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const session = await fetch('/api/auth/session').then(r => r.json())
      return session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}
    } catch {
      return {}
    }
  }
}

// Export configured client instance
export const apiClient = new APIClient()

// Custom error classes
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}
```

---

## Routing

Based on your existing Next.js 14 App Router architecture, I'm defining routing patterns that extend current navigation while supporting AI SaaS features, real-time streaming, and professional portfolio management capabilities.

### Route Configuration

```typescript
// /app/ai-tools/layout.tsx - AI tools route group layout
import { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { AIToolsNav } from '@/components/ai/navigation/ai-tools-nav'
import { SubscriptionGuard } from '@/components/subscription/subscription-guard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata: Metadata = {
  title: 'AI Business Analysis Tools | GoodBuy HQ',
  description: 'Professional AI-powered business analysis, health scoring, and portfolio management',
}

export default async function AIToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Preserve existing authentication patterns
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="flex min-h-screen">
      {/* AI tools navigation sidebar */}
      <aside className="w-64 border-r bg-muted/10">
        <AIToolsNav />
      </aside>

      {/* Main content with subscription-based access control */}
      <main className="flex-1">
        <SubscriptionGuard>
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </SubscriptionGuard>
      </main>
    </div>
  )
}

// /app/ai-tools/analysis/[businessId]/page.tsx - Dynamic analysis route
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { RealTimeAnalysisInterface } from '@/components/ai/analysis/real-time-analysis-interface'
import { BusinessContextProvider } from '@/components/business/business-context-provider'

interface AnalysisPageProps {
  params: {
    businessId: string
  }
  searchParams: {
    type?: 'health' | 'valuation' | 'forecast' | 'comprehensive'
    mode?: 'streaming' | 'batch'
  }
}

export async function generateMetadata({ params }: AnalysisPageProps): Promise<Metadata> {
  const business = await prisma.business.findUnique({
    where: { id: params.businessId },
    select: { name: true }
  })

  return {
    title: `AI Analysis - ${business?.name || 'Business'} | GoodBuy HQ`,
    description: 'Real-time AI-powered business analysis with streaming progress',
  }
}

export default async function AnalysisPage({ params, searchParams }: AnalysisPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin')
  }

  // Verify business access with existing authorization patterns
  const business = await prisma.business.findFirst({
    where: {
      id: params.businessId,
      // Maintain existing business access control
      OR: [
        { userId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } }
      ]
    },
    include: {
      healthMetrics: {
        orderBy: { calculatedAt: 'desc' },
        take: 1
      }
    }
  })

  if (!business) {
    notFound()
  }

  return (
    <BusinessContextProvider business={business}>
      <RealTimeAnalysisInterface
        businessId={params.businessId}
        analysisType={searchParams.type || 'comprehensive'}
        streamingMode={searchParams.mode !== 'batch'}
      />
    </BusinessContextProvider>
  )
}

// /middleware.ts - Enhanced route protection and subscription validation
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // AI tools route protection with subscription validation
    if (pathname.startsWith('/ai-tools')) {
      if (!token) {
        return NextResponse.redirect(new URL('/api/auth/signin', req.url))
      }

      // Check subscription tier for AI features
      const subscription = await fetch(`${req.nextUrl.origin}/api/subscription/current`, {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
        }
      }).then(r => r.json()).catch(() => null)

      // Free tier limitations
      if (subscription?.plan?.tier === 'free') {
        const restrictedRoutes = ['/ai-tools/portfolio', '/ai-tools/reports/builder']
        if (restrictedRoutes.some(route => pathname.startsWith(route))) {
          return NextResponse.redirect(new URL('/ai-tools/subscription', req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes that don't require authentication
        const publicRoutes = ['/api/health', '/api/webhooks']
        if (publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/ai-tools/:path*',
    '/api/ai/:path*',
    '/api/subscription/:path*',
    '/api/reports/:path*',
    '/dashboard/:path*',
  ]
}
```

---

## Styling Guidelines

Based on your existing Tailwind CSS 3.4.17 configuration and established colors.md theming system, I'm defining styling approaches that extend current design patterns while supporting AI-specific visualizations, professional reporting, and subscription-based feature presentation.

### Styling Approach

Your existing Tailwind CSS foundation provides excellent support for AI SaaS enhancements through utility-first patterns that integrate seamlessly with ShadCN UI components. The established approach uses:

**Component-First Styling**: ShadCN UI components provide consistent, accessible styling that extends naturally to AI-specific visualizations like health score rings, streaming progress indicators, and portfolio comparison tables.

**CSS Variables Integration**: Your existing colors.md theming system supports dynamic theme switching essential for professional white-labeling and client customization features required for broker and advisor use cases.

**Responsive Design Continuity**: Existing responsive patterns accommodate complex AI dashboards and real-time streaming interfaces while maintaining mobile usability for portfolio management and subscription features.

**Professional Aesthetic**: Current styling supports the sophisticated business intelligence presentation required for financial services while extending to accommodate AI analysis confidence indicators and professional report generation.

### Global Theme Variables

```css
/* /app/globals.css - Enhanced theme system building on existing patterns */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Existing color system (preserved) */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;

    /* NEW: AI-specific color system */
    --ai-confidence-high: 142.1 76.2% 36.3%; /* Green for high confidence */
    --ai-confidence-medium: 47.9 95.8% 53.1%; /* Amber for medium confidence */
    --ai-confidence-low: 0 84.2% 60.2%; /* Red for low confidence */
    --ai-processing: 221.2 83.2% 53.3%; /* Blue for processing states */
    --ai-streaming: 142.1 70.6% 45.3%; /* Animated green for streaming */

    /* NEW: Health score gradient system */
    --health-excellent: 142.1 76.2% 36.3%; /* 80-100 score range */
    --health-good: 173.4 58.5% 39.4%; /* 60-79 score range */
    --health-fair: 47.9 95.8% 53.1%; /* 40-59 score range */
    --health-poor: 0 84.2% 60.2%; /* 0-39 score range */

    /* NEW: Professional reporting colors */
    --report-primary: 222.2 47.4% 11.2%; /* Professional dark blue */
    --report-secondary: 215.4 16.3% 46.9%; /* Muted text */
    --report-accent: 142.1 76.2% 36.3%; /* Success green */
    --report-neutral: 210 40% 96%; /* Light backgrounds */

    /* NEW: Subscription tier colors */
    --tier-free: 215.4 16.3% 46.9%; /* Muted gray */
    --tier-professional: 221.2 83.2% 53.3%; /* Professional blue */
    --tier-enterprise: 271.5 81.3% 55.9%; /* Premium purple */
  }

  .dark {
    /* Existing dark theme (preserved) */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;

    /* NEW: Dark mode AI colors */
    --ai-confidence-high: 142.1 70.6% 45.3%;
    --ai-confidence-medium: 47.9 95.8% 53.1%;
    --ai-confidence-low: 0 72.2% 50.6%;
    --ai-processing: 217.2 91.2% 59.8%;
    --ai-streaming: 142.1 76.2% 36.3%;

    /* NEW: Dark mode health scores */
    --health-excellent: 142.1 70.6% 45.3%;
    --health-good: 173.4 58.5% 39.4%;
    --health-fair: 47.9 95.8% 53.1%;
    --health-poor: 0 72.2% 50.6%;

    /* NEW: Dark mode professional reporting */
    --report-primary: 210 40% 98%;
    --report-secondary: 215 20.2% 65.1%;
    --report-accent: 142.1 70.6% 45.3%;
    --report-neutral: 217.2 32.6% 17.5%;
  }
}

@layer components {
  /* NEW: AI-specific component classes */
  .ai-confidence-indicator {
    @apply inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium;
  }

  .ai-confidence-high {
    @apply bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400;
    background-color: hsl(var(--ai-confidence-high) / 0.1);
    color: hsl(var(--ai-confidence-high));
  }

  .ai-confidence-medium {
    @apply bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400;
    background-color: hsl(var(--ai-confidence-medium) / 0.1);
    color: hsl(var(--ai-confidence-medium));
  }

  .ai-confidence-low {
    @apply bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400;
    background-color: hsl(var(--ai-confidence-low) / 0.1);
    color: hsl(var(--ai-confidence-low));
  }

  /* NEW: Health score ring component styles */
  .health-score-ring {
    @apply relative inline-flex items-center justify-center;
  }

  .health-score-ring svg {
    @apply transform -rotate-90;
  }

  .health-score-ring .background-ring {
    @apply stroke-muted;
  }

  .health-score-ring .progress-ring {
    @apply transition-all duration-1000 ease-out;
    stroke-linecap: round;
  }

  .health-excellent .progress-ring {
    stroke: hsl(var(--health-excellent));
  }

  .health-good .progress-ring {
    stroke: hsl(var(--health-good));
  }

  .health-fair .progress-ring {
    stroke: hsl(var(--health-fair));
  }

  .health-poor .progress-ring {
    stroke: hsl(var(--health-poor));
  }

  /* NEW: Streaming animation for AI analysis */
  .ai-streaming-pulse {
    @apply animate-pulse;
    animation-duration: 2s;
  }

  .ai-streaming-progress {
    @apply relative overflow-hidden;
  }

  .ai-streaming-progress::after {
    @apply absolute inset-0 -translate-x-full;
    content: '';
    background: linear-gradient(
      90deg,
      transparent,
      hsl(var(--ai-streaming) / 0.4),
      transparent
    );
    animation: streaming-shimmer 2s infinite;
  }

  /* NEW: Professional report styling */
  .report-layout {
    @apply max-w-4xl mx-auto bg-card text-card-foreground;
    color: hsl(var(--report-primary));
  }

  .report-header {
    @apply border-b-2 pb-6 mb-8;
    border-color: hsl(var(--report-primary));
  }

  .report-section {
    @apply mb-8 last:mb-0;
  }

  .report-table {
    @apply w-full border-collapse;
  }

  .report-table th,
  .report-table td {
    @apply border p-3 text-left;
    border-color: hsl(var(--border));
  }

  .report-table th {
    @apply font-semibold bg-muted;
    background-color: hsl(var(--report-neutral));
  }

  /* NEW: Subscription tier styling */
  .tier-badge {
    @apply inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium uppercase tracking-wide;
  }

  .tier-free {
    @apply bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300;
  }

  .tier-professional {
    @apply bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400;
  }

  .tier-enterprise {
    @apply bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400;
  }
}

@layer utilities {
  /* NEW: Animation utilities for AI features */
  @keyframes streaming-shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes health-score-fill {
    0% {
      stroke-dashoffset: 283;
    }
    100% {
      stroke-dashoffset: var(--progress-offset);
    }
  }

  .animate-streaming-shimmer {
    animation: streaming-shimmer 2s infinite;
  }

  .animate-health-score-fill {
    animation: health-score-fill 2s ease-out forwards;
  }
}
```

---

## Testing Requirements

Based on your existing Jest testing framework and established patterns, I'm defining testing strategies that ensure AI algorithm accuracy, real-time streaming reliability, and subscription feature integrity while maintaining existing test coverage and quality standards.

### Component Test Template

```typescript
// /tests/components/ai/analysis/ai-health-score-ring.test.tsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AIHealthScoreRing } from '@/components/ai/analysis/ai-health-score-ring'
import { ThemeProvider } from '@/components/theme-provider'

// Mock data following existing patterns
const mockHealthScore = {
  overall: 85,
  financial: 90,
  growth: 80,
  operational: 85,
  saleReadiness: 88,
  confidence: 92,
  trajectory: 'improving' as const,
  lastUpdated: new Date('2025-01-03'),
}

// Test wrapper maintaining existing theme provider patterns
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    {children}
  </ThemeProvider>
)

describe('AIHealthScoreRing', () => {
  beforeEach(() => {
    // Reset any global state between tests
    jest.clearAllMocks()
  })

  it('renders health score with correct percentage', () => {
    render(
      <AIHealthScoreRing
        score={mockHealthScore.overall}
        confidence={mockHealthScore.confidence}
        size="lg"
      />,
      { wrapper: TestWrapper }
    )

    // Test score display
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText(/85%/)).toBeInTheDocument()

    // Test confidence indicator
    expect(screen.getByText(/92% confidence/)).toBeInTheDocument()
  })

  it('applies correct health score color based on value', () => {
    const { rerender } = render(
      <AIHealthScoreRing score={85} confidence={90} size="md" />,
      { wrapper: TestWrapper }
    )

    // Test excellent score (80-100) - green
    const ring = screen.getByRole('img', { name: /health score ring/i })
    expect(ring).toHaveClass('health-excellent')

    // Test good score (60-79) - blue
    rerender(<AIHealthScoreRing score={70} confidence={85} size="md" />)
    expect(ring).toHaveClass('health-good')

    // Test fair score (40-59) - amber
    rerender(<AIHealthScoreRing score={50} confidence={75} size="md" />)
    expect(ring).toHaveClass('health-fair')

    // Test poor score (0-39) - red
    rerender(<AIHealthScoreRing score={30} confidence={65} size="md" />)
    expect(ring).toHaveClass('health-poor')
  })

  it('handles accessibility requirements', () => {
    render(
      <AIHealthScoreRing
        score={85}
        confidence={92}
        size="md"
        aria-label="Business health score: 85 out of 100"
      />,
      { wrapper: TestWrapper }
    )

    // Test ARIA attributes
    const ring = screen.getByRole('img')
    expect(ring).toHaveAttribute('aria-label', 'Business health score: 85 out of 100')

    // Test screen reader content
    expect(screen.getByText(/85 out of 100/)).toBeInTheDocument()
  })
})
```

### Testing Best Practices

1. **Unit Tests**: Test individual AI analysis components in isolation with comprehensive edge case coverage
2. **Integration Tests**: Test component interactions, API integration, and WebSocket streaming workflows
3. **E2E Tests**: Test critical user flows including analysis workflow, subscription management, and report generation
4. **Coverage Goals**: Maintain 90%+ code coverage with special focus on financial calculation accuracy
5. **Test Structure**: Follow Arrange-Act-Assert pattern with clear test descriptions and proper mocking
6. **Mock External Dependencies**: Mock API calls, WebSocket connections, and authentication for reliable testing

---

## Environment Configuration

Based on your existing Next.js deployment patterns and established environment management, I'm defining configuration requirements that support AI analysis processing, subscription billing integration, and professional reporting capabilities while maintaining security and scalability.

```bash
# .env.local - Local development environment
# Existing environment variables (preserved)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
DATABASE_URL=postgresql://username:password@localhost:5432/goodbuy_hq_dev
REDIS_URL=redis://localhost:6379

# AI Analysis Configuration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
AI_ANALYSIS_TIMEOUT_MS=30000
AI_CONCURRENT_ANALYSES_LIMIT=10
AI_STREAMING_HEARTBEAT_INTERVAL=5000

# WebSocket Configuration
WEBSOCKET_PORT=3001
WEBSOCKET_PATH=/ws
WEBSOCKET_CORS_ORIGIN=http://localhost:3000
WEBSOCKET_CONNECTION_TIMEOUT=30000
WEBSOCKET_MAX_CONNECTIONS=1000

# Subscription & Billing (Stripe)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID_PROFESSIONAL=price_your-professional-price-id
STRIPE_PRICE_ID_ENTERPRISE=price_your-enterprise-price-id

# Professional Reporting
REPORT_GENERATION_TIMEOUT_MS=60000
REPORT_STORAGE_BUCKET=goodbuy-reports-dev
REPORT_CDN_BASE_URL=https://dev-reports.goodbuy.com
PDF_GENERATION_MEMORY_LIMIT=512
EXCEL_EXPORT_MAX_ROWS=10000

# Feature Flags
FEATURE_AI_PORTFOLIO_ANALYSIS=true
FEATURE_BULK_ANALYSIS=true
FEATURE_WHITE_LABEL_REPORTS=true
FEATURE_ADVANCED_ANALYTICS=false
FEATURE_BETA_AI_FORECASTING=false

# Rate Limiting
RATE_LIMIT_AI_ANALYSIS_PER_HOUR=50
RATE_LIMIT_REPORT_GENERATION_PER_HOUR=20
RATE_LIMIT_BULK_OPERATIONS_PER_DAY=10

# Monitoring & Analytics
ANALYTICS_API_KEY=your-analytics-api-key
ERROR_REPORTING_DSN=your-sentry-dsn
PERFORMANCE_MONITORING_SAMPLE_RATE=0.1
LOG_LEVEL=debug
```

### Configuration Management Patterns

```typescript
// /lib/config/env.ts - Environment configuration management
import { z } from 'zod'

// Environment variable validation schema
const envSchema = z.object({
  // Base Next.js configuration
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),

  // AI Analysis Configuration
  OPENAI_API_KEY: z.string().min(1),
  AI_ANALYSIS_TIMEOUT_MS: z.coerce.number().default(30000),
  AI_CONCURRENT_ANALYSES_LIMIT: z.coerce.number().default(10),

  // WebSocket Configuration
  WEBSOCKET_PORT: z.coerce.number().default(3001),
  WEBSOCKET_MAX_CONNECTIONS: z.coerce.number().default(1000),

  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),

  // Feature Flags
  FEATURE_AI_PORTFOLIO_ANALYSIS: z.coerce.boolean().default(false),
  FEATURE_BULK_ANALYSIS: z.coerce.boolean().default(false),
})

// Parse and validate environment variables
function createEnv() {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors
    )
    throw new Error('Invalid environment configuration')
  }

  return parsed.data
}

// Export validated environment configuration
export const env = createEnv()
```

---

## Frontend Developer Standards

### Critical Coding Rules

Based on your existing codebase patterns and the complexity of AI SaaS features, these rules prevent common implementation mistakes while ensuring financial data accuracy and professional user experience quality.

#### Universal Critical Rules

1. **Financial Data Precision**: Always use `Decimal` or `BigNumber` for financial calculations. Never use JavaScript's native `Number` for currency values, percentages, or business metrics that affect analysis results.

```typescript
// ❌ WRONG - Float precision errors
const profitMargin = ((revenue - costs) / revenue) * 100

// ✅ CORRECT - Decimal precision
import { Decimal } from 'decimal.js'
const profitMargin = new Decimal(revenue).minus(costs).div(revenue).mul(100)
```

2. **TypeScript Strict Mode Enforcement**: All AI analysis components must use strict TypeScript with `noImplicitAny`, `strictNullChecks`, and `strictFunctionTypes`. Financial calculations require explicit type safety.

3. **Real-time State Immutability**: AI streaming components must never mutate state directly. Use Immer or immutable update patterns to prevent race conditions during concurrent analysis operations.

4. **WebSocket Connection Management**: Always implement proper cleanup for WebSocket connections. Memory leaks in streaming components affect performance during long AI analysis sessions.

#### Next.js 14 App Router Specific Rules

5. **Server Component Financial Data**: Financial calculations in Server Components must be deterministic and cacheable. Use `unstable_cache` for expensive health score calculations.

6. **Dynamic Route Validation**: All dynamic routes with financial data must validate parameters using Zod schemas. Invalid business IDs must result in proper 404 responses.

#### AI Analysis Component Rules

7. **Confidence Score Display**: AI confidence indicators must always show both percentage and qualitative assessment. Never display confidence below 60% without warning.

8. **Streaming Progress Accuracy**: Progress indicators must reflect actual AI analysis stages. Never fake progress for perceived performance.

### Quick Reference

#### Common Commands

```bash
# Development server with proper environment
npm run dev

# Build with type checking and AI analysis validation
npm run build && npm run type-check

# Run comprehensive tests including AI algorithms
npm run test && npm run test:integration

# Database operations with AI schema
npm run db:migrate && npm run db:generate
```

#### Key Import Patterns

```typescript
// ShadCN UI components (existing patterns)
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// AI-specific components
import { AIHealthScoreRing } from '@/components/ai/analysis/health-score-ring'
import { StreamingProgressBar } from '@/components/ai/analysis/streaming-progress-bar'

// Services and utilities
import { aiAnalysisService } from '@/lib/services/ai-analysis-service'
import { subscriptionService } from '@/lib/services/subscription-service'

// State management
import { useAIAnalysis } from '@/hooks/use-ai-analysis'
import { useSubscription } from '@/hooks/use-subscription'
```

#### File Naming Conventions

- **AI Components**: `ai-health-score-ring.tsx`, `streaming-progress-indicator.tsx`
- **Subscription Components**: `subscription-plan-card.tsx`, `usage-metrics-display.tsx`
- **Service Files**: `ai-analysis-service.ts`, `subscription-service.ts`
- **Hook Files**: `use-ai-analysis.ts`, `use-streaming-client.ts`
- **Type Files**: `ai-types.ts`, `subscription-types.ts`

#### Project-Specific Patterns

- **AI Analysis Results**: Always cache expensive calculations with proper revalidation
- **WebSocket Connections**: Implement heartbeat and reconnection logic for reliability
- **Financial Calculations**: Use Decimal.js for all currency and percentage calculations
- **Subscription Features**: Check feature flags and user tier before rendering premium components
- **Error Boundaries**: Wrap AI components with error boundaries that handle streaming failures gracefully

---

## Implementation Summary

This comprehensive Frontend Architecture Document extends your existing Next.js 14 + ShadCN UI foundation to support sophisticated AI SaaS features while maintaining backward compatibility and professional standards. The architecture enables:

**AI Analysis Capabilities**: Real-time streaming analysis with WebSocket integration, multi-dimensional health scoring, and confidence-based result presentation.

**Subscription Management**: Full SaaS subscription lifecycle with Stripe integration, usage tracking, and tier-based feature access control.

**Professional Reporting**: White-label report generation with PDF/Excel export, custom branding, and portfolio management capabilities.

**Enterprise Standards**: Financial data precision, accessibility compliance, comprehensive testing, and production-ready security measures.

**Technical Foundation**: Seamless integration with existing authentication, database, and deployment infrastructure while adding scalable AI processing capabilities.

The brownfield enhancement approach ensures zero disruption to current operations while systematically building enterprise-grade AI business intelligence platform capabilities.

**🚀 Ready for Implementation** - This frontend architecture supports the complete AI-first SaaS platform transformation while leveraging your established technical foundation and development workflows.

---

**Document Version Control:**

- v1.0 - Frontend Architecture for AI SaaS Enhancement (January 3, 2025)
- Review cycle: Technical Review → Frontend Team Review → Architecture Approval
- Next review date: January 17, 2025
- Document owner: Winston (Architect)
