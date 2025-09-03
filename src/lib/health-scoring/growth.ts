import { GROWTH_WEIGHTS } from './constants'
import {
  clamp,
  normalizeToScore,
  getGrowthBenchmarks,
  getBusinessAge,
  safeNumber,
} from './utils'
import type {
  BusinessFinancialData,
  BusinessOperationalData,
  ScoreBreakdown,
  GrowthHealthComponents,
} from './types'

/**
 * Calculate revenue growth score based on historical growth patterns
 */
function calculateRevenueGrowthScore(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []
  const benchmarks = getGrowthBenchmarks(operationalData.established)

  let totalWeight = 0
  let weightedScore = 0

  // Year-over-year growth rate (70% weight)
  if (financialData.yearlyGrowth !== undefined) {
    const growthRate = financialData.yearlyGrowth
    components.yearlyGrowth = normalizeToScore(growthRate, benchmarks)
    totalWeight += 0.7
    weightedScore += components.yearlyGrowth * 0.7

    const growthPercent = (growthRate * 100).toFixed(1)
    factors.push(`Annual growth rate: ${growthPercent}%`)

    // Add growth trend assessment
    if (growthRate > benchmarks.excellent) {
      factors.push('Exceptional growth performance')
    } else if (growthRate > benchmarks.good) {
      factors.push('Strong growth trajectory')
    } else if (growthRate > benchmarks.average) {
      factors.push('Moderate growth performance')
    } else if (growthRate > benchmarks.poor) {
      factors.push('Modest growth achieved')
    } else {
      factors.push('Growth challenges present')
    }
  }

  // Revenue consistency analysis (30% weight)
  if (financialData.monthlyRevenue && financialData.revenue) {
    const annualizedMonthly = financialData.monthlyRevenue * 12
    const consistency =
      1 -
      Math.abs(annualizedMonthly - financialData.revenue) /
        financialData.revenue
    const consistencyThresholds = {
      poor: 0.5,
      average: 0.7,
      good: 0.85,
      excellent: 0.95,
    }
    components.revenueConsistency = normalizeToScore(
      consistency,
      consistencyThresholds
    )
    totalWeight += 0.3
    weightedScore += components.revenueConsistency * 0.3

    factors.push(`Revenue consistency: ${(consistency * 100).toFixed(1)}%`)
  }

  const score = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  return { score, components, factors }
}

/**
 * Calculate market expansion potential score
 */
function calculateMarketExpansionScore(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []

  let totalWeight = 0
  let weightedScore = 0

  // Business category market potential (40% weight)
  const category = operationalData.category || 'OTHER'
  const categoryGrowthPotential = getCategoryGrowthPotential(category)
  components.categoryPotential = categoryGrowthPotential.score
  totalWeight += 0.4
  weightedScore += categoryGrowthPotential.score * 0.4
  factors.push(...categoryGrowthPotential.factors)

  // Customer base growth potential (35% weight)
  if (
    operationalData.customerBase !== undefined &&
    operationalData.customerBase !== null
  ) {
    const businessAge = getBusinessAge(operationalData.established)
    const expectedCustomerBase = getExpectedCustomerBase(category, businessAge)

    let customerScore = 50 // Default average score
    if (operationalData.customerBase >= expectedCustomerBase.excellent) {
      customerScore = 90
    } else if (operationalData.customerBase >= expectedCustomerBase.good) {
      customerScore = 75
    } else if (operationalData.customerBase >= expectedCustomerBase.average) {
      customerScore = 60
    } else if (operationalData.customerBase >= expectedCustomerBase.poor) {
      customerScore = 35
    } else {
      customerScore = 15
    }

    components.customerBase = customerScore
    totalWeight += 0.35
    weightedScore += customerScore * 0.35

    factors.push(
      `Customer base: ${operationalData.customerBase.toLocaleString()}`
    )
  }

  // Competition assessment (25% weight)
  const competitionScore = assessCompetitionLevel(operationalData.competition)
  components.competitionLevel = competitionScore.score
  totalWeight += 0.25
  weightedScore += competitionScore.score * 0.25
  factors.push(...competitionScore.factors)

  const score = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  return { score, components, factors }
}

/**
 * Calculate scalability score based on operational factors
 */
