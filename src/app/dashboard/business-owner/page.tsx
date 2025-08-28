import { requireAuth, getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { UserType } from '@prisma/client'
import { redirect } from 'next/navigation'
import BusinessOwnerDashboardClient from './business-owner-client'

export default async function BusinessOwnerDashboardPage() {
  const session = await requireAuth()
  const user = await getCurrentUser()

  // Only allow business owners and admins
  if (
    session.user.userType !== UserType.BUSINESS_OWNER &&
    session.user.userType !== UserType.ADMIN
  ) {
    redirect('/dashboard')
  }

  // Fetch business listings with detailed analytics
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
        take: 5,
        select: {
          id: true,
          subject: true,
          contactName: true,
          contactEmail: true,
          createdAt: true,
          isRead: true,
        },
      },
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          overallScore: true,
          estimatedValue: true,
          status: true,
          createdAt: true,
        },
      },
      views: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        select: {
          createdAt: true,
          userId: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Calculate performance metrics
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  const currentPeriodViews = await prisma.businessView.count({
    where: {
      business: { ownerId: user?.id || '' },
      createdAt: { gte: thirtyDaysAgo },
    },
  })

  const previousPeriodViews = await prisma.businessView.count({
    where: {
      business: { ownerId: user?.id || '' },
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
    },
  })

  const currentPeriodInquiries = await prisma.inquiry.count({
    where: {
      business: { ownerId: user?.id || '' },
      createdAt: { gte: thirtyDaysAgo },
    },
  })

  const previousPeriodInquiries = await prisma.inquiry.count({
    where: {
      business: { ownerId: user?.id || '' },
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
    },
  })

  // Get daily views for the last 30 days
  const dailyViews = await prisma.$queryRaw<
    Array<{ date: string; views: number }>
  >`
    SELECT 
      DATE(bv."createdAt") as date,
      COUNT(*)::int as views
    FROM business_views bv
    JOIN businesses b ON bv."businessId" = b.id
    WHERE b."ownerId" = ${user?.id || ''}
    AND bv."createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE(bv."createdAt")
    ORDER BY date
  `

  const analytics = {
    currentPeriodViews,
    previousPeriodViews,
    currentPeriodInquiries,
    previousPeriodInquiries,
    dailyViews: dailyViews.map((item: any) => ({
      date: item.date,
      views: Number(item.views),
    })),
    viewsChange:
      previousPeriodViews === 0
        ? currentPeriodViews > 0
          ? 100
          : 0
        : ((currentPeriodViews - previousPeriodViews) / previousPeriodViews) *
          100,
    inquiriesChange:
      previousPeriodInquiries === 0
        ? currentPeriodInquiries > 0
          ? 100
          : 0
        : ((currentPeriodInquiries - previousPeriodInquiries) /
            previousPeriodInquiries) *
          100,
  }

  return (
    <BusinessOwnerDashboardClient
      user={user}
      businesses={businesses as any}
      analytics={analytics}
    />
  )
}
