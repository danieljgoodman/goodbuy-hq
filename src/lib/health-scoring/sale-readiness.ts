import { SALE_READINESS_WEIGHTS, VALUATION_MULTIPLES } from './constants'
import {
  clamp,
  normalizeToScore,
  calculateDataCompleteness,
  safeNumber,
} from './utils'
import type {
  BusinessFinancialData,
  BusinessOperationalData,
  ScoreBreakdown,
  SaleReadinessComponents,
} from './types'

/**
 * Calculate valuation reasonableness score
 */
function calculateValuationReasonablenessScore(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []

  if (!financialData.askingPrice || !financialData.revenue) {
    return {
      score: 30,
      components: {},
      factors: [
        'Valuation analysis limited due to missing asking price or revenue data',
      ],
    }
  }

  const category = operationalData.category || 'OTHER'
  const multiples =
    VALUATION_MULTIPLES[category as keyof typeof VALUATION_MULTIPLES] ||
    VALUATION_MULTIPLES.OTHER

  let totalWeight = 0
  let weightedScore = 0

  // Revenue multiple analysis (50% weight)
  const revenueMultiple = financialData.askingPrice / financialData.revenue
  const revenueMultipleScore = calculateMultipleScore(
    revenueMultiple,
    multiples.revenue,
    'revenue'
  )
  components.revenueMultiple = revenueMultipleScore.score
  totalWeight += 0.5
  weightedScore += revenueMultipleScore.score * 0.5
  factors.push(...revenueMultipleScore.factors)

  // EBITDA multiple analysis (30% weight if available)
  if (financialData.ebitda && financialData.ebitda > 0) {
    const ebitdaMultiple = financialData.askingPrice / financialData.ebitda
    const ebitdaMultipleScore = calculateMultipleScore(
      ebitdaMultiple,
      multiples.ebitda,
      'EBITDA'
    )
    components.ebitdaMultiple = ebitdaMultipleScore.score
    totalWeight += 0.3
    weightedScore += ebitdaMultipleScore.score * 0.3
    factors.push(...ebitdaMultipleScore.factors)
  }

  // SDE multiple analysis (20% weight if profit available)
  if (financialData.profit && financialData.profit > 0) {
    const sdeMultiple = financialData.askingPrice / financialData.profit
    const sdeMultipleScore = calculateMultipleScore(
      sdeMultiple,
      multiples.sde,
      'SDE/Profit'
    )
    components.sdeMultiple = sdeMultipleScore.score
    totalWeight += 0.2
    weightedScore += sdeMultipleScore.score * 0.2
    factors.push(...sdeMultipleScore.factors)
  }

  const score =
    totalWeight > 0
      ? clamp(weightedScore / totalWeight)
      : components.revenueMultiple || 30

  // Overall valuation assessment
  if (score >= 80) {
    factors.push('Asking price appears reasonable for market conditions')
  } else if (score >= 60) {
    factors.push('Asking price is moderately aligned with market valuations')
  } else if (score >= 40) {
    factors.push('Asking price may be above typical market multiples')
  } else {
    factors.push('Asking price appears significantly above market valuations')
  }

  return { score, components, factors }
}

/**
 * Calculate market attractiveness score
 */
function calculateMarketAttractivenessScore(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []

  let totalWeight = 0
  let weightedScore = 0

  // Business category attractiveness (40% weight)
  const categoryScore = getCategoryMarketAttractiveness(
    operationalData.category || 'OTHER'
  )
  components.categoryAttractiveness = categoryScore.score
  totalWeight += 0.4
  weightedScore += categoryScore.score * 0.4
  factors.push(...categoryScore.factors)

  // Business presentation quality (35% weight)
  const presentationScore = assessBusinessPresentation(
    operationalData.description
  )
  components.presentationQuality = presentationScore.score
  totalWeight += 0.35
  weightedScore += presentationScore.score * 0.35
  factors.push(...presentationScore.factors)

  // Financial transparency (25% weight)
  const transparencyScore = assessFinancialTransparency(financialData)
  components.financialTransparency = transparencyScore.score
  totalWeight += 0.25
  weightedScore += transparencyScore.score * 0.25
  factors.push(...transparencyScore.factors)

  const score = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  return { score, components, factors }
}

/**
 * Calculate documentation quality score
 */
