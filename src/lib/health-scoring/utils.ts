import { ALGORITHM_CONSTANTS, INDUSTRY_BENCHMARKS } from './constants'
import type { BusinessFinancialData, BusinessOperationalData } from './types'

/**
 * Safely convert a value to a number, returning undefined if invalid
 */
export function safeNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined
  const num = typeof value === 'string' ? parseFloat(value) : Number(value)
  return isNaN(num) ? undefined : num
}

/**
 * Clamp a value between min and max bounds
 */
export function clamp(
  value: number,
  min: number = 0,
  max: number = 100
): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculate weighted average of scores
 */
export function weightedAverage(
  scores: Record<string, number>,
  weights: Record<string, number>
): number {
  let totalWeightedScore = 0
  let totalWeight = 0

  for (const [key, score] of Object.entries(scores)) {
    const weight = weights[key] || 0
    if (weight > 0 && !isNaN(score)) {
      totalWeightedScore += score * weight
      totalWeight += weight
    }
  }

  return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
}

/**
 * Normalize a value to 0-100 scale based on thresholds
 */
export function normalizeToScore(
  value: number,
  thresholds: { poor: number; average: number; good: number; excellent: number }
): number {
  if (value <= thresholds.poor) return 0
  if (value <= thresholds.average)
    return (
      25 +
      ((value - thresholds.poor) / (thresholds.average - thresholds.poor)) * 25
    )
  if (value <= thresholds.good)
    return (
      50 +
      ((value - thresholds.average) / (thresholds.good - thresholds.average)) *
        25
    )
  if (value <= thresholds.excellent)
    return (
      75 +
      ((value - thresholds.good) / (thresholds.excellent - thresholds.good)) *
        25
    )
  return 100
}

/**
 * Get business maturity category based on establishment date
 */
export function getBusinessMaturity(
  established?: Date
): 'NEW' | 'GROWING' | 'MATURE' | 'ESTABLISHED' {
  if (!established) return 'NEW'

  const years =
    (Date.now() - established.getTime()) / (365.25 * 24 * 60 * 60 * 1000)

  if (years <= ALGORITHM_CONSTANTS.MATURITY_THRESHOLDS.NEW) return 'NEW'
  if (years <= ALGORITHM_CONSTANTS.MATURITY_THRESHOLDS.GROWING) return 'GROWING'
  if (years <= ALGORITHM_CONSTANTS.MATURITY_THRESHOLDS.MATURE) return 'MATURE'
  return 'ESTABLISHED'
}

/**
 * Get industry benchmarks for a business category
 */
export function getIndustryBenchmarks(category: string = 'OTHER') {
  const normalizedCategory =
    category.toUpperCase() as keyof typeof INDUSTRY_BENCHMARKS.GROSS_MARGIN

  return {
    grossMargin:
      INDUSTRY_BENCHMARKS.GROSS_MARGIN[normalizedCategory] ||
      INDUSTRY_BENCHMARKS.GROSS_MARGIN.OTHER,
    employeeEfficiency:
      INDUSTRY_BENCHMARKS.EMPLOYEE_EFFICIENCY[normalizedCategory] ||
      INDUSTRY_BENCHMARKS.EMPLOYEE_EFFICIENCY.OTHER,
  }
}

/**
 * Get revenue growth benchmarks based on business maturity
 */
export function getGrowthBenchmarks(established?: Date) {
  const maturity = getBusinessMaturity(established)

  switch (maturity) {
    case 'NEW':
      return INDUSTRY_BENCHMARKS.REVENUE_GROWTH.NEW_BUSINESS
    case 'GROWING':
      return INDUSTRY_BENCHMARKS.REVENUE_GROWTH.GROWING_BUSINESS
    case 'MATURE':
      return INDUSTRY_BENCHMARKS.REVENUE_GROWTH.MATURE_BUSINESS
    case 'ESTABLISHED':
    default:
      return INDUSTRY_BENCHMARKS.REVENUE_GROWTH.ESTABLISHED_BUSINESS
  }
}

/**
 * Detect statistical outliers in financial data
 */
export function detectOutliers(
  financialData: BusinessFinancialData,
  category: string = 'OTHER',
  employees?: number
): string[] {
  const outliers: string[] = []
  const benchmarks = getIndustryBenchmarks(category)

  // Check revenue outliers (too high compared to industry average)
  if (financialData.revenue) {
    const avgRevenue =
      benchmarks.employeeEfficiency.average * (employees || 1) * 1000
    if (
      financialData.revenue >
      avgRevenue * ALGORITHM_CONSTANTS.REVENUE_OUTLIER_MULTIPLIER
    ) {
      outliers.push('revenue_unusually_high')
    }
  }

  // Check profit margin outliers
  if (financialData.revenue && financialData.profit) {
    const profitMargin = financialData.profit / financialData.revenue
    if (profitMargin > ALGORITHM_CONSTANTS.PROFIT_MARGIN_MAX) {
      outliers.push('profit_margin_unusually_high')
    }
    if (profitMargin < -0.5) {
      // More than 50% loss margin
      outliers.push('profit_margin_unusually_low')
    }
  }

  // Check growth rate outliers
  if (
    financialData.yearlyGrowth &&
    Math.abs(financialData.yearlyGrowth) > ALGORITHM_CONSTANTS.GROWTH_RATE_MAX
  ) {
    outliers.push('growth_rate_extreme')
  }

  return outliers
}

