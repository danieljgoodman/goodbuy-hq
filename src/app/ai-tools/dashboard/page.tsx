import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { AIToolsDashboard } from '@/components/ai/dashboard/ai-tools-dashboard'

export const metadata: Metadata = {
  title: 'AI Tools Dashboard | GoodBuy HQ',
  description:
    'Access advanced AI-powered business analysis tools and features',
}

export default async function AIToolsDashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          AI Tools Dashboard
        </h1>
        <p className="text-muted-foreground">
          Access advanced AI features while maintaining familiarity with
          existing workflows
        </p>
      </div>

      <AIToolsDashboard userId={session?.user?.id} />
    </div>
  )
}
