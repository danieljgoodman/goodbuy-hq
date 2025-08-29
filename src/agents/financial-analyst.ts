/**
 * Financial Analyst Agent - Comprehensive financial health analysis
 * Analyzes revenue, profitability, cash flow, liquidity, and financial ratios
 */

import { BusinessData, BusinessMetrics } from '@/types/business'

export interface FinancialStatement {
  revenue: number
  grossProfit: number
  operatingIncome: number
  netIncome: number
  totalAssets: number
  totalLiabilities: number
  equity: number
  cashFlow: number
  operatingExpenses: number
  costOfGoodsSold: number
  date: Date
  period: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual'
}

export interface FinancialRatios {
  // Profitability Ratios
  grossProfitMargin: number
  operatingMargin: number
  netProfitMargin: number
  returnOnAssets: number
  returnOnEquity: number

  // Liquidity Ratios
  currentRatio: number
  quickRatio: number
  cashRatio: number

  // Efficiency Ratios
  assetTurnover: number
  inventoryTurnover: number
  receivablesTurnover: number

  // Leverage Ratios
  debtToEquity: number
  debtToAssets: number
  interestCoverage: number

  // Growth Ratios
  revenueGrowthRate: number
  profitGrowthRate: number
  assetGrowthRate: number
}

export interface TrendAnalysis {
  metric: string
  currentValue: number
  previousValue: number
  changeAmount: number
  changePercent: number
  trend: 'increasing' | 'decreasing' | 'stable'
  volatility: 'low' | 'medium' | 'high'
  projection: number
  confidence: number
}

export interface FinancialHealthScore {
  overallScore: number // 0-100
  categoryScores: {
    profitability: number
    liquidity: number
    efficiency: number
    leverage: number
    growth: number
  }
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
}

export interface CashFlowAnalysis {
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  freeCashFlow: number
  cashFlowMargin: number
  cashConversionCycle: number
  burnRate?: number
  monthsOfCashRemaining?: number
  cashFlowPredictability: 'Stable' | 'Variable' | 'Volatile'
}

export interface FinancialForecast {
  period: number // months ahead
  projectedRevenue: number
  projectedProfit: number
  projectedCashFlow: number
  confidence: number
  assumptions: string[]
  scenarioAnalysis: {
    optimistic: { revenue: number; profit: number }
    realistic: { revenue: number; profit: number }
    pessimistic: { revenue: number; profit: number }
  }
}

export class FinancialAnalyst {
  private statements: FinancialStatement[] = []
  private currentStatement: FinancialStatement | null = null

  constructor() {}

  /**
   * Import business data and create financial statement
   */
  public importBusinessData(businessData: BusinessData): FinancialStatement {
    const statement: FinancialStatement = {
      revenue: businessData.annualRevenue || 0,
      grossProfit: this.calculateGrossProfit(businessData),
      operatingIncome: this.calculateOperatingIncome(businessData),
      netIncome: businessData.monthlyProfit
        ? businessData.monthlyProfit * 12
        : 0,
      totalAssets: this.estimateAssets(businessData),
      totalLiabilities: this.estimateLiabilities(businessData),
      equity: this.calculateEquity(businessData),
      cashFlow: this.estimateCashFlow(businessData),
      operatingExpenses: this.estimateOperatingExpenses(businessData),
      costOfGoodsSold: this.estimateCOGS(businessData),
      date: new Date(),
      period: 'Annual',
    }

    this.currentStatement = statement
    this.statements.push(statement)
    return statement
  }