function calculateScalabilityScore(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []

  let totalWeight = 0
  let weightedScore = 0

  // Employee scalability (40% weight)
  if (operationalData.employees !== undefined && financialData.revenue) {
    const revenuePerEmployee = financialData.revenue / operationalData.employees
    const scalabilityThresholds = getScalabilityThresholds(
      operationalData.category || 'OTHER'
    )

    components.employeeScalability = normalizeToScore(
      revenuePerEmployee / 1000,
      scalabilityThresholds.revenuePerEmployee
    )
    totalWeight += 0.4
    weightedScore += components.employeeScalability * 0.4

    factors.push(
      `Employee scalability: $${Math.round(revenuePerEmployee / 1000)}K per employee`
    )
  }

  // Operational flexibility (35% weight)
  const operationalScore = assessOperationalFlexibility(operationalData)
  components.operationalFlexibility = operationalScore.score
  totalWeight += 0.35
  weightedScore += operationalScore.score * 0.35
  factors.push(...operationalScore.factors)

  // Asset efficiency for scaling (25% weight)
  if (financialData.totalAssets && financialData.revenue) {
    const assetEfficiency = financialData.revenue / financialData.totalAssets
    const assetThresholds = {
      poor: 0.3,
      average: 0.8,
      good: 1.5,
      excellent: 2.5,
    }
    components.assetEfficiency = normalizeToScore(
      assetEfficiency,
      assetThresholds
    )
    totalWeight += 0.25
    weightedScore += components.assetEfficiency * 0.25

    factors.push(`Asset efficiency: ${assetEfficiency.toFixed(2)}x`)
  }

  const score = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  return { score, components, factors }
}

/**
 * Get category-specific growth potential
 */
function getCategoryGrowthPotential(category: string): {
  score: number
  factors: string[]
} {
  const categoryPotentials: Record<string, { score: number; trend: string }> = {
    TECHNOLOGY: { score: 85, trend: 'High growth potential in tech sector' },
    ECOMMERCE: { score: 80, trend: 'Strong digital commerce growth' },
    HEALTHCARE: { score: 75, trend: 'Growing healthcare demand' },
    SERVICES: { score: 70, trend: 'Stable services market growth' },
    EDUCATION: { score: 65, trend: 'Moderate education sector expansion' },
    ENTERTAINMENT: { score: 60, trend: 'Entertainment market opportunities' },
    RETAIL: { score: 55, trend: 'Retail sector transformation ongoing' },
    REAL_ESTATE: { score: 50, trend: 'Variable real estate market conditions' },
    MANUFACTURING: { score: 45, trend: 'Manufacturing sector challenges' },
    RESTAURANT: { score: 40, trend: 'Competitive restaurant market' },
    AUTOMOTIVE: { score: 35, trend: 'Automotive industry disruption' },
    OTHER: { score: 50, trend: 'Market conditions vary by specific industry' },
  }

  const potential = categoryPotentials[category] || categoryPotentials.OTHER
  return {
    score: potential.score,
    factors: [potential.trend],
  }
}

/**
 * Get expected customer base benchmarks by category and age
 */
function getExpectedCustomerBase(category: string, businessAge: number) {
  const baseThresholds = {
    RESTAURANT: { poor: 100, average: 300, good: 800, excellent: 2000 },
    RETAIL: { poor: 200, average: 500, good: 1200, excellent: 3000 },
    ECOMMERCE: { poor: 500, average: 2000, good: 8000, excellent: 25000 },
    TECHNOLOGY: { poor: 50, average: 200, good: 800, excellent: 3000 },
    SERVICES: { poor: 75, average: 200, good: 500, excellent: 1500 },
    OTHER: { poor: 100, average: 300, good: 750, excellent: 2000 },
  }

  const thresholds =
    baseThresholds[category as keyof typeof baseThresholds] ||
    baseThresholds.OTHER

  // Adjust thresholds based on business age
  const ageMultiplier = Math.min(businessAge / 5, 2) // Cap at 2x for mature businesses

  return {
    poor: Math.round(thresholds.poor * ageMultiplier),
    average: Math.round(thresholds.average * ageMultiplier),
    good: Math.round(thresholds.good * ageMultiplier),
    excellent: Math.round(thresholds.excellent * ageMultiplier),
  }
}

/**
 * Assess competition level from description
 */
function assessCompetitionLevel(competition?: string): {
  score: number
  factors: string[]
} {
  if (!competition) {
    return { score: 50, factors: ['Competition level not specified'] }
  }

  const competitionLower = competition.toLowerCase()

  // High competition indicators (lower score)
  const highCompetitionKeywords = [
    'saturated',
    'intense',
    'fierce',
    'many competitors',
    'crowded',
    'difficult',
  ]
  const moderateCompetitionKeywords = [
    'moderate',
    'some',
    'few competitors',
    'competitive',
  ]
  const lowCompetitionKeywords = [
    'limited',
    'little',
    'minimal',
    'niche',
    'unique',
    'first',
  ]

  let score = 50
  let competitionLevel = 'moderate'

  if (
    highCompetitionKeywords.some(keyword => competitionLower.includes(keyword))
  ) {
    score = 25
    competitionLevel = 'high'
  } else if (
    lowCompetitionKeywords.some(keyword => competitionLower.includes(keyword))
  ) {
    score = 80
    competitionLevel = 'low'
  } else if (
    moderateCompetitionKeywords.some(keyword =>
      competitionLower.includes(keyword)
    )
  ) {
    score = 55
    competitionLevel = 'moderate'
  }

  return {
    score,
    factors: [`Competition level assessed as ${competitionLevel}`],
  }
}

