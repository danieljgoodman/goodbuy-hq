import { OPERATIONAL_WEIGHTS } from './constants'
import { clamp, normalizeToScore, getBusinessAge, safeNumber } from './utils'
import type {
  BusinessFinancialData,
  BusinessOperationalData,
  ScoreBreakdown,
  OperationalHealthComponents,
} from './types'

/**
 * Calculate business maturity score based on establishment date and operational stability
 */
function calculateBusinessMaturityScore(
  operationalData: BusinessOperationalData
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []

  let totalWeight = 0
  let weightedScore = 0

  // Years in operation (60% weight)
  const businessAge = getBusinessAge(operationalData.established)
  if (businessAge > 0) {
    // Maturity scoring: gradual increase with diminishing returns
    let maturityScore: number
    if (businessAge < 1) {
      maturityScore = 20
    } else if (businessAge < 3) {
      maturityScore = 40 + (businessAge - 1) * 15 // 40-70 for years 1-3
    } else if (businessAge < 10) {
      maturityScore = 70 + (businessAge - 3) * 3 // 70-91 for years 3-10
    } else {
      maturityScore = 95 // Cap at 95 for businesses 10+ years
    }

    components.yearsInOperation = clamp(maturityScore)
    totalWeight += 0.6
    weightedScore += maturityScore * 0.6

    factors.push(`${businessAge.toFixed(1)} years in operation`)
  }

  // Employee stability indicator (40% weight)
  if (operationalData.employees !== undefined) {
    const employeeCount = operationalData.employees
    let stabilityScore: number

    if (employeeCount === 0) {
      stabilityScore = 20 // Solo business
    } else if (employeeCount <= 5) {
      stabilityScore = 40 + employeeCount * 8 // 40-80 for 1-5 employees
    } else if (employeeCount <= 20) {
      stabilityScore = 80 + (employeeCount - 5) * 1 // 80-95 for 5-20 employees
    } else {
      stabilityScore = 95 // Large stable operations
    }

    components.employeeStability = clamp(stabilityScore)
    totalWeight += 0.4
    weightedScore += stabilityScore * 0.4

    factors.push(
      `${employeeCount} employees indicate ${getStabilityDescription(employeeCount)}`
    )
  }

  const score = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  return { score, components, factors }
}

/**
 * Calculate operational efficiency score
 */
function calculateOperationalEfficiencyScore(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []

  let totalWeight = 0
  let weightedScore = 0

  // Operating hours optimization (40% weight)
  const hoursScore = assessOperatingHours(
    operationalData.hoursOfOperation,
    operationalData.daysOpen
  )
  components.operatingHours = hoursScore.score
  totalWeight += 0.4
  weightedScore += hoursScore.score * 0.4
  factors.push(...hoursScore.factors)

  // Seasonal management (35% weight)
  const seasonalScore = assessSeasonalManagement(
    operationalData.seasonality,
    financialData.revenue
  )
  components.seasonalManagement = seasonalScore.score
  totalWeight += 0.35
  weightedScore += seasonalScore.score * 0.35
  factors.push(...seasonalScore.factors)

  // Customer base efficiency (25% weight)
  if (operationalData.customerBase && financialData.revenue) {
    const revenuePerCustomer =
      financialData.revenue / operationalData.customerBase
    const customerEfficiencyThresholds = getCustomerEfficiencyThresholds(
      operationalData.category || 'OTHER'
    )

    components.customerEfficiency = normalizeToScore(
      revenuePerCustomer,
      customerEfficiencyThresholds
    )
    totalWeight += 0.25
    weightedScore += components.customerEfficiency * 0.25

    factors.push(
      `Revenue per customer: $${Math.round(revenuePerCustomer).toLocaleString()}`
    )
  }

  const score = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  return { score, components, factors }
}

/**
 * Calculate market positioning score
 */