  /**
   * Calculate comprehensive financial ratios
   */
  public calculateFinancialRatios(
    statement: FinancialStatement = this.currentStatement!
  ): FinancialRatios {
    if (!statement) throw new Error('No financial statement available')

    return {
      // Profitability Ratios
      grossProfitMargin:
        this.safeDivide(statement.grossProfit, statement.revenue) * 100,
      operatingMargin:
        this.safeDivide(statement.operatingIncome, statement.revenue) * 100,
      netProfitMargin:
        this.safeDivide(statement.netIncome, statement.revenue) * 100,
      returnOnAssets:
        this.safeDivide(statement.netIncome, statement.totalAssets) * 100,
      returnOnEquity:
        this.safeDivide(statement.netIncome, statement.equity) * 100,

      // Liquidity Ratios
      currentRatio: this.calculateCurrentRatio(statement),
      quickRatio: this.calculateQuickRatio(statement),
      cashRatio: this.calculateCashRatio(statement),

      // Efficiency Ratios
      assetTurnover: this.safeDivide(statement.revenue, statement.totalAssets),
      inventoryTurnover: this.calculateInventoryTurnover(statement),
      receivablesTurnover: this.calculateReceivablesTurnover(statement),

      // Leverage Ratios
      debtToEquity: this.safeDivide(
        statement.totalLiabilities,
        statement.equity
      ),
      debtToAssets:
        this.safeDivide(statement.totalLiabilities, statement.totalAssets) *
        100,
      interestCoverage: this.calculateInterestCoverage(statement),

      // Growth Ratios
      revenueGrowthRate: this.calculateGrowthRate('revenue'),
      profitGrowthRate: this.calculateGrowthRate('netIncome'),
      assetGrowthRate: this.calculateGrowthRate('totalAssets'),
    }
  }

  /**
   * Perform trend analysis on financial metrics
   */
  public analyzeTrends(metric: keyof FinancialStatement): TrendAnalysis {
    if (this.statements.length < 2) {
      throw new Error('Need at least 2 financial statements for trend analysis')
    }

    const sortedStatements = this.statements.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )
    const latest = sortedStatements[sortedStatements.length - 1]
    const previous = sortedStatements[sortedStatements.length - 2]

    const currentValue = latest[metric] as number
    const previousValue = previous[metric] as number
    const changeAmount = currentValue - previousValue
    const changePercent = this.safeDivide(changeAmount, previousValue) * 100

