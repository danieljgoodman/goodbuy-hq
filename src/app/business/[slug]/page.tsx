import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import BusinessDetailClient from './business-detail-client'

interface BusinessDetailPageProps {
  params: {
    slug: string
  }
}

async function getBusiness(slug: string) {
  const business = await prisma.business.findFirst({
    where: {
      OR: [
        { slug: slug },
        { id: slug }
      ],
      status: 'ACTIVE'
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          userType: true,
          image: true,
          company: true,
          bio: true,
          createdAt: true
        }
      },
      images_rel: {
        orderBy: { orderIndex: 'asc' }
      },
      documents_rel: {
        where: {
          accessLevel: { not: 'owner_only' }
        }
      },
      evaluations: {
        where: {
          status: 'COMPLETED',
          isPublic: true
        },
        include: {
          evaluator: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          }
        },
        orderBy: { completedAt: 'desc' },
        take: 1
      },
      _count: {
        select: {
          favorites: true,
          inquiries: true,
          views: true
        }
      }
    }
  })

  if (!business) {
    return null
  }

  // Increment view count
  await prisma.businessView.create({
    data: {
      businessId: business.id,
      ipAddress: '127.0.0.1', // Would get from request in real app
      userAgent: 'Server-Side Render'
    }
  }).catch(() => {
    // Ignore errors for view tracking
  })

  return business
}

export async function generateMetadata({ params }: BusinessDetailPageProps): Promise<Metadata> {
  const business = await getBusiness(params.slug)

  if (!business) {
    return {
      title: 'Business Not Found'
    }
  }

  const primaryImage = business.images_rel[0]?.url || business.images[0]

  return {
    title: `${business.title} - Business for Sale | GoodBuy HQ`,
    description: business.description.substring(0, 160) + (business.description.length > 160 ? '...' : ''),
    keywords: [
      business.title,
      business.category,
      'business for sale',
      business.city,
      business.state,
      business.industry
    ].filter(Boolean),
    openGraph: {
      title: business.title,
      description: business.description,
      images: primaryImage ? [primaryImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: business.title,
      description: business.description,
      images: primaryImage ? [primaryImage] : [],
    }
  }
}

export default async function BusinessDetailPage({ params }: BusinessDetailPageProps) {
  const business = await getBusiness(params.slug)

  if (!business) {
    notFound()
  }

  // Convert Decimal fields to numbers for the client component
  const businessData = {
    ...business,
    askingPrice: business.askingPrice ? Number(business.askingPrice) : null,
    revenue: business.revenue ? Number(business.revenue) : null,
    profit: business.profit ? Number(business.profit) : null,
    cashFlow: business.cashFlow ? Number(business.cashFlow) : null,
    ebitda: business.ebitda ? Number(business.ebitda) : null,
    grossMargin: business.grossMargin ? Number(business.grossMargin) : null,
    netMargin: business.netMargin ? Number(business.netMargin) : null,
    monthlyRevenue: business.monthlyRevenue ? Number(business.monthlyRevenue) : null,
    yearlyGrowth: business.yearlyGrowth ? Number(business.yearlyGrowth) : null,
    inventory: business.inventory ? Number(business.inventory) : null,
    equipment: business.equipment ? Number(business.equipment) : null,
    realEstate: business.realEstate ? Number(business.realEstate) : null,
    totalAssets: business.totalAssets ? Number(business.totalAssets) : null,
    liabilities: business.liabilities ? Number(business.liabilities) : null,
  }

  return <BusinessDetailClient business={businessData} />
}