import { Business, HealthTrajectory, Prisma } from '@prisma/client'
import { calculateFinancialHealth } from './financial'
import { calculateGrowthHealth } from './growth'
import { calculateOperationalHealth } from './operational'
import { calculateSaleReadinessHealth } from './sale-readiness'
import {
  calculateConfidenceScore,
  generateDataQualityRecommendations,
} from './confidence'
import { SCORING_WEIGHTS, ALGORITHM_CONSTANTS } from './constants'
import { clamp, weightedAverage } from './utils'
import type {
  HealthCalculationResult,
  HealthScoringInput,
  BusinessFinancialData,
  BusinessOperationalData,
  HealthScores,
} from './types'
import { HealthScoringError } from './types'

/**
 * Main health scoring orchestrator - calculates comprehensive health scores for a business
 */
export async function calculateHealthScores(
  business: Business
): Promise<HealthCalculationResult> {
  try {
    // Transform business data into scoring input format
    const scoringInput = transformBusinessToScoringInput(business)

    // Calculate individual health dimension scores
    const financialHealth = calculateFinancialHealth(
      scoringInput.financialData,
      scoringInput.operationalData
    )
    const growthHealth = calculateGrowthHealth(
      scoringInput.financialData,
      scoringInput.operationalData
    )
    const operationalHealth = calculateOperationalHealth(
      scoringInput.financialData,
      scoringInput.operationalData
    )
    const saleReadinessHealth = calculateSaleReadinessHealth(
      scoringInput.financialData,
      scoringInput.operationalData
    )

    // Calculate weighted overall health score
    const individualScores = {
      financial: financialHealth.score,
      growth: growthHealth.score,
      operational: operationalHealth.score,
      saleReadiness: saleReadinessHealth.score,
    }

    const overallScore = weightedAverage(individualScores, SCORING_WEIGHTS)

    // Calculate confidence score
    const confidence = calculateConfidenceScore(
      scoringInput.financialData,
      scoringInput.operationalData,
      individualScores
    )

    // Determine health trajectory
    const trajectory = determineHealthTrajectory(
      scoringInput.financialData,
      scoringInput.operationalData,
      individualScores
    )

    // Compile comprehensive results
    const healthScores: HealthScores = {
      overall: clamp(overallScore),
      financial: clamp(financialHealth.score),
      growth: clamp(growthHealth.score),
      operational: clamp(operationalHealth.score),
      saleReadiness: clamp(saleReadinessHealth.score),
      confidence: clamp(confidence.overall),
      trajectory,
    }

    // Build detailed result structure
    const result: HealthCalculationResult = {
      scores: healthScores,
      breakdown: {
        financial: financialHealth,
        growth: growthHealth,
        operational: operationalHealth,
        saleReadiness: saleReadinessHealth,
      },
      confidence: {
        overall: confidence.overall,
        dataCompleteness: confidence.dataCompleteness,
        dataQuality: confidence.dataQuality,
        factors: confidence.factors,
      },
      metadata: {
        calculatedAt: new Date(),
        dataVersion: '1.0.0',
        algorithmVersion: ALGORITHM_CONSTANTS.VERSION,
      },
    }

    return result
  } catch (error) {
    if (error instanceof HealthScoringError) {
      throw error
    }

    throw new HealthScoringError(
      'Health calculation failed due to unexpected error',
      'CALCULATION_ERROR',
      { originalError: error }
    )
  }
}

/**
 * Transform Business model data into health scoring input format
 */
function transformBusinessToScoringInput(
  business: Business
): HealthScoringInput {
  // Extract financial data
  const financialData: BusinessFinancialData = {
    revenue: business.revenue ? Number(business.revenue) : undefined,
    profit: business.profit ? Number(business.profit) : undefined,
    cashFlow: business.cashFlow ? Number(business.cashFlow) : undefined,
    ebitda: business.ebitda ? Number(business.ebitda) : undefined,
    grossMargin: business.grossMargin
      ? Number(business.grossMargin)
      : undefined,
    netMargin: business.netMargin ? Number(business.netMargin) : undefined,
    monthlyRevenue: business.monthlyRevenue
      ? Number(business.monthlyRevenue)
      : undefined,
    yearlyGrowth: business.yearlyGrowth
      ? Number(business.yearlyGrowth)
      : undefined,
    askingPrice: business.askingPrice
      ? Number(business.askingPrice)
      : undefined,
    totalAssets: business.totalAssets
      ? Number(business.totalAssets)
      : undefined,
    liabilities: business.liabilities
      ? Number(business.liabilities)
      : undefined,
    inventory: business.inventory ? Number(business.inventory) : undefined,
    equipment: business.equipment ? Number(business.equipment) : undefined,
    realEstate: business.realEstate ? Number(business.realEstate) : undefined,
  }

  // Extract operational data
  const operationalData: BusinessOperationalData = {
    established: business.established || undefined,
    employees: business.employees || undefined,
    customerBase: business.customerBase || undefined,
    hoursOfOperation: business.hoursOfOperation || undefined,
    daysOpen: business.daysOpen || undefined,
    seasonality: business.seasonality || undefined,
    competition: business.competition || undefined,
    category: business.category || undefined,
    description: business.description,
  }

  return {
    business,
    financialData,
    operationalData,
  }
}

/**
 * Determine health trajectory based on available data
 */
