import { NextRequest, NextResponse } from 'next/server'
import { businessAnalysisAgent } from '@/lib/business-analysis-agent'
import type { BusinessData } from '@/types/business'

export async function POST(request: NextRequest) {
  try {
    const { businessData, insightType } = await request.json()

    if (!businessData?.businessName || !businessData?.industry) {
      return NextResponse.json(
        { error: 'Business name and industry are required' },
        { status: 400 }
      )
    }

    const validInsightTypes = [
      'financial-health',
      'market-position',
      'growth-potential',
      'risk-assessment',
      'recommendations',
      'competitive-analysis',
      'valuation-estimate',
    ]

    if (insightType && !validInsightTypes.includes(insightType)) {
      return NextResponse.json(
        { error: 'Invalid insight type', validTypes: validInsightTypes },
        { status: 400 }
      )
    }

    const fullAnalysis =
      await businessAnalysisAgent.analyzeBusinessComprehensively(businessData)

    let focusedInsight
    switch (insightType) {
      case 'financial-health':
        focusedInsight = {
          type: 'financial-health',
          data: fullAnalysis.financialHealth,
          summary: `Financial health score: ${fullAnalysis.financialHealth.score}/100`,
        }
        break

      case 'market-position':
        focusedInsight = {
          type: 'market-position',
          data: fullAnalysis.marketPosition,
          summary: `Market competitiveness: ${fullAnalysis.marketPosition.competitiveness}/100`,
        }
        break

      case 'growth-potential':
        focusedInsight = {
          type: 'growth-potential',
          data: fullAnalysis.growthPotential,
          summary: `Growth potential score: ${fullAnalysis.growthPotential.score}/100`,
        }
        break

      case 'risk-assessment':
        focusedInsight = {
          type: 'risk-assessment',
          data: fullAnalysis.riskAssessment,
          summary: `Risk level: ${fullAnalysis.riskAssessment.level.toUpperCase()}`,
        }
        break

      case 'recommendations':
        focusedInsight = {
          type: 'recommendations',
          data: fullAnalysis.recommendations,
          summary: `${fullAnalysis.recommendations.immediate.length} immediate actions recommended`,
        }
        break

      case 'competitive-analysis':
        focusedInsight = {
          type: 'competitive-analysis',
          data: {
            competitiveness: fullAnalysis.marketPosition.competitiveness,
            differentiators: fullAnalysis.marketPosition.differentiators,
            threats: fullAnalysis.marketPosition.threats,
            marketShare: fullAnalysis.marketPosition.marketShare,
          },
          summary: `Identified ${fullAnalysis.marketPosition.differentiators.length} key differentiators`,
        }
        break

      case 'valuation-estimate':
        const revenue = businessData.annualRevenue || 0
        const assets = businessData.assets || 0
        const liabilities = businessData.liabilities || 0
        const netWorth = assets - liabilities

        const revenueMultiple = getIndustryMultiple(businessData.industry)
        const estimatedValue = Math.max(
          revenue * revenueMultiple,
          netWorth * 0.8
        )

        focusedInsight = {
          type: 'valuation-estimate',
          data: {
            estimatedValue,
            method: 'Revenue Multiple + Asset Based',
            revenueMultiple,
            confidence:
              fullAnalysis.financialHealth.score > 70
                ? 'high'
                : fullAnalysis.financialHealth.score > 40
                  ? 'medium'
                  : 'low',
            factors: [
              `Financial health: ${fullAnalysis.financialHealth.score}/100`,
              `Growth potential: ${fullAnalysis.growthPotential.score}/100`,
              `Risk level: ${fullAnalysis.riskAssessment.level}`,
            ],
          },
          summary: `Estimated business value: $${estimatedValue.toLocaleString()}`,
        }
        break

      default:
        focusedInsight = {
          type: 'comprehensive',
          data: fullAnalysis,
          summary: fullAnalysis.summary,
        }
    }

    return NextResponse.json({
      success: true,
      insight: focusedInsight,
      businessName: businessData.businessName,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Business insights API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate business insights',
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}

function getIndustryMultiple(industry: string): number {
  const multiples: Record<string, number> = {
    technology: 4.5,
    software: 5.0,
    saas: 6.0,
    'e-commerce': 3.0,
    retail: 1.5,
    restaurant: 2.0,
    manufacturing: 2.5,
    healthcare: 3.5,
    consulting: 2.0,
    'real estate': 2.0,
    finance: 3.0,
    education: 2.5,
    media: 2.0,
    construction: 1.5,
  }

  const normalizedIndustry = industry.toLowerCase()

  for (const [key, multiple] of Object.entries(multiples)) {
    if (normalizedIndustry.includes(key)) {
      return multiple
    }
  }

  return 2.5 // Default multiple
}
