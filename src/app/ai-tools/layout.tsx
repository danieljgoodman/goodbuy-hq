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
  description:
    'Professional AI-powered business analysis, health scoring, and portfolio management',
}

export default async function AIToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Preserve existing authentication patterns
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
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
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </SubscriptionGuard>
      </main>
    </div>
  )
}