function calculateDocumentationQualityScore(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []

  // Financial data completeness (50% weight)
  const financialCompleteness = calculateDataCompleteness(
    { ...financialData, ...operationalData },
    'financial'
  )
  components.financialCompleteness = financialCompleteness * 100
  factors.push(
    `Financial data completeness: ${(financialCompleteness * 100).toFixed(1)}%`
  )

  // Operational data completeness (30% weight)
  const operationalCompleteness = calculateDataCompleteness(
    { ...financialData, ...operationalData },
    'operational'
  )
  components.operationalCompleteness = operationalCompleteness * 100
  factors.push(
    `Operational data completeness: ${(operationalCompleteness * 100).toFixed(1)}%`
  )

  // Business description quality (20% weight)
  const descriptionScore = assessDescriptionQuality(operationalData.description)
  components.descriptionQuality = descriptionScore.score
  factors.push(...descriptionScore.factors)

  // Calculate weighted score
  const overallCompleteness =
    (financialCompleteness * 0.5 +
      operationalCompleteness * 0.3 +
      (descriptionScore.score / 100) * 0.2) *
    100

  const score = clamp(overallCompleteness)

  // Overall documentation assessment
  if (score >= 80) {
    factors.push('Comprehensive documentation enhances buyer confidence')
  } else if (score >= 60) {
    factors.push('Good documentation with room for improvement')
  } else if (score >= 40) {
    factors.push('Documentation needs enhancement for buyer appeal')
  } else {
    factors.push('Significant documentation gaps may deter buyers')
  }

  return { score, components, factors }
}

/**
 * Helper functions
 */
function calculateMultipleScore(
  actualMultiple: number,
  benchmarkMultiple: number,
  type: string
): { score: number; factors: string[] } {
  const ratio = actualMultiple / benchmarkMultiple
  let score: number

  if (ratio <= 0.8) {
    score = 95 // Significantly below market (very attractive)
  } else if (ratio <= 1.0) {
    score = 85 // At or below market (attractive)
  } else if (ratio <= 1.2) {
    score = 70 // Slightly above market (acceptable)
  } else if (ratio <= 1.5) {
    score = 50 // Moderately above market (concerning)
  } else if (ratio <= 2.0) {
    score = 30 // Significantly above market (overpriced)
  } else {
    score = 10 // Extremely overpriced
  }

  const factors = [
    `${type} multiple: ${actualMultiple.toFixed(1)}x (market benchmark: ${benchmarkMultiple.toFixed(1)}x)`,
  ]

  return { score, factors }
}

function getCategoryMarketAttractiveness(category: string): {
  score: number
  factors: string[]
} {
  const attractiveness: Record<string, { score: number; reason: string }> = {
    TECHNOLOGY: {
      score: 85,
      reason: 'Technology businesses are highly sought after by buyers',
    },
    HEALTHCARE: {
      score: 80,
      reason: 'Healthcare sector shows strong buyer interest',
    },
    ECOMMERCE: {
      score: 75,
      reason: 'E-commerce businesses attract digital-savvy buyers',
    },
    SERVICES: {
      score: 70,
      reason: 'Service businesses offer scalability appeal',
    },
    EDUCATION: {
      score: 65,
      reason: 'Education sector has stable market demand',
    },
    REAL_ESTATE: {
      score: 60,
      reason: 'Real estate businesses have tangible asset appeal',
    },
    MANUFACTURING: {
      score: 55,
      reason: 'Manufacturing requires specialized buyers',
    },
    RETAIL: {
      score: 50,
      reason: 'Retail market faces digital transformation challenges',
    },
    ENTERTAINMENT: {
      score: 45,
      reason: 'Entertainment businesses have variable market appeal',
    },
    RESTAURANT: {
      score: 40,
      reason: 'Restaurant businesses face high competition and complexity',
    },
    AUTOMOTIVE: {
      score: 35,
      reason: 'Automotive sector faces industry disruption',
    },
    OTHER: {
      score: 50,
      reason: 'Market attractiveness varies by specific business type',
    },
  }

  const categoryData = attractiveness[category] || attractiveness.OTHER
  return {
    score: categoryData.score,
    factors: [categoryData.reason],
  }
}

function assessBusinessPresentation(description?: string): {
  score: number
  factors: string[]
} {
  if (!description) {
    return {
      score: 20,
      factors: ['Business description missing - reduces buyer appeal'],
    }
  }

  let score = 40 // Base score for having a description
  const factors: string[] = []

  // Length assessment
  if (description.length >= 500) {
    score += 20
    factors.push('Comprehensive business description')
  } else if (description.length >= 200) {
    score += 10
    factors.push('Adequate business description')
  } else {
    score -= 10
    factors.push('Brief description may need expansion')
  }

  // Quality indicators
  const qualityKeywords = [
    'award-winning',
    'recognized',
    'certified',
    'licensed',
    'accredited',
  ]
  if (
    qualityKeywords.some(keyword => description.toLowerCase().includes(keyword))
  ) {
    score += 15
    factors.push('Quality credentials enhance presentation')
  }

  // Professional presentation
  const professionalKeywords = [
    'established',
    'proven',
    'successful',
    'profitable',
    'growing',
  ]
  if (
    professionalKeywords.some(keyword =>
      description.toLowerCase().includes(keyword)
    )
  ) {
    score += 10
    factors.push('Professional presentation appeals to buyers')
  }

  return { score: clamp(score), factors }
}

