import { FINANCIAL_WEIGHTS, INDUSTRY_BENCHMARKS } from './constants'
import {
  clamp,
  normalizeToScore,
  getIndustryBenchmarks,
  calculateFinancialRatios,
  calculateRevenuePerEmployee,
  safeNumber,
} from './utils'
import type {
  BusinessFinancialData,
  BusinessOperationalData,
  ScoreBreakdown,
  FinancialHealthComponents,
} from './types'

/**
 * Calculate profitability score based on various profit margins
 */
function calculateProfitabilityScore(
  financialData: BusinessFinancialData,
  category: string = 'OTHER'
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []
  const benchmarks = getIndustryBenchmarks(category)

  // Calculate available profitability metrics
  const ratios = calculateFinancialRatios(financialData)
  let totalWeight = 0
  let weightedScore = 0

  // Gross margin analysis (40% weight)
  if (
    ratios.grossMarginRatio !== undefined ||
    (ratios.profitMargin !== undefined && financialData.revenue)
  ) {
    const grossMargin = ratios.grossMarginRatio || ratios.profitMargin || 0
    components.grossMargin = normalizeToScore(
      grossMargin,
      benchmarks.grossMargin
    )
    totalWeight += 0.4
    weightedScore += components.grossMargin * 0.4

    factors.push(`Gross margin: ${(grossMargin * 100).toFixed(1)}%`)
  }

  // Net margin analysis (30% weight)
  if (
    ratios.netMarginRatio !== undefined ||
    ratios.profitMargin !== undefined
  ) {
    const netMargin = ratios.netMarginRatio || ratios.profitMargin || 0
    // Net margin thresholds are typically lower than gross margin
    const netThresholds = {
      poor: benchmarks.grossMargin.poor * 0.3,
      average: benchmarks.grossMargin.average * 0.4,
      good: benchmarks.grossMargin.good * 0.5,
      excellent: benchmarks.grossMargin.excellent * 0.6,
    }
    components.netMargin = normalizeToScore(netMargin, netThresholds)
    totalWeight += 0.3
    weightedScore += components.netMargin * 0.3

    factors.push(`Net margin: ${(netMargin * 100).toFixed(1)}%`)
  }

  // EBITDA margin analysis (30% weight)
  if (ratios.ebitdaMargin !== undefined) {
    // EBITDA margin thresholds are typically higher than net margin
    const ebitdaThresholds = {
      poor: benchmarks.grossMargin.poor * 0.6,
      average: benchmarks.grossMargin.average * 0.7,
      good: benchmarks.grossMargin.good * 0.8,
      excellent: benchmarks.grossMargin.excellent * 0.9,
    }
    components.ebitdaMargin = normalizeToScore(
      ratios.ebitdaMargin,
      ebitdaThresholds
    )
    totalWeight += 0.3
    weightedScore += components.ebitdaMargin * 0.3

    factors.push(`EBITDA margin: ${(ratios.ebitdaMargin * 100).toFixed(1)}%`)
  }

  const score = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  // Add contextual factors
  if (score >= 75) factors.push('Strong profitability across metrics')
  else if (score >= 50) factors.push('Moderate profitability performance')
  else if (score >= 25) factors.push('Below-average profitability concerns')
  else factors.push('Significant profitability challenges')

  return { score, components, factors }
}

/**
 * Calculate liquidity score based on cash flow and working capital
 */
function calculateLiquidityScore(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []
  let totalWeight = 0
  let weightedScore = 0

  // Cash flow adequacy (60% weight)
  if (financialData.cashFlow !== undefined && financialData.revenue) {
    const cashFlowRatio = financialData.cashFlow / financialData.revenue
    // Cash flow ratio thresholds
    const cashFlowThresholds = {
      poor: -0.1,
      average: 0.05,
      good: 0.15,
      excellent: 0.25,
    }
    components.cashFlowRatio = normalizeToScore(
      cashFlowRatio,
      cashFlowThresholds
    )
    totalWeight += 0.6
    weightedScore += components.cashFlowRatio * 0.6

    factors.push(`Cash flow ratio: ${(cashFlowRatio * 100).toFixed(1)}%`)
  }

  // Working capital analysis (40% weight)
  if (financialData.totalAssets && financialData.liabilities) {
    const workingCapital = financialData.totalAssets - financialData.liabilities
    const workingCapitalRatio = financialData.revenue
      ? workingCapital / financialData.revenue
      : 0

    const workingCapitalThresholds = {
      poor: -0.2,
      average: 0.1,
      good: 0.25,
      excellent: 0.4,
    }
    components.workingCapital = normalizeToScore(
      workingCapitalRatio,
      workingCapitalThresholds
    )
    totalWeight += 0.4
    weightedScore += components.workingCapital * 0.4

    factors.push(
      `Working capital ratio: ${(workingCapitalRatio * 100).toFixed(1)}%`
    )
  }

  const score = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  // Add contextual factors
  if (score >= 75) factors.push('Strong liquidity position')
  else if (score >= 50) factors.push('Adequate liquidity management')
  else if (score >= 25) factors.push('Liquidity concerns present')
  else factors.push('Significant liquidity challenges')

  return { score, components, factors }
}

