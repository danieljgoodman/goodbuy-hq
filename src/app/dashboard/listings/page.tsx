import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ListingDashboardClient from './listing-dashboard-client'

export default async function ListingDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/dashboard/listings')
  }

  if (
    session.user.userType !== 'BUSINESS_OWNER' &&
    session.user.userType !== 'ADMIN'
  ) {
    redirect('/dashboard?error=insufficient_permissions')
  }

  // Fetch user's business listings with related data
  const businesses = await prisma.business.findMany({
    where: {
      ownerId: session.user.id,
    },
    include: {
      images_rel: {
        where: { isPrimary: true },
        take: 1,
      },
      _count: {
        select: {
          favorites: true,
          inquiries: true,
          views: true,
        },
      },
      inquiries: {
        where: { isRead: false },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          subject: true,
          contactName: true,
          contactEmail: true,
          createdAt: true,
          isRead: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Convert Decimal fields to numbers for client component
  const businessesData = businesses.map(business => ({
    ...business,
    askingPrice: business.askingPrice ? Number(business.askingPrice) : null,
    revenue: business.revenue ? Number(business.revenue) : null,
    profit: business.profit ? Number(business.profit) : null,
    cashFlow: business.cashFlow ? Number(business.cashFlow) : null,
    ebitda: business.ebitda ? Number(business.ebitda) : null,
    grossMargin: business.grossMargin ? Number(business.grossMargin) : null,
    netMargin: business.netMargin ? Number(business.netMargin) : null,
    monthlyRevenue: business.monthlyRevenue
      ? Number(business.monthlyRevenue)
      : null,
    yearlyGrowth: business.yearlyGrowth ? Number(business.yearlyGrowth) : null,
    inventory: business.inventory ? Number(business.inventory) : null,
    equipment: business.equipment ? Number(business.equipment) : null,
    realEstate: business.realEstate ? Number(business.realEstate) : null,
    totalAssets: business.totalAssets ? Number(business.totalAssets) : null,
    liabilities: business.liabilities ? Number(business.liabilities) : null,
  }))

  return <ListingDashboardClient businesses={businessesData as any} />
}
