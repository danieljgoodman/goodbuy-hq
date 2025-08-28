import { NextRequest, NextResponse } from 'next/server'
import { openaiService } from '@/lib/openai'

export async function GET(request: NextRequest) {
  try {
    const costSummary = openaiService.getCostSummary()

    return NextResponse.json({
      success: true,
      usage: {
        totalTokens: costSummary.totalTokens,
        estimatedCost: parseFloat(costSummary.estimatedCost.toFixed(4)),
        costPerToken:
          costSummary.totalTokens > 0
            ? parseFloat(
                (costSummary.estimatedCost / costSummary.totalTokens).toFixed(6)
              )
            : 0,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('AI usage API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to get AI usage stats',
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const resetSummary = { totalTokens: 0, estimatedCost: 0 }
    Object.assign(openaiService.getCostSummary(), resetSummary)

    return NextResponse.json({
      success: true,
      message: 'Usage stats reset successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('AI usage reset error:', error)

    return NextResponse.json(
      {
        error: 'Failed to reset usage stats',
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