/**
 * Validate data consistency across financial metrics
 */
export function validateDataConsistency(
  financialData: BusinessFinancialData
): string[] {
  const inconsistencies: string[] = []

  // Profit should not exceed revenue
  if (
    financialData.revenue &&
    financialData.profit &&
    financialData.profit > financialData.revenue
  ) {
    inconsistencies.push('profit_exceeds_revenue')
  }

  // EBITDA should be >= profit (assuming minimal taxes/interest)
  if (
    financialData.ebitda &&
    financialData.profit &&
    financialData.ebitda < financialData.profit
  ) {
    inconsistencies.push('ebitda_less_than_profit')
  }

  // Monthly revenue * 12 should approximate yearly revenue
  if (financialData.monthlyRevenue && financialData.revenue) {
    const annualizedMonthly = financialData.monthlyRevenue * 12
    const variance =
      Math.abs(annualizedMonthly - financialData.revenue) /
      financialData.revenue
    if (variance > 0.25) {
      // More than 25% variance
      inconsistencies.push('monthly_annual_revenue_mismatch')
    }
  }

  // Cash flow should be reasonable relative to profit
  if (financialData.cashFlow && financialData.profit) {
    const variance =
      Math.abs(financialData.cashFlow - financialData.profit) /
      Math.abs(financialData.profit)
    if (variance > 2.0) {
      // Cash flow more than 200% different from profit
      inconsistencies.push('cash_flow_profit_significant_variance')
    }
  }

  // Total assets should be positive
  if (financialData.totalAssets && financialData.totalAssets <= 0) {
    inconsistencies.push('negative_total_assets')
  }

  return inconsistencies
}

/**
 * Calculate data completeness percentage for a specific scoring dimension
 */
export function calculateDataCompleteness(
  data: BusinessFinancialData & BusinessOperationalData,
  dimension: 'financial' | 'growth' | 'operational' | 'saleReadiness'
): number {
  let totalFields = 0
  let completedFields = 0

  const fieldSets = {
    financial: [
      'revenue',
      'profit',
      'cashFlow',
      'ebitda',
      'grossMargin',
      'netMargin',
      'totalAssets',
      'liabilities',
    ],
    growth: [
      'revenue',
      'yearlyGrowth',
      'monthlyRevenue',
      'customerBase',
      'category',
    ],
    operational: [
      'established',
      'employees',
      'hoursOfOperation',
      'daysOpen',
      'seasonality',
      'competition',
    ],
    saleReadiness: [
      'askingPrice',
      'revenue',
      'profit',
      'description',
      'category',
    ],
  }

  const fields = fieldSets[dimension]

  for (const field of fields) {
    totalFields++
    const value = data[field as keyof typeof data]
    if (
      value !== null &&
      value !== undefined &&
      value !== '' &&
      (Array.isArray(value) ? value.length > 0 : true)
    ) {
      completedFields++
    }
  }

  return totalFields > 0 ? completedFields / totalFields : 0
}

/**
 * Calculate business age in years
 */
export function getBusinessAge(established?: Date): number {
  if (!established) return 0
  return (Date.now() - established.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
}

/**
 * Calculate revenue per employee metric
 */
export function calculateRevenuePerEmployee(
  revenue?: number,
  employees?: number
): number | undefined {
  if (!revenue || !employees || employees === 0) return undefined
  return revenue / employees
}

/**
 * Calculate basic financial ratios
 */
export function calculateFinancialRatios(data: BusinessFinancialData) {
  return {
    profitMargin:
      data.revenue && data.revenue > 0
        ? (data.profit || 0) / data.revenue
        : undefined,
    grossMarginRatio: data.grossMargin ? data.grossMargin / 100 : undefined, // Convert percentage to decimal
    netMarginRatio: data.netMargin ? data.netMargin / 100 : undefined,
    ebitdaMargin:
      data.revenue && data.revenue > 0 && data.ebitda
        ? data.ebitda / data.revenue
        : undefined,
    assetTurnover:
      data.revenue && data.totalAssets && data.totalAssets > 0
        ? data.revenue / data.totalAssets
        : undefined,
    debtRatio:
      data.totalAssets && data.totalAssets > 0 && data.liabilities
        ? data.liabilities / data.totalAssets
        : undefined,
  }
}
