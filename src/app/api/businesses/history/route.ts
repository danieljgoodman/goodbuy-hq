import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get businesses the user has access to
    const businesses = await prisma.business.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        healthMetrics: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Format the response to match the expected structure
    const analyses = businesses
      .filter(business => business.healthMetrics.length > 0)
      .map(business => {
        const latestHealth = business.healthMetrics[0]

        return {
          id: business.id,
          businessName: business.title,
          type: 'health' as const,
          score: latestHealth?.overallScore,
          status: 'completed' as const,
          completedAt: latestHealth?.calculatedAt || business.updatedAt,
          exportUrl: `/api/businesses/${business.id}/health/export`,
        }
      })

    return NextResponse.json(analyses)
  } catch (error) {
    console.error('Business history API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business history' },
      { status: 500 }
    )
  }
}