function calculateMarketPositioningScore(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []

  let totalWeight = 0
  let weightedScore = 0

  // Competition analysis (50% weight)
  const competitionScore = assessDetailedCompetition(
    operationalData.competition
  )
  components.competitivePosition = competitionScore.score
  totalWeight += 0.5
  weightedScore += competitionScore.score * 0.5
  factors.push(...competitionScore.factors)

  // Business differentiation (30% weight)
  const differentiationScore = assessBusinessDifferentiation(
    operationalData.description,
    operationalData.category
  )
  components.differentiation = differentiationScore.score
  totalWeight += 0.3
  weightedScore += differentiationScore.score * 0.3
  factors.push(...differentiationScore.factors)

  // Market presence (20% weight)
  const marketScore = assessMarketPresence(
    operationalData.customerBase,
    operationalData.established
  )
  components.marketPresence = marketScore.score
  totalWeight += 0.2
  weightedScore += marketScore.score * 0.2
  factors.push(...marketScore.factors)

  const score = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  return { score, components, factors }
}

/**
 * Helper functions
 */
function getStabilityDescription(employeeCount: number): string {
  if (employeeCount === 0) return 'solo operation'
  if (employeeCount <= 2) return 'small team stability'
  if (employeeCount <= 10) return 'established team'
  if (employeeCount <= 50) return 'substantial organization'
  return 'large stable enterprise'
}

function assessOperatingHours(
  hours?: string,
  daysOpen?: string[]
): { score: number; factors: string[] } {
  let score = 50
  const factors: string[] = []

  if (!hours) {
    return { score: 40, factors: ['Operating hours not specified'] }
  }

  const hoursLower = hours.toLowerCase()

  // Flexible/extended hours boost
  if (hoursLower.includes('24') || hoursLower.includes('24/7')) {
    score = 90
    factors.push('24/7 operations maximize accessibility')
  } else if (
    hoursLower.includes('flexible') ||
    hoursLower.includes('variable')
  ) {
    score = 75
    factors.push('Flexible hours adapt to customer needs')
  } else if (hoursLower.includes('extended') || hoursLower.includes('long')) {
    score = 70
    factors.push('Extended hours improve customer access')
  } else if (hoursLower.includes('limited') || hoursLower.includes('short')) {
    score = 30
    factors.push('Limited hours may constrain customer access')
  }

  // Days open analysis
  if (daysOpen && Array.isArray(daysOpen)) {
    if (daysOpen.length === 7) {
      score += 10
      factors.push('Seven-day operations maximize availability')
    } else if (daysOpen.length >= 5) {
      score += 5
      factors.push('Good weekly availability')
    } else if (daysOpen.length <= 3) {
      score -= 10
      factors.push('Limited weekly availability')
    }
  }

  return { score: clamp(score), factors }
}

function assessSeasonalManagement(
  seasonality?: string,
  revenue?: number
): { score: number; factors: string[] } {
  if (!seasonality) {
    return { score: 50, factors: ['Seasonality impact not specified'] }
  }

  const seasonalityLower = seasonality.toLowerCase()

  if (
    seasonalityLower.includes('year-round') ||
    seasonalityLower.includes('not seasonal')
  ) {
    return {
      score: 85,
      factors: ['Year-round revenue provides operational stability'],
    }
  } else if (
    seasonalityLower.includes('minimal') ||
    seasonalityLower.includes('slight')
  ) {
    return {
      score: 70,
      factors: ['Minimal seasonal variation supports steady operations'],
    }
  } else if (seasonalityLower.includes('moderate')) {
    return {
      score: 55,
      factors: ['Moderate seasonality requires operational adaptation'],
    }
  } else if (
    seasonalityLower.includes('highly seasonal') ||
    seasonalityLower.includes('seasonal')
  ) {
    return {
      score: 30,
      factors: ['High seasonality creates operational management challenges'],
    }
  }

  return { score: 50, factors: ['Seasonal impact unclear from description'] }
}