/**
 * Calculate efficiency score based on asset utilization and employee productivity
 */
function calculateEfficiencyScore(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData,
  category: string = 'OTHER'
): { score: number; components: Record<string, number>; factors: string[] } {
  const components: Record<string, number> = {}
  const factors: string[] = []
  const benchmarks = getIndustryBenchmarks(category)
  let totalWeight = 0
  let weightedScore = 0

  // Revenue per employee (50% weight)
  const revenuePerEmployee = calculateRevenuePerEmployee(
    financialData.revenue,
    operationalData.employees
  )
  if (revenuePerEmployee !== undefined) {
    const revenuePerEmployeeK = revenuePerEmployee / 1000 // Convert to thousands
    components.revenuePerEmployee = normalizeToScore(
      revenuePerEmployeeK,
      benchmarks.employeeEfficiency
    )
    totalWeight += 0.5
    weightedScore += components.revenuePerEmployee * 0.5

    factors.push(`Revenue per employee: $${Math.round(revenuePerEmployeeK)}K`)
  }

  // Asset turnover (50% weight)
  const ratios = calculateFinancialRatios(financialData)
  if (ratios.assetTurnover !== undefined) {
    // Asset turnover thresholds (revenue / assets)
    const assetTurnoverThresholds = {
      poor: 0.5,
      average: 1.0,
      good: 1.8,
      excellent: 3.0,
    }
    components.assetTurnover = normalizeToScore(
      ratios.assetTurnover,
      assetTurnoverThresholds
    )
    totalWeight += 0.5
    weightedScore += components.assetTurnover * 0.5

    factors.push(`Asset turnover: ${ratios.assetTurnover.toFixed(2)}x`)
  }

  const score = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  // Add contextual factors
  if (score >= 75) factors.push('Highly efficient operations')
  else if (score >= 50) factors.push('Moderate operational efficiency')
  else if (score >= 25) factors.push('Efficiency improvements needed')
  else factors.push('Significant efficiency challenges')

  return { score, components, factors }
}

/**
 * Calculate overall financial health score
 */
export function calculateFinancialHealth(
  financialData: BusinessFinancialData,
  operationalData: BusinessOperationalData
): ScoreBreakdown {
  const category = operationalData.category || 'OTHER'

  // Calculate component scores
  const profitability = calculateProfitabilityScore(financialData, category)
  const liquidity = calculateLiquidityScore(financialData, operationalData)
  const efficiency = calculateEfficiencyScore(
    financialData,
    operationalData,
    category
  )

  // Calculate weighted overall financial score
  const components: FinancialHealthComponents = {
    profitability: profitability.score,
    liquidity: liquidity.score,
    efficiency: efficiency.score,
  }

  let totalWeight = 0
  let weightedScore = 0

  // Apply weights for available components
  if (profitability.score > 0) {
    totalWeight += FINANCIAL_WEIGHTS.profitability
    weightedScore += profitability.score * FINANCIAL_WEIGHTS.profitability
  }
  if (liquidity.score > 0) {
    totalWeight += FINANCIAL_WEIGHTS.liquidity
    weightedScore += liquidity.score * FINANCIAL_WEIGHTS.liquidity
  }
  if (efficiency.score > 0) {
    totalWeight += FINANCIAL_WEIGHTS.efficiency
    weightedScore += efficiency.score * FINANCIAL_WEIGHTS.efficiency
  }

  const overallScore = totalWeight > 0 ? clamp(weightedScore / totalWeight) : 0

  // Combine all factors and components
  const allFactors = [
    ...profitability.factors,
    ...liquidity.factors,
    ...efficiency.factors,
  ]

  const allComponents = {
    ...profitability.components,
    ...liquidity.components,
    ...efficiency.components,
  }

  // Generate recommendations based on lowest scoring areas
  const recommendations: string[] = []
  if (profitability.score < 50) {
    recommendations.push(
      'Focus on improving profit margins through cost management or pricing optimization'
    )
  }
  if (liquidity.score < 50) {
    recommendations.push(
      'Improve cash flow management and working capital efficiency'
    )
  }
  if (efficiency.score < 50) {
    recommendations.push(
      'Optimize operational efficiency and asset utilization'
    )
  }

  return {
    score: overallScore,
    components: allComponents,
    factors: allFactors,
    recommendations,
  }
}