    return {
      metric: metric.toString(),
      currentValue,
      previousValue,
      changeAmount,
      changePercent,
      trend: this.determineTrend(changePercent),
      volatility: this.calculateVolatility(metric),
      projection: this.projectValue(currentValue, changePercent),
      confidence: this.calculateTrendConfidence(metric),
    }
  }

  /**
   * Calculate comprehensive financial health score
   */
  public calculateFinancialHealthScore(
    ratios: FinancialRatios = this.calculateFinancialRatios()
  ): FinancialHealthScore {
    const scores = {
      profitability: this.scoreProfitability(ratios),
      liquidity: this.scoreLiquidity(ratios),
      efficiency: this.scoreEfficiency(ratios),
      leverage: this.scoreLeverage(ratios),
      growth: this.scoreGrowth(ratios),
    }

    const overallScore =
      Object.values(scores).reduce((sum, score) => sum + score, 0) / 5

    return {
      overallScore: Math.round(overallScore),
      categoryScores: scores,
      strengths: this.identifyStrengths(scores, ratios),
      weaknesses: this.identifyWeaknesses(scores, ratios),
      recommendations: this.generateRecommendations(scores, ratios),
      riskLevel: this.assessRiskLevel(overallScore),
    }
  }

  /**
   * Analyze cash flow patterns and health
   */
  public analyzeCashFlow(
    statement: FinancialStatement = this.currentStatement!
  ): CashFlowAnalysis {
    if (!statement) throw new Error('No financial statement available')

    const operatingCashFlow = statement.cashFlow
    const freeCashFlow = operatingCashFlow * 0.85 // Estimate after capex
    const cashFlowMargin =
      this.safeDivide(operatingCashFlow, statement.revenue) * 100

    return {
      operatingCashFlow,
      investingCashFlow: statement.revenue * -0.05, // Estimated
      financingCashFlow: statement.totalLiabilities * 0.1, // Estimated
      freeCashFlow,
      cashFlowMargin,
      cashConversionCycle: this.calculateCashConversionCycle(statement),
      cashFlowPredictability: this.assessCashFlowPredictability(),
    }
  }

  /**
   * Generate financial forecast
   */
  public generateForecast(months: number = 12): FinancialForecast {
    if (!this.currentStatement)
      throw new Error('No current financial statement available')

    const ratios = this.calculateFinancialRatios()
    const growthRate = ratios.revenueGrowthRate / 100
    const currentRevenue = this.currentStatement.revenue
    const currentProfit = this.currentStatement.netIncome

    // Project based on historical growth
    const projectedRevenue = currentRevenue * (1 + growthRate * (months / 12))
    const projectedProfit = projectedRevenue * (ratios.netProfitMargin / 100)
    const projectedCashFlow = projectedProfit * 1.2 // Estimate

    return {
      period: months,
      projectedRevenue,
      projectedProfit,
      projectedCashFlow,
      confidence: this.calculateForecastConfidence(),
      assumptions: [
        `Revenue growth rate: ${ratios.revenueGrowthRate.toFixed(1)}%`,
        `Net profit margin: ${ratios.netProfitMargin.toFixed(1)}%`,
        'No major market disruptions',
        'Current operational efficiency maintained',
      ],
      scenarioAnalysis: {
        optimistic: {
          revenue: projectedRevenue * 1.2,
          profit: projectedProfit * 1.3,
        },
        realistic: {
          revenue: projectedRevenue,
          profit: projectedProfit,
        },
        pessimistic: {
          revenue: projectedRevenue * 0.8,
          profit: projectedProfit * 0.6,
        },
      },
    }
  }

  /**
   * Generate analysis report
   */
  public generateAnalysisReport(): {
    statement: FinancialStatement
    ratios: FinancialRatios
    healthScore: FinancialHealthScore
    cashFlowAnalysis: CashFlowAnalysis
    forecast: FinancialForecast
    trends: TrendAnalysis[]
  } {
    if (!this.currentStatement)
      throw new Error('No financial statement available')

    const ratios = this.calculateFinancialRatios()
    const healthScore = this.calculateFinancialHealthScore(ratios)
    const cashFlowAnalysis = this.analyzeCashFlow()
    const forecast = this.generateForecast()

    const trends: TrendAnalysis[] = []
    if (this.statements.length >= 2) {
      const keyMetrics: (keyof FinancialStatement)[] = [
        'revenue',
        'netIncome',
        'cashFlow',
      ]
      trends.push(...keyMetrics.map(metric => this.analyzeTrends(metric)))
    }

    return {
      statement: this.currentStatement,
      ratios,
      healthScore,
      cashFlowAnalysis,
      forecast,
      trends,
    }
  }

  // Private helper methods
  private calculateGrossProfit(data: BusinessData): number {
    const revenue = data.annualRevenue || 0
    // Estimate COGS as 60% of revenue for service businesses, 70% for retail
    const cogsPercentage = data.businessType?.toLowerCase().includes('service')
      ? 0.4
      : 0.3
    return revenue * cogsPercentage
  }

  private calculateOperatingIncome(data: BusinessData): number {
    const grossProfit = this.calculateGrossProfit(data)
    const operatingExpenses = this.estimateOperatingExpenses(data)
    return grossProfit - operatingExpenses
  }

  private estimateAssets(data: BusinessData): number {
    const revenue = data.annualRevenue || 0
    // Estimate total assets as 0.8-1.2x revenue depending on business type
    return revenue * 1.0
  }

  private estimateLiabilities(data: BusinessData): number {
    const assets = this.estimateAssets(data)
    // Estimate liabilities as 30-50% of assets
    return assets * 0.4
  }

  private calculateEquity(data: BusinessData): number {
    const assets = this.estimateAssets(data)
    const liabilities = this.estimateLiabilities(data)
    return assets - liabilities
  }

  private estimateCashFlow(data: BusinessData): number {
    const netIncome = data.monthlyProfit ? data.monthlyProfit * 12 : 0
    // Add back non-cash expenses (estimate)
    return netIncome * 1.2
  }

  private estimateOperatingExpenses(data: BusinessData): number {
    const revenue = data.annualRevenue || 0
    // Estimate operating expenses as 20-40% of revenue
    return revenue * 0.3
  }

  private estimateCOGS(data: BusinessData): number {
    const revenue = data.annualRevenue || 0
    return revenue - this.calculateGrossProfit(data)
  }

  private safeDivide(numerator: number, denominator: number): number {
    return denominator === 0 ? 0 : numerator / denominator
  }

  private calculateCurrentRatio(statement: FinancialStatement): number {
    const currentAssets = statement.totalAssets * 0.6 // Estimate
    const currentLiabilities = statement.totalLiabilities * 0.7 // Estimate
    return this.safeDivide(currentAssets, currentLiabilities)
  }

  private calculateQuickRatio(statement: FinancialStatement): number {
    const quickAssets = statement.totalAssets * 0.4 // Estimate (current assets - inventory)
    const currentLiabilities = statement.totalLiabilities * 0.7 // Estimate
    return this.safeDivide(quickAssets, currentLiabilities)
  }

  private calculateCashRatio(statement: FinancialStatement): number {
    const cash = statement.cashFlow * 0.2 // Estimate cash on hand
    const currentLiabilities = statement.totalLiabilities * 0.7 // Estimate
    return this.safeDivide(cash, currentLiabilities)
  }

  private calculateInventoryTurnover(statement: FinancialStatement): number {
    const inventory = statement.totalAssets * 0.2 // Estimate
    return this.safeDivide(statement.costOfGoodsSold, inventory)
  }

  private calculateReceivablesTurnover(statement: FinancialStatement): number {
    const receivables = statement.totalAssets * 0.15 // Estimate
    return this.safeDivide(statement.revenue, receivables)
  }

  private calculateInterestCoverage(statement: FinancialStatement): number {
    const interestExpense = statement.totalLiabilities * 0.05 // Estimate 5% interest rate
    return this.safeDivide(statement.operatingIncome, interestExpense)
  }

  private calculateGrowthRate(metric: keyof FinancialStatement): number {
    if (this.statements.length < 2) return 0

    const sortedStatements = this.statements.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )
    const latest = sortedStatements[sortedStatements.length - 1]
    const previous = sortedStatements[sortedStatements.length - 2]

    const currentValue = latest[metric] as number
    const previousValue = previous[metric] as number

    return this.safeDivide(currentValue - previousValue, previousValue) * 100
  }

  private determineTrend(
    changePercent: number
  ): 'increasing' | 'decreasing' | 'stable' {
    if (Math.abs(changePercent) < 2) return 'stable'
    return changePercent > 0 ? 'increasing' : 'decreasing'
  }

  private calculateVolatility(
    metric: keyof FinancialStatement
  ): 'low' | 'medium' | 'high' {
    if (this.statements.length < 3) return 'medium'

    const values = this.statements.map(s => s[metric] as number)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length
    const coefficientOfVariation = Math.sqrt(variance) / mean

    if (coefficientOfVariation < 0.1) return 'low'
    if (coefficientOfVariation < 0.3) return 'medium'
    return 'high'
  }

  private projectValue(currentValue: number, changePercent: number): number {
    return currentValue * (1 + changePercent / 100)
  }

  private calculateTrendConfidence(metric: keyof FinancialStatement): number {
    const volatility = this.calculateVolatility(metric)
    const dataPoints = this.statements.length

    let baseConfidence = 50
    if (dataPoints >= 4) baseConfidence += 20
    if (volatility === 'low') baseConfidence += 20
    else if (volatility === 'high') baseConfidence -= 20

    return Math.max(20, Math.min(95, baseConfidence))
  }

  private scoreProfitability(ratios: FinancialRatios): number {
    let score = 0
    if (ratios.grossProfitMargin > 40) score += 25
    else if (ratios.grossProfitMargin > 20) score += 15
    else if (ratios.grossProfitMargin > 10) score += 5

    if (ratios.netProfitMargin > 15) score += 25
    else if (ratios.netProfitMargin > 8) score += 15
    else if (ratios.netProfitMargin > 3) score += 5

    if (ratios.returnOnAssets > 10) score += 25
    else if (ratios.returnOnAssets > 5) score += 15
    else if (ratios.returnOnAssets > 2) score += 5

    if (ratios.returnOnEquity > 15) score += 25
    else if (ratios.returnOnEquity > 10) score += 15
    else if (ratios.returnOnEquity > 5) score += 5

    return Math.min(100, score)
  }

  private scoreLiquidity(ratios: FinancialRatios): number {
    let score = 0
    if (ratios.currentRatio > 2) score += 40
    else if (ratios.currentRatio > 1.5) score += 30
    else if (ratios.currentRatio > 1) score += 15

    if (ratios.quickRatio > 1.5) score += 30
    else if (ratios.quickRatio > 1) score += 20
    else if (ratios.quickRatio > 0.5) score += 10

    if (ratios.cashRatio > 0.5) score += 30
    else if (ratios.cashRatio > 0.2) score += 20
    else if (ratios.cashRatio > 0.1) score += 10

    return Math.min(100, score)
  }

  private scoreEfficiency(ratios: FinancialRatios): number {
    let score = 0
    if (ratios.assetTurnover > 2) score += 35
    else if (ratios.assetTurnover > 1.5) score += 25
    else if (ratios.assetTurnover > 1) score += 15

    if (ratios.inventoryTurnover > 10) score += 35
    else if (ratios.inventoryTurnover > 6) score += 25
    else if (ratios.inventoryTurnover > 3) score += 15

    if (ratios.receivablesTurnover > 12) score += 30
    else if (ratios.receivablesTurnover > 8) score += 20
    else if (ratios.receivablesTurnover > 4) score += 10

    return Math.min(100, score)
  }

  private scoreLeverage(ratios: FinancialRatios): number {
    let score = 100 // Start with perfect score, deduct for high leverage

    if (ratios.debtToEquity > 2) score -= 40
    else if (ratios.debtToEquity > 1.5) score -= 25
    else if (ratios.debtToEquity > 1) score -= 10

    if (ratios.debtToAssets > 60) score -= 30
    else if (ratios.debtToAssets > 40) score -= 15
    else if (ratios.debtToAssets > 30) score -= 5

    if (ratios.interestCoverage < 2) score -= 30
    else if (ratios.interestCoverage < 5) score -= 15
    else if (ratios.interestCoverage < 10) score -= 5

    return Math.max(0, score)
  }

  private scoreGrowth(ratios: FinancialRatios): number {
    let score = 0

    if (ratios.revenueGrowthRate > 20) score += 40
    else if (ratios.revenueGrowthRate > 10) score += 30
    else if (ratios.revenueGrowthRate > 5) score += 20
    else if (ratios.revenueGrowthRate > 0) score += 10

    if (ratios.profitGrowthRate > 15) score += 30
    else if (ratios.profitGrowthRate > 8) score += 20
    else if (ratios.profitGrowthRate > 0) score += 10

    if (ratios.assetGrowthRate > 10) score += 30
    else if (ratios.assetGrowthRate > 5) score += 20
    else if (ratios.assetGrowthRate > 0) score += 10

    return Math.min(100, score)
  }

  private identifyStrengths(scores: any, ratios: FinancialRatios): string[] {
    const strengths: string[] = []

    if (scores.profitability > 75)
      strengths.push('Strong profitability metrics')
    if (scores.liquidity > 75) strengths.push('Excellent liquidity position')
    if (scores.efficiency > 75) strengths.push('High operational efficiency')
    if (scores.leverage < 25) strengths.push('Conservative debt management') // Low leverage is good
    if (scores.growth > 75) strengths.push('Robust growth trajectory')

    if (ratios.grossProfitMargin > 40)
      strengths.push('High gross profit margins')
    if (ratios.currentRatio > 2)
      strengths.push('Strong working capital position')
    if (ratios.returnOnEquity > 15)
      strengths.push('Excellent returns to shareholders')

    return strengths
  }

  private identifyWeaknesses(scores: any, ratios: FinancialRatios): string[] {
    const weaknesses: string[] = []

    if (scores.profitability < 40) weaknesses.push('Low profitability metrics')
    if (scores.liquidity < 40) weaknesses.push('Poor liquidity position')
    if (scores.efficiency < 40) weaknesses.push('Operational inefficiencies')
    if (scores.leverage > 75) weaknesses.push('High debt burden')
    if (scores.growth < 40) weaknesses.push('Weak growth performance')

    if (ratios.netProfitMargin < 5) weaknesses.push('Low net profit margins')
    if (ratios.currentRatio < 1) weaknesses.push('Working capital concerns')
    if (ratios.debtToEquity > 2) weaknesses.push('High financial leverage')

    return weaknesses
  }

  private generateRecommendations(
    scores: any,
    ratios: FinancialRatios
  ): string[] {
    const recommendations: string[] = []

    if (scores.profitability < 50) {
      recommendations.push(
        'Focus on improving profit margins through cost optimization or pricing strategy'
      )
    }
    if (scores.liquidity < 50) {
      recommendations.push(
        'Improve cash management and working capital efficiency'
      )
    }
    if (scores.efficiency < 50) {
      recommendations.push(
        'Optimize asset utilization and operational processes'
      )
    }
    if (scores.leverage > 70) {
      recommendations.push(
        'Consider debt reduction to improve financial stability'
      )
    }
    if (scores.growth < 50) {
      recommendations.push(
        'Develop growth strategies to improve market position'
      )
    }

    // Add specific recommendations based on ratios
    if (ratios.currentRatio < 1.2) {
      recommendations.push(
        'Increase current assets or reduce short-term liabilities'
      )
    }
    if (ratios.grossProfitMargin < 30) {
      recommendations.push('Review pricing strategy and cost structure')
    }

    return recommendations
  }

  private assessRiskLevel(
    overallScore: number
  ): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (overallScore >= 80) return 'Low'
    if (overallScore >= 60) return 'Medium'
    if (overallScore >= 40) return 'High'
    return 'Critical'
  }

  private calculateCashConversionCycle(statement: FinancialStatement): number {
    // Simplified calculation - days to convert investments to cash
    const daysInYear = 365
    const inventoryDays =
      daysInYear / this.calculateInventoryTurnover(statement)
    const receivablesDays =
      daysInYear / this.calculateReceivablesTurnover(statement)
    const payablesDays = 30 // Estimate

    return inventoryDays + receivablesDays - payablesDays
  }

  private assessCashFlowPredictability(): 'Stable' | 'Variable' | 'Volatile' {
    if (this.statements.length < 3) return 'Variable'

    const cashFlows = this.statements.map(s => s.cashFlow)
    const mean = cashFlows.reduce((sum, cf) => sum + cf, 0) / cashFlows.length
    const variance =
      cashFlows.reduce((sum, cf) => sum + Math.pow(cf - mean, 2), 0) /
      cashFlows.length
    const coefficientOfVariation = Math.sqrt(variance) / mean

    if (coefficientOfVariation < 0.15) return 'Stable'
    if (coefficientOfVariation < 0.35) return 'Variable'
    return 'Volatile'
  }

  private calculateForecastConfidence(): number {
    const dataQuality = this.statements.length >= 3 ? 80 : 60
    const trendConsistency =
      this.statements.length >= 2
        ? this.calculateVolatility('revenue') === 'low'
          ? 85
          : 70
        : 70

    return Math.round((dataQuality + trendConsistency) / 2)
  }
}

export default FinancialAnalyst
