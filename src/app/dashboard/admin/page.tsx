import { requireAuth, getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { UserType } from '@prisma/client'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './admin-client'

export default async function AdminDashboardPage() {
  const session = await requireAuth()
  const user = await getCurrentUser()

  // Only allow admins
  if (session.user.userType !== UserType.ADMIN) {
    redirect('/dashboard')
  }

  // Fetch system-wide statistics
  const [
    totalUsers,
    totalBusinesses,
    totalInquiries,
    totalEvaluations,
    recentUsers,
    recentBusinesses,
    systemActivity,
  ] = await Promise.all([
    // Total counts
    prisma.user.count(),
    prisma.business.count(),
    prisma.inquiry.count(),
    prisma.evaluation.count(),

    // Recent users (last 30 days)
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        userType: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),

    // Recent businesses (pending review)
    prisma.business.findMany({
      where: {
        status: {
          in: ['UNDER_REVIEW', 'DRAFT'],
        },
      },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        images_rel: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),

    // System activity (recent actions)
    prisma.$queryRaw<
      Array<{
        date: string
        new_users: number
        new_businesses: number
        new_inquiries: number
      }>
    >`
      SELECT 
        DATE("createdAt") as date,
        COUNT(CASE WHEN table_name = 'users' THEN 1 END)::int as new_users,
        COUNT(CASE WHEN table_name = 'businesses' THEN 1 END)::int as new_businesses,
        COUNT(CASE WHEN table_name = 'inquiries' THEN 1 END)::int as new_inquiries
      FROM (
        SELECT "createdAt", 'users' as table_name FROM users WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        UNION ALL
        SELECT "createdAt", 'businesses' as table_name FROM businesses WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        UNION ALL
        SELECT "createdAt", 'inquiries' as table_name FROM inquiries WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      ) combined
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 30
    `,
  ])

  // Calculate user type distribution
  const userTypeStats = await prisma.user.groupBy({
    by: ['userType'],
    _count: {
      userType: true,
    },
  })

  // Calculate business status distribution
  const businessStatusStats = await prisma.business.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  })

  // Calculate revenue metrics (mock for now)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  const currentPeriodUsers = await prisma.user.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  })

  const previousPeriodUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: sixtyDaysAgo,
        lt: thirtyDaysAgo,
      },
    },
  })

  const currentPeriodBusinesses = await prisma.business.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  })

  const previousPeriodBusinesses = await prisma.business.count({
    where: {
      createdAt: {
        gte: sixtyDaysAgo,
        lt: thirtyDaysAgo,
      },
    },
  })

  const analytics = {
    totals: {
      users: totalUsers,
      businesses: totalBusinesses,
      inquiries: totalInquiries,
      evaluations: totalEvaluations,
    },
    growth: {
      users:
        previousPeriodUsers === 0
          ? currentPeriodUsers > 0
            ? 100
            : 0
          : ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) *
            100,
      businesses:
        previousPeriodBusinesses === 0
          ? currentPeriodBusinesses > 0
            ? 100
            : 0
          : ((currentPeriodBusinesses - previousPeriodBusinesses) /
              previousPeriodBusinesses) *
            100,
    },
    distributions: {
      userTypes: userTypeStats.map((stat: any) => ({
        type: stat.userType,
        count: stat._count.userType,
      })),
      businessStatuses: businessStatusStats.map((stat: any) => ({
        status: stat.status,
        count: stat._count.status,
      })),
    },
    activity: systemActivity.map((item: any) => ({
      date: item.date,
      newUsers: Number(item.new_users),
      newBusinesses: Number(item.new_businesses),
      newInquiries: Number(item.new_inquiries),
    })),
  }

  return (
    <AdminDashboardClient
      user={user}
      recentUsers={recentUsers as any}
      recentBusinesses={recentBusinesses as any}
      analytics={analytics}
    />
  )
}
