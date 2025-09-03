import { DATA_QUALITY_THRESHOLDS, ALGORITHM_CONSTANTS } from './constants'
import {
  calculateDataCompleteness,
  detectOutliers,
  validateDataConsistency,
  clamp,
} from './utils'
import type {
  BusinessFinancialData,
  BusinessOperationalData,
  DataQualityAssessment,
  HealthCalculationResult,
} from './types'

/**
 * Calculate comprehensive confidence score for health metrics
 */
export function calculateConfidenceScore(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData,
  healthScores: {
    financial: number
    growth: number
    operational: number
    saleReadiness: number
  }
): {
  overall: number
  dataCompleteness: number
  dataQuality: number
  factors: string[]
} {
  const factors: string[] = []

  // 1. Data completeness assessment (40% weight)
  const completenessScore = assessDataCompleteness(
    financialData,
    operationalData,
    factors
  )

  // 2. Data quality assessment (35% weight)
  const qualityScore = assessDataQuality(
    financialData,
    operationalData,
    factors
  )

  // 3. Score consistency assessment (25% weight)
  const consistencyScore = assessScoreConsistency(healthScores, factors)

  // Calculate weighted overall confidence
  const overallConfidence = clamp(
    completenessScore * 0.4 + qualityScore * 0.35 + consistencyScore * 0.25
  )

  // Add overall confidence interpretation
  if (overallConfidence >= 90) {
    factors.push('Very high confidence - comprehensive and reliable data')
  } else if (overallConfidence >= 75) {
    factors.push('High confidence - good data quality with minor gaps')
  } else if (overallConfidence >= 50) {
    factors.push('Medium confidence - adequate data with some limitations')
  } else {
    factors.push('Low confidence - significant data gaps affect reliability')
  }

  return {
    overall: overallConfidence,
    dataCompleteness: completenessScore,
    dataQuality: qualityScore,
    factors,
  }
}

/**
 * Assess data completeness across all scoring dimensions
 */
function assessDataCompleteness(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData,
  factors: string[]
): number {
  const combinedData = { ...financialData, ...operationalData }

  // Calculate completeness for each dimension
  const financialCompleteness = calculateDataCompleteness(
    combinedData,
    'financial'
  )
  const growthCompleteness = calculateDataCompleteness(combinedData, 'growth')
  const operationalCompleteness = calculateDataCompleteness(
    combinedData,
    'operational'
  )
  const saleReadinessCompleteness = calculateDataCompleteness(
    combinedData,
    'saleReadiness'
  )

  // Check critical field availability
  const criticalFieldsAvailable = assessCriticalFields(
    financialData,
    operationalData,
    factors
  )

  // Calculate weighted completeness (critical fields get bonus)
  const averageCompleteness =
    (financialCompleteness +
      growthCompleteness +
      operationalCompleteness +
      saleReadinessCompleteness) /
    4

  const completenessScore =
    (averageCompleteness * 0.7 + criticalFieldsAvailable * 0.3) * 100

  // Add completeness insights
  factors.push(`Data completeness: ${(averageCompleteness * 100).toFixed(1)}%`)

  if (averageCompleteness >= 0.8) {
    factors.push('Comprehensive data supports reliable scoring')
  } else if (averageCompleteness >= 0.6) {
    factors.push('Good data coverage with some optional fields missing')
  } else if (averageCompleteness >= 0.4) {
    factors.push('Moderate data coverage affects scoring precision')
  } else {
    factors.push('Limited data availability impacts score reliability')
  }

  return clamp(completenessScore)
}

/**
 * Assess data quality including consistency and reasonableness
 */
function assessDataQuality(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData,
  factors: string[]
): number {
  let qualityScore = 85 // Start with high quality assumption

  // Check for data inconsistencies
  const inconsistencies = validateDataConsistency(financialData)
  if (inconsistencies.length > 0) {
    // Extremely aggressive penalty for inconsistent data
    const qualityPenalty = Math.min(inconsistencies.length * 40, 80)
    qualityScore -= qualityPenalty
    factors.push(`Data consistency issues detected: ${inconsistencies.length}`)

    // Add specific inconsistency details
    inconsistencies.slice(0, 2).forEach(issue => {
      const readableIssue = issue
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
      factors.push(`• ${readableIssue}`)
    })

    // Additional penalty for serious inconsistencies
    if (
      inconsistencies.some(
        issue => issue.includes('profit') || issue.includes('margin')
      )
    ) {
      qualityScore -= 30
      factors.push('• Critical financial inconsistencies detected')
    }

    // Extra penalty for multiple severe inconsistencies
    if (inconsistencies.length >= 3) {
      qualityScore -= 15
      factors.push('• Multiple severe data inconsistencies found')
    }
  } else {
    factors.push('Data consistency validated successfully')
  }

  // Check for statistical outliers
  const outliers = detectOutliers(
    financialData,
    operationalData.category,
    operationalData.employees || undefined
  )
  if (outliers.length > 0) {
    const outlierPenalty = Math.min(outliers.length * 10, 25)
    qualityScore -= outlierPenalty
    factors.push(`Statistical outliers detected: ${outliers.length}`)
  }

  // Assess data recency and business age alignment
  const businessAgeScore = assessBusinessAgeAlignment(operationalData, factors)
  qualityScore = (qualityScore + businessAgeScore) / 2

  return clamp(qualityScore)
}