/**
 * Get scalability thresholds by category
 */
function getScalabilityThresholds(category: string) {
  return {
    revenuePerEmployee: {
      TECHNOLOGY: { poor: 100, average: 200, good: 350, excellent: 500 },
      ECOMMERCE: { poor: 150, average: 250, good: 400, excellent: 600 },
      SERVICES: { poor: 60, average: 100, good: 150, excellent: 250 },
      RETAIL: { poor: 80, average: 120, good: 160, excellent: 220 },
      OTHER: { poor: 60, average: 120, good: 200, excellent: 300 },
    }[category] || { poor: 60, average: 120, good: 200, excellent: 300 },
  }
}

/**
 * Assess operational flexibility for scaling
 */
function assessOperationalFlexibility(
  operationalData: BusinessOperationalData
): { score: number; factors: string[] } {
  let score = 50
  const factors: string[] = []

  // Hours of operation flexibility
  if (operationalData.hoursOfOperation) {
    if (
      operationalData.hoursOfOperation.includes('24') ||
      operationalData.hoursOfOperation.includes('flexible')
    ) {
      score += 15
      factors.push('Flexible operating hours advantage')
    } else if (
      operationalData.hoursOfOperation.includes('limited') ||
      operationalData.hoursOfOperation.includes('restricted')
    ) {
      score -= 10
      factors.push('Limited hours may constrain growth')
    }
  }

  // Days open flexibility
  if (operationalData.daysOpen && Array.isArray(operationalData.daysOpen)) {
    if (operationalData.daysOpen.length >= 6) {
      score += 10
      factors.push('Operates most days of the week')
    } else if (operationalData.daysOpen.length <= 4) {
      score -= 5
      factors.push('Limited operating days may affect scalability')
    }
  }

  // Seasonality impact
  if (operationalData.seasonality) {
    const seasonalityLower = operationalData.seasonality.toLowerCase()
    if (
      seasonalityLower.includes('year-round') ||
      seasonalityLower.includes('not seasonal')
    ) {
      score += 10
      factors.push('Year-round operations support consistent growth')
    } else if (
      seasonalityLower.includes('highly seasonal') ||
      seasonalityLower.includes('seasonal')
    ) {
      score -= 15
      factors.push('Seasonal nature may limit steady growth')
    }
  }

  return { score: clamp(score), factors }
}

/**
 * Calculate overall growth health score
 */
export function calculateGrowthHealth(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): ScoreBreakdown {
  // Calculate component scores
  const revenueGrowth = calculateRevenueGrowthScore(
    financialData,
    operationalData
  )
  const marketExpansion = calculateMarketExpansionScore(
    financialData,
    operationalData
  )
  const scalability = calculateScalabilityScore(financialData, operationalData)

  // Calculate weighted overall growth score
  const components: GrowthHealthComponents = {
    revenueGrowth: revenueGrowth.score,
    marketExpansion: marketExpansion.score,
    scalability: scalability.score,
  }

  let totalWeight = 0
  let weightedScore = 0

  // Apply weights for available components
  if (revenueGrowth.score > 0) {
    totalWeight += GROWTH_WEIGHTS.revenueGrowth
    weightedScore += revenueGrowth.score * GROWTH_WEIGHTS.revenueGrowth
  }
  if (marketExpansion.score > 0) {
    totalWeight += GROWTH_WEIGHTS.marketExpansion
    weightedScore += marketExpansion.score * GROWTH_WEIGHTS.marketExpansion
  }
  if (scalability.score > 0) {
    totalWeight += GROWTH_WEIGHTS.scalability
    weightedScore += scalability.score * GROWTH_WEIGHTS.scalability
  }

  const overallScore = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  // Combine all factors and components
  const allFactors = [
    ...revenueGrowth.factors,
    ...marketExpansion.factors,
    ...scalability.factors,
  ]

  const allComponents = {
    ...revenueGrowth.components,
    ...marketExpansion.components,
    ...scalability.components,
  }

  // Generate recommendations based on lowest scoring areas
  const recommendations: string[] = []
  if (revenueGrowth.score < 50) {
    recommendations.push(
      'Focus on accelerating revenue growth through market expansion or product development'
    )
  }
  if (marketExpansion.score < 50) {
    recommendations.push(
      'Explore new market opportunities and reduce competitive pressures'
    )
  }
  if (scalability.score < 50) {
    recommendations.push(
      'Improve operational scalability and asset efficiency for growth'
    )
  }

  return {
    score: overallScore,
    components: allComponents,
    factors: allFactors,
    recommendations,
  }
}
