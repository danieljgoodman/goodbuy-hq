import { NextRequest, NextResponse } from 'next/server'
import { businessAnalysisAgent } from '@/lib/business-analysis-agent'
import type { BusinessData } from '@/types/business'

export async function POST(request: NextRequest) {
  try {
    const businessData: BusinessData = await request.json()

    if (!businessData.businessName || !businessData.industry) {
      return NextResponse.json(
        { error: 'Business name and industry are required' },
        { status: 400 }
      )
    }

    const analysis =
      await businessAnalysisAgent.analyzeBusinessComprehensively(businessData)

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Business analysis API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to analyze business',
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