function getCustomerEfficiencyThresholds(category: string) {
  const thresholds: Record<
    string,
    { poor: number; average: number; good: number; excellent: number }
  > = {
    RESTAURANT: { poor: 20, average: 50, good: 100, excellent: 200 },
    RETAIL: { poor: 50, average: 150, good: 400, excellent: 800 },
    ECOMMERCE: { poor: 30, average: 100, good: 300, excellent: 600 },
    TECHNOLOGY: { poor: 1000, average: 5000, good: 15000, excellent: 50000 },
    SERVICES: { poor: 200, average: 800, good: 2500, excellent: 8000 },
    HEALTHCARE: { poor: 500, average: 1500, good: 4000, excellent: 10000 },
    OTHER: { poor: 100, average: 400, good: 1200, excellent: 3500 },
  }

  return thresholds[category] || thresholds.OTHER
}

function assessDetailedCompetition(competition?: string): {
  score: number
  factors: string[]
} {
  if (!competition) {
    return { score: 50, factors: ['Competition analysis not available'] }
  }

  const competitionLower = competition.toLowerCase()
  const factors: string[] = []

  // Detailed competition assessment
  let competitiveAdvantagePoints = 0

  // Positive indicators
  if (
    competitionLower.includes('unique') ||
    competitionLower.includes('niche')
  ) {
    competitiveAdvantagePoints += 25
    factors.push('Unique positioning provides competitive advantage')
  }
  if (
    competitionLower.includes('established relationships') ||
    competitionLower.includes('loyal customers')
  ) {
    competitiveAdvantagePoints += 15
    factors.push('Strong customer relationships create competitive moat')
  }
  if (
    competitionLower.includes('proprietary') ||
    competitionLower.includes('exclusive')
  ) {
    competitiveAdvantagePoints += 20
    factors.push('Proprietary advantages strengthen market position')
  }

  // Negative indicators
  if (
    competitionLower.includes('saturated') ||
    competitionLower.includes('crowded')
  ) {
    competitiveAdvantagePoints -= 20
    factors.push('Saturated market increases competitive pressure')
  }
  if (
    competitionLower.includes('price competition') ||
    competitionLower.includes('race to bottom')
  ) {
    competitiveAdvantagePoints -= 15
    factors.push('Price competition pressures margins')
  }

  const score = clamp(50 + competitiveAdvantagePoints)
  return { score, factors }
}

function assessBusinessDifferentiation(
  description?: string,
  category?: string
): { score: number; factors: string[] } {
  if (!description) {
    return {
      score: 40,
      factors: [
        'Business description not available for differentiation analysis',
      ],
    }
  }

  const descriptionLower = description.toLowerCase()
  const factors: string[] = []
  let differentiationPoints = 0

  // Innovation indicators
  const innovationKeywords = [
    'innovative',
    'cutting-edge',
    'advanced',
    'pioneering',
    'revolutionary',
  ]
  if (innovationKeywords.some(keyword => descriptionLower.includes(keyword))) {
    differentiationPoints += 20
    factors.push('Innovation focus enhances market differentiation')
  }

  // Quality indicators
  const qualityKeywords = [
    'premium',
    'high-quality',
    'artisanal',
    'custom',
    'bespoke',
    'luxury',
  ]
  if (qualityKeywords.some(keyword => descriptionLower.includes(keyword))) {
    differentiationPoints += 15
    factors.push('Quality positioning supports premium pricing')
  }

  // Service excellence indicators
  const serviceKeywords = [
    'exceptional service',
    'customer-focused',
    'personalized',
    'dedicated',
  ]
  if (serviceKeywords.some(keyword => descriptionLower.includes(keyword))) {
    differentiationPoints += 12
    factors.push('Service excellence creates customer loyalty')
  }

  // Technology advantages
  const techKeywords = [
    'technology',
    'digital',
    'automated',
    'software',
    'AI',
    'data-driven',
  ]
  if (techKeywords.some(keyword => descriptionLower.includes(keyword))) {
    differentiationPoints += 10
    factors.push('Technology integration provides operational advantages')
  }

  // Location advantages
  const locationKeywords = [
    'prime location',
    'strategic location',
    'high-traffic',
    'downtown',
  ]
  if (locationKeywords.some(keyword => descriptionLower.includes(keyword))) {
    differentiationPoints += 8
    factors.push('Strategic location enhances market position')
  }

  const score = clamp(40 + differentiationPoints)
  return { score, factors }
}