/**
 * Assess critical field availability
 */
function assessCriticalFields(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData,
  factors: string[]
): number {
  const criticalFieldsChecks = [
    {
      fields: DATA_QUALITY_THRESHOLDS.CRITICAL_FINANCIAL_FIELDS,
      data: financialData,
      name: 'financial',
    },
    {
      fields: DATA_QUALITY_THRESHOLDS.CRITICAL_GROWTH_FIELDS,
      data: { ...financialData, ...operationalData },
      name: 'growth',
    },
    {
      fields: DATA_QUALITY_THRESHOLDS.CRITICAL_OPERATIONAL_FIELDS,
      data: operationalData,
      name: 'operational',
    },
    {
      fields: DATA_QUALITY_THRESHOLDS.CRITICAL_SALE_FIELDS,
      data: { ...financialData, ...operationalData },
      name: 'sale readiness',
    },
  ]

  let totalCriticalScore = 0
  let availableDimensions = 0

  criticalFieldsChecks.forEach(check => {
    const availableFields = check.fields.filter(field => {
      const value = check.data[field as keyof typeof check.data]
      return value !== undefined && value !== null && value !== ''
    })

    if (check.fields.length > 0) {
      const dimensionScore = availableFields.length / check.fields.length
      totalCriticalScore += dimensionScore
      availableDimensions++

      if (dimensionScore < 0.5) {
        factors.push(`Critical ${check.name} data gaps may affect accuracy`)
      }
    }
  })

  return availableDimensions > 0 ? totalCriticalScore / availableDimensions : 0
}

/**
 * Assess business age and data alignment
 */
function assessBusinessAgeAlignment(
  operationalData: BusinessOperationalData,
  factors: string[]
): number {
  if (!operationalData.established) {
    factors.push('Business establishment date missing')
    return 60 // Moderate penalty for missing date
  }

  const businessAge =
    (Date.now() - operationalData.established.getTime()) /
    (365.25 * 24 * 60 * 60 * 1000)

  if (businessAge < 0) {
    factors.push('Business establishment date appears to be in the future')
    return 20 // Major penalty for impossible date
  } else if (businessAge > 100) {
    factors.push('Business establishment date appears unusually old')
    return 30 // Penalty for likely incorrect date
  } else if (businessAge < 0.25) {
    factors.push('Very new business - limited historical data expected')
    return 75 // Minor penalty for very new business
  } else {
    factors.push('Business age aligns with expected data availability')
    return 90 // Good alignment
  }
}

/**
 * Assess consistency between different health scores
 */
function assessScoreConsistency(
  healthScores: {
    financial: number
    growth: number
    operational: number
    saleReadiness: number
  },
  factors: string[]
): number {
  const scores = Object.values(healthScores).filter(score => score > 0)

  if (scores.length === 0) {
    factors.push('No health scores available for consistency check')
    return 50
  }

  if (scores.length === 1) {
    factors.push('Limited scores available for consistency assessment')
    return 70
  }

  // Calculate variance in scores
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const variance =
    scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
    scores.length
  const standardDeviation = Math.sqrt(variance)

  // Score consistency based on standard deviation
  let consistencyScore: number
  if (standardDeviation <= 10) {
    consistencyScore = 95
    factors.push('Health scores show high consistency across dimensions')
  } else if (standardDeviation <= 20) {
    consistencyScore = 85
    factors.push('Health scores show good consistency across dimensions')
  } else if (standardDeviation <= 30) {
    consistencyScore = 70
    factors.push('Health scores show moderate variation across dimensions')
  } else {
    consistencyScore = 50
    factors.push(
      'Health scores show significant variation - review individual dimensions'
    )
  }

  return consistencyScore
}

/**
 * Generate confidence-based data quality recommendations
 */
export function generateDataQualityRecommendations(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData,
  confidenceScore: number
): string[] {
  const recommendations: string[] = []

  if (confidenceScore < 50) {
    recommendations.push(
      'Consider providing additional financial and operational data to improve score reliability'
    )
  }

  // Check for missing critical financial data
  const criticalFinancialMissing =
    DATA_QUALITY_THRESHOLDS.CRITICAL_FINANCIAL_FIELDS.filter(field => {
      const value = financialData[field as keyof BusinessFinancialData]
      return value === undefined || value === null
    })

  if (criticalFinancialMissing.length > 0) {
    recommendations.push(
      `Provide missing critical financial data: ${criticalFinancialMissing.join(', ')}`
    )
  }

  // Check for missing critical operational data
  const criticalOperationalMissing =
    DATA_QUALITY_THRESHOLDS.CRITICAL_OPERATIONAL_FIELDS.filter(field => {
      const value = operationalData[field as keyof BusinessOperationalData]
      return value === undefined || value === null || value === ''
    })

  if (criticalOperationalMissing.length > 0) {
    recommendations.push(
      `Provide missing operational information: ${criticalOperationalMissing.join(', ')}`
    )
  }

  // Check for data inconsistencies
  const inconsistencies = validateDataConsistency(financialData)
  if (inconsistencies.length > 0) {
    recommendations.push(
      'Review and correct financial data inconsistencies to improve accuracy'
    )
  }

  // Business description recommendations
  if (
    !operationalData.description ||
    operationalData.description.length < 100
  ) {
    recommendations.push(
      'Provide a detailed business description to enhance sale readiness scoring'
    )
  }

  return recommendations
}