function determineHealthTrajectory(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData,
  scores: {
    financial: number
    growth: number
    operational: number
    saleReadiness: number
  }
): HealthTrajectory {
  // Primary indicator: Growth rate
  if (financialData.yearlyGrowth !== undefined) {
    if (financialData.yearlyGrowth > 0.1) {
      // 10%+ growth
      return HealthTrajectory.IMPROVING
    } else if (financialData.yearlyGrowth < -0.05) {
      // 5%+ decline
      return HealthTrajectory.DECLINING
    }
  }

  // Secondary indicator: Overall score trends
  const averageScore =
    Object.values(scores).reduce((sum, score) => sum + score, 0) /
    Object.values(scores).length
  const scoreVariance =
    Object.values(scores).reduce(
      (variance, score) => variance + Math.pow(score - averageScore, 2),
      0
    ) / Object.values(scores).length

  // High variance suggests volatility
  if (scoreVariance > 400) {
    // High score variance (20+ point standard deviation)
    return HealthTrajectory.VOLATILE
  }

  // Score-based trajectory assessment
  if (averageScore >= 70 && scores.growth >= 60) {
    return HealthTrajectory.IMPROVING
  } else if (averageScore <= 40 || scores.growth <= 30) {
    return HealthTrajectory.DECLINING
  }

  // Default to stable if no clear trend indicators
  return HealthTrajectory.STABLE
}

/**
 * Generate summary insights for health scores
 */
export function generateHealthInsights(result: HealthCalculationResult): {
  summary: string
  keyStrengths: string[]
  keyWeaknesses: string[]
  recommendations: string[]
} {
  const scores = result.scores
  const breakdown = result.breakdown

  // Generate overall summary
  let summary: string
  if (scores.overall >= 80) {
    summary = `Excellent business health with a score of ${scores.overall}/100. This business demonstrates strong performance across multiple dimensions.`
  } else if (scores.overall >= 60) {
    summary = `Good business health with a score of ${scores.overall}/100. The business shows solid fundamentals with opportunities for improvement.`
  } else if (scores.overall >= 40) {
    summary = `Moderate business health with a score of ${scores.overall}/100. Several areas need attention to strengthen overall performance.`
  } else {
    summary = `Business health concerns with a score of ${scores.overall}/100. Significant improvements needed across multiple areas.`
  }

  // Identify key strengths (scores >= 70)
  const keyStrengths: string[] = []
  if (scores.financial >= 70)
    keyStrengths.push(`Strong financial performance (${scores.financial}/100)`)
  if (scores.growth >= 70)
    keyStrengths.push(`Excellent growth potential (${scores.growth}/100)`)
  if (scores.operational >= 70)
    keyStrengths.push(
      `Solid operational foundation (${scores.operational}/100)`
    )
  if (scores.saleReadiness >= 70)
    keyStrengths.push(`Well-prepared for sale (${scores.saleReadiness}/100)`)

  // Identify key weaknesses (scores < 50)
  const keyWeaknesses: string[] = []
  if (scores.financial < 50)
    keyWeaknesses.push(
      `Financial health needs improvement (${scores.financial}/100)`
    )
  if (scores.growth < 50)
    keyWeaknesses.push(`Growth potential limited (${scores.growth}/100)`)
  if (scores.operational < 50)
    keyWeaknesses.push(
      `Operational efficiency concerns (${scores.operational}/100)`
    )
  if (scores.saleReadiness < 50)
    keyWeaknesses.push(
      `Sale readiness requires attention (${scores.saleReadiness}/100)`
    )

  // Compile recommendations from all dimensions
  const recommendations: string[] = [
    ...(breakdown.financial.recommendations || []),
    ...(breakdown.growth.recommendations || []),
    ...(breakdown.operational.recommendations || []),
    ...(breakdown.saleReadiness.recommendations || []),
  ]

  // Add confidence-based recommendations
  const dataQualityRecs = generateDataQualityRecommendations(
    result.breakdown.financial.components as any, // Type assertion for extracted data
    result.breakdown.operational.components as any,
    result.confidence.overall
  )
  recommendations.push(...dataQualityRecs)

  return {
    summary,
    keyStrengths,
    keyWeaknesses,
    recommendations: recommendations.slice(0, 8), // Limit to top 8 recommendations
  }
}

/**
 * Prepare health data for database storage
 */
export function prepareHealthMetricData(
  businessId: string,
  result: HealthCalculationResult
): Prisma.HealthMetricCreateInput {
  return {
    business: { connect: { id: businessId } },
    overallScore: Math.round(result.scores.overall),
    growthScore: Math.round(result.scores.growth),
    operationalScore: Math.round(result.scores.operational),
    financialScore: Math.round(result.scores.financial),
    saleReadinessScore: Math.round(result.scores.saleReadiness),
    confidenceLevel: Math.round(result.scores.confidence),
    trajectory: result.scores.trajectory,
    calculatedAt: result.metadata.calculatedAt,
    dataSources: {
      manual: true,
      quickbooks: false,
      version: result.metadata.dataVersion,
    },
    calculationMetadata: {
      algorithmVersion: result.metadata.algorithmVersion,
      breakdown: JSON.parse(JSON.stringify(result.breakdown)),
      confidence: JSON.parse(JSON.stringify(result.confidence)),
    },
  }
}

// Export main calculation function and types
export * from './types'
export { calculateHealthScores as default }