function assessFinancialTransparency(financialData: BusinessFinancialData): {
  score: number
  factors: string[]
} {
  let score = 30 // Base score
  const factors: string[] = []

  // Count available financial metrics
  const availableMetrics = [
    financialData.revenue,
    financialData.profit,
    financialData.cashFlow,
    financialData.ebitda,
    financialData.grossMargin,
    financialData.netMargin,
    financialData.totalAssets,
    financialData.liabilities,
  ].filter(metric => metric !== undefined && metric !== null).length

  const totalMetrics = 8
  const completeness = availableMetrics / totalMetrics

  score += completeness * 60 // Up to 60 points for completeness

  if (completeness >= 0.8) {
    factors.push('Excellent financial transparency builds buyer confidence')
  } else if (completeness >= 0.6) {
    factors.push('Good financial disclosure supports due diligence')
  } else if (completeness >= 0.4) {
    factors.push('Moderate financial disclosure, additional details would help')
  } else {
    factors.push('Limited financial disclosure may concern potential buyers')
  }

  // Bonus for key metrics
  if (financialData.revenue && financialData.profit && financialData.cashFlow) {
    score += 10
    factors.push(
      'Core financial metrics (revenue, profit, cash flow) all disclosed'
    )
  }

  return { score: clamp(score), factors }
}

function assessDescriptionQuality(description?: string): {
  score: number
  factors: string[]
} {
  if (!description) {
    return { score: 20, factors: ['Business description missing'] }
  }

  let score = 40
  const factors: string[] = []

  // Length scoring
  if (description.length >= 800) {
    score += 25
    factors.push('Detailed business description')
  } else if (description.length >= 400) {
    score += 15
    factors.push('Good business description length')
  } else if (description.length >= 150) {
    score += 5
    factors.push('Basic business description provided')
  } else {
    score -= 10
    factors.push('Description too brief for buyer evaluation')
  }

  // Quality content indicators
  const sentences = description.split(/[.!?]+/).length
  if (sentences >= 5) {
    score += 15
    factors.push('Well-structured description with multiple key points')
  }

  // Professional language indicators
  const professionalIndicators = [
    'established',
    'proven track record',
    'strong customer base',
    'competitive advantage',
  ]
  if (
    professionalIndicators.some(indicator =>
      description.toLowerCase().includes(indicator)
    )
  ) {
    score += 10
    factors.push('Professional language enhances presentation')
  }

  return { score: clamp(score), factors }
}

/**
 * Calculate overall sale readiness score
 */
export function calculateSaleReadinessHealth(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): ScoreBreakdown {
  // Calculate component scores
  const valuationReasonableness = calculateValuationReasonablenessScore(
    financialData,
    operationalData
  )
  const marketAttractiveness = calculateMarketAttractivenessScore(
    financialData,
    operationalData
  )
  const documentationQuality = calculateDocumentationQualityScore(
    financialData,
    operationalData
  )

  // Calculate weighted overall sale readiness score
  const components: SaleReadinessComponents = {
    valuationReasonableness: valuationReasonableness.score,
    marketAttractiveness: marketAttractiveness.score,
    documentationQuality: documentationQuality.score,
  }

  let totalWeight = 0
  let weightedScore = 0

  // Apply weights for all components (all should be available)
  totalWeight += SALE_READINESS_WEIGHTS.valuationReasonableness
  weightedScore +=
    valuationReasonableness.score *
    SALE_READINESS_WEIGHTS.valuationReasonableness

  totalWeight += SALE_READINESS_WEIGHTS.marketAttractiveness
  weightedScore +=
    marketAttractiveness.score * SALE_READINESS_WEIGHTS.marketAttractiveness

  totalWeight += SALE_READINESS_WEIGHTS.documentationQuality
  weightedScore +=
    documentationQuality.score * SALE_READINESS_WEIGHTS.documentationQuality

  const overallScore = clamp(weightedScore / totalWeight)

  // Combine all factors and components
  const allFactors = [
    ...valuationReasonableness.factors,
    ...marketAttractiveness.factors,
    ...documentationQuality.factors,
  ]

  const allComponents = {
    ...valuationReasonableness.components,
    ...marketAttractiveness.components,
    ...documentationQuality.components,
  }

  // Generate recommendations based on lowest scoring areas
  const recommendations: string[] = []
  if (valuationReasonableness.score < 50) {
    recommendations.push(
      'Consider adjusting asking price to align with market valuations'
    )
  }
  if (marketAttractiveness.score < 50) {
    recommendations.push(
      'Enhance business presentation and competitive positioning'
    )
  }
  if (documentationQuality.score < 50) {
    recommendations.push(
      'Improve business documentation and financial disclosure'
    )
  }

  return {
    score: overallScore,
    components: allComponents,
    factors: allFactors,
    recommendations,
  }
}
