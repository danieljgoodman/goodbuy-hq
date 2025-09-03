import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const businessIdSchema = z.object({
  businessId: z.string().cuid('Invalid business ID format'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    // Validate business ID parameter
    const { businessId } = businessIdSchema.parse(params)

    // Get authenticated session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify business exists and user has access
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check authorization - user must own the business
    if (business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch latest health metrics for the business
    const healthMetric = await prisma.healthMetric.findFirst({
      where: { businessId },
      orderBy: { calculatedAt: 'desc' },
      select: {
        id: true,
        overallScore: true,
        growthScore: true,
        operationalScore: true,
        financialScore: true,
        saleReadinessScore: true,
        confidenceLevel: true,
        trajectory: true,
        calculatedAt: true,
        dataSources: true,
        calculationMetadata: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!healthMetric) {
      return NextResponse.json(
        { error: 'No health metrics found for this business' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: healthMetric,
    })
  } catch (error) {
    console.error('Health metrics API error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    // Handle database errors
    if (error instanceof Error && error.message.includes('prisma')) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
