# Routing

Based on your existing Next.js 14 App Router architecture, I'm defining routing patterns that extend current navigation while supporting AI SaaS features, real-time streaming, and professional portfolio management capabilities.

## Route Configuration

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
