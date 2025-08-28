import { requireAuth, getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { UserType } from '@prisma/client'
import { redirect } from 'next/navigation'
import BrokerDashboardClient from './broker-client'

export default async function BrokerDashboardPage() {
  const session = await requireAuth()
  const user = await getCurrentUser()

  // Only allow brokers and admins
  if (session.user.userType !== UserType.BROKER && session.user.userType !== UserType.ADMIN) {
    redirect('/dashboard')
  }

  // Fetch broker's client businesses and evaluations
  const businesses = await prisma.business.findMany({
    where: {
      ownerId: user?.id || '',
    },
    include: {
      images_rel: {
        orderBy: { orderIndex: 'asc' },
        take: 1,
      },
      _count: {
        select: {
          favorites: true,
          inquiries: true,
          views: true,
          evaluations: true,
        },
      },
      inquiries: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Get evaluations created by this broker
  const evaluations = await prisma.evaluation.findMany({
    where: {
      evaluatorId: user?.id || '',
    },
    include: {
      business: {
        select: {
          id: true,
          title: true,
          askingPrice: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Calculate metrics
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const recentEvaluations = await prisma.evaluation.count({
    where: {
      evaluatorId: user?.id || '',
      createdAt: { gte: thirtyDaysAgo },
    },
  })

  const totalCommissionValue = businesses
    .filter((b: any) => b.status === 'SOLD')
    .reduce((sum: number, b: any) => sum + (Number(b.askingPrice) || 0), 0) * 0.05 // Assume 5% commission

  const analytics = {
    totalClients: businesses.length,
    activeListings: businesses.filter((b: any) => b.status === 'ACTIVE').length,
    totalEvaluations: evaluations.length,
    recentEvaluations,
    totalCommissionValue,
    completedDeals: businesses.filter((b: any) => b.status === 'SOLD').length,
  }

  return (
    <BrokerDashboardClient
      user={user}
      businesses={businesses as any}
      evaluations={evaluations as any}
      analytics={analytics}
    />
  )
}