import { requireAuth, getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { UserType } from '@prisma/client'
import { redirect } from 'next/navigation'
import BuyerDashboardClient from './buyer-client'

export default async function BuyerDashboardPage() {
  const session = await requireAuth()
  const user = await getCurrentUser()

  // Only allow buyers and admins
  if (
    session.user.userType !== UserType.BUYER &&
    session.user.userType !== UserType.ADMIN
  ) {
    redirect('/dashboard')
  }

  // Fetch user's saved businesses (favorites)
  const favorites = await prisma.favorite.findMany({
    where: { userId: user?.id || '' },
    include: {
      business: {
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true,
              company: true,
            },
          },
          images_rel: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              views: true,
              inquiries: true,
              favorites: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Fetch user's inquiries
  const inquiries = await prisma.inquiry.findMany({
    where: { userId: user?.id || '' },
    include: {
      business: {
        select: {
          id: true,
          title: true,
          slug: true,
          askingPrice: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Fetch user's saved searches
  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: user?.id || '' },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // Fetch recently viewed businesses
  const recentViews = await prisma.businessView.findMany({
    where: {
      userId: user?.id || '',
    },
    include: {
      business: {
        include: {
          images_rel: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              views: true,
              inquiries: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
    distinct: ['businessId'], // Only get unique businesses
  })

  // Calculate user activity metrics
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const recentFavorites = await prisma.favorite.count({
    where: {
      userId: user?.id || '',
      createdAt: { gte: thirtyDaysAgo },
    },
  })

  const recentInquiries = await prisma.inquiry.count({
    where: {
      userId: user?.id || '',
      createdAt: { gte: thirtyDaysAgo },
    },
  })

  const recentViewsCount = await prisma.businessView.count({
    where: {
      userId: user?.id || '',
      createdAt: { gte: thirtyDaysAgo },
    },
  })

  // Get category preferences based on favorites and views
  const categoryStats = await prisma.$queryRaw<
    Array<{ category: string; count: number }>
  >`
    SELECT 
      COALESCE(b.category::text, 'OTHER') as category,
      COUNT(*)::int as count
    FROM favorites f
    JOIN businesses b ON f."businessId" = b.id
    WHERE f."userId" = ${user?.id || ''}
    GROUP BY b.category
    ORDER BY count DESC
    LIMIT 5
  `

  // Get price range preferences
  const priceRangeStats = await prisma.favorite.findMany({
    where: { userId: user?.id || '' },
    include: {
      business: {
        select: {
          askingPrice: true,
        },
      },
    },
  })

  const validPrices = priceRangeStats
    .map((f: any) => f.business.askingPrice)
    .filter((price: any): price is number => price !== null)
    .map((price: any) => Number(price))

  const averagePreferredPrice =
    validPrices.length > 0
      ? validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length
      : 0

  const minPreferredPrice =
    validPrices.length > 0 ? Math.min(...validPrices) : 0
  const maxPreferredPrice =
    validPrices.length > 0 ? Math.max(...validPrices) : 0

  const analytics = {
    totalFavorites: favorites.length,
    totalInquiries: inquiries.length,
    totalSavedSearches: savedSearches.length,
    recentActivity: {
      favorites: recentFavorites,
      inquiries: recentInquiries,
      views: recentViewsCount,
    },
    preferences: {
      categories: categoryStats.map((stat: any) => ({
        category: stat.category,
        count: Number(stat.count),
      })),
      priceRange: {
        average: averagePreferredPrice,
        min: minPreferredPrice,
        max: maxPreferredPrice,
      },
    },
  }

  return (
    <BuyerDashboardClient
      user={user}
      favorites={favorites as any}
      inquiries={inquiries as any}
      savedSearches={savedSearches as any}
      recentViews={recentViews as any}
      analytics={analytics}
    />
  )
}