function assessMarketPresence(
  customerBase?: number,
  established?: Date
): { score: number; factors: string[] } {
  let score = 50
  const factors: string[] = []

  // Customer base size assessment
  if (customerBase !== undefined) {
    if (customerBase >= 10000) {
      score = 90
      factors.push('Large customer base indicates strong market presence')
    } else if (customerBase >= 2000) {
      score = 75
      factors.push('Substantial customer base shows good market penetration')
    } else if (customerBase >= 500) {
      score = 60
      factors.push('Moderate customer base with growth opportunity')
    } else if (customerBase >= 100) {
      score = 40
      factors.push('Developing customer base needs expansion')
    } else {
      score = 25
      factors.push('Small customer base requires significant growth')
    }
  }

  // Adjust for business age
  const businessAge = getBusinessAge(established)
  if (businessAge > 5) {
    score += 10 // Bonus for established presence
    factors.push('Established business tenure enhances market credibility')
  } else if (businessAge < 1) {
    score -= 15 // Penalty for very new businesses
    factors.push('New business still building market presence')
  }

  return { score: clamp(score), factors }
}

/**
 * Calculate overall operational health score
 */
export function calculateOperationalHealth(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): ScoreBreakdown {
  // Calculate component scores
  const businessMaturity = calculateBusinessMaturityScore(operationalData)
  const operationalEfficiency = calculateOperationalEfficiencyScore(
    financialData,
    operationalData
  )
  const marketPositioning = calculateMarketPositioningScore(
    financialData,
    operationalData
  )

  // Calculate weighted overall operational score
  const components: OperationalHealthComponents = {
    businessMaturity: businessMaturity.score,
    operationalEfficiency: operationalEfficiency.score,
    marketPositioning: marketPositioning.score,
  }

  let totalWeight = 0
  let weightedScore = 0

  // Apply weights for available components
  if (businessMaturity.score > 0) {
    totalWeight += OPERATIONAL_WEIGHTS.businessMaturity
    weightedScore +=
      businessMaturity.score * OPERATIONAL_WEIGHTS.businessMaturity
  }
  if (operationalEfficiency.score > 0) {
    totalWeight += OPERATIONAL_WEIGHTS.operationalEfficiency
    weightedScore +=
      operationalEfficiency.score * OPERATIONAL_WEIGHTS.operationalEfficiency
  }
  if (marketPositioning.score > 0) {
    totalWeight += OPERATIONAL_WEIGHTS.marketPositioning
    weightedScore +=
      marketPositioning.score * OPERATIONAL_WEIGHTS.marketPositioning
  }

  const overallScore = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  // Combine all factors and components
  const allFactors = [
    ...businessMaturity.factors,
    ...operationalEfficiency.factors,
    ...marketPositioning.factors,
  ]

  const allComponents = {
    ...businessMaturity.components,
    ...operationalEfficiency.components,
    ...marketPositioning.components,
  }

  // Generate recommendations based on lowest scoring areas
  const recommendations: string[] = []
  if (businessMaturity.score < 50) {
    recommendations.push(
      'Build operational stability and business maturity over time'
    )
  }
  if (operationalEfficiency.score < 50) {
    recommendations.push(
      'Optimize operating hours, seasonal planning, and customer efficiency'
    )
  }
  if (marketPositioning.score < 50) {
    recommendations.push(
      'Strengthen competitive position and market differentiation'
    )
  }

  return {
    score: overallScore,
    components: allComponents,
    factors: allFactors,
    recommendations,
  }
}
