import {
  EvaluationFormData,
  ValuationResult,
  ValuationMethod,
  BusinessInfo,
  FinancialData,
  BusinessDetails,
} from '@/types/valuation'
import { INDUSTRY_MULTIPLIERS } from './industry-data'

export class ValuationEngine {
  private data: EvaluationFormData

  constructor(data: EvaluationFormData) {
    this.data = data
  }

  public calculateValuation(): ValuationResult {
    const methods = this.calculateAllMethods()
    const adjustmentFactors = this.calculateAdjustmentFactors()
    const keyMetrics = this.calculateKeyMetrics()

    // Apply adjustment factors to each method
    const adjustedMethods = methods.map(method => ({
      ...method,
      value: this.applyAdjustments(method.value, adjustmentFactors),
    }))

    // Calculate weighted average based on confidence scores
    const overallValuation = this.calculateWeightedAverage(adjustedMethods)
    const confidenceScore = this.calculateOverallConfidence(adjustedMethods)

    return {
      companyName: this.data.basicInfo.companyName,
      evaluationDate: new Date().toISOString(),
      overallValuation,
      confidenceScore,
      methods: adjustedMethods,
      adjustmentFactors,
      keyMetrics,
      recommendations: this.generateRecommendations(),
      riskFactors: this.data.businessDetails.riskFactors,
    }
  }

  private calculateAllMethods(): ValuationMethod[] {
    const methods: ValuationMethod[] = []

    // Revenue Multiple Method
    methods.push(this.calculateRevenueMultiple())

    // EBITDA Multiple Method
    methods.push(this.calculateEBITDAMultiple())

    // P/E Ratio Method
    methods.push(this.calculatePERatio())

    // Asset-Based Method
    methods.push(this.calculateAssetBased())

    // DCF Method (simplified)
    methods.push(this.calculateDCF())

    return methods
  }

  private calculateRevenueMultiple(): ValuationMethod {
    const revenue = this.data.financialData.annualRevenue
    const industry = this.data.basicInfo.industry
    const multiplier =
      INDUSTRY_MULTIPLIERS[industry]?.revenueMultiplier?.average || 2.5

    const value = revenue * multiplier
    const confidence = this.calculateConfidence('revenue', revenue)

    return {
      name: 'Revenue Multiple',
      value,
      confidence,
      description: `Based on ${multiplier}x revenue multiple for ${industry} industry`,
    }
  }

  private calculateEBITDAMultiple(): ValuationMethod {
    const grossProfit = this.data.financialData.grossProfit
    const ebitda = grossProfit * 0.8 // Simplified EBITDA estimation
    const industry = this.data.basicInfo.industry
    const multiplier =
      INDUSTRY_MULTIPLIERS[industry]?.ebitdaMultiplier?.average || 10

    const value = ebitda * multiplier
    const confidence = this.calculateConfidence('ebitda', ebitda)

    return {
      name: 'EBITDA Multiple',
      value,
      confidence,
      description: `Based on ${multiplier}x EBITDA multiple for ${industry} industry`,
    }
  }

  private calculatePERatio(): ValuationMethod {
    const netIncome = this.data.financialData.netIncome
    const industry = this.data.basicInfo.industry
    const peRatio = INDUSTRY_MULTIPLIERS[industry]?.peRatio?.average || 15

    const value = netIncome * peRatio
    const confidence = this.calculateConfidence('pe', netIncome)

    return {
      name: 'P/E Ratio',
      value,
      confidence,
      description: `Based on ${peRatio}x P/E ratio for ${industry} industry`,
    }
  }

  private calculateAssetBased(): ValuationMethod {
    const totalAssets = this.data.financialData.totalAssets
    const totalLiabilities = this.data.financialData.totalLiabilities
    const bookValue = totalAssets - totalLiabilities

    // Apply industry-specific asset multiplier
    const assetMultiplier = this.getAssetMultiplier()
    const value = bookValue * assetMultiplier

    return {
      name: 'Asset-Based',
      value,
      confidence: 75,
      description: `Based on adjusted book value of assets minus liabilities`,
    }
  }

  private calculateDCF(): ValuationMethod {
    const cashFlow = this.data.financialData.cashFlow
    const growthRate = this.calculateGrowthRate()
    const discountRate = this.calculateDiscountRate()

    // Simplified DCF: 5-year projection with terminal value
    let dcfValue = 0
    let projectedCF = cashFlow

    // 5-year cash flow projection
    for (let year = 1; year <= 5; year++) {
      projectedCF *= 1 + growthRate
      dcfValue += projectedCF / Math.pow(1 + discountRate, year)
    }

    // Terminal value (assuming 3% perpetual growth)
    const terminalValue = (projectedCF * 1.03) / (discountRate - 0.03)
    dcfValue += terminalValue / Math.pow(1 + discountRate, 5)

    return {
      name: 'Discounted Cash Flow',
      value: dcfValue,
      confidence: 80,
      description: `Based on projected cash flows with ${(growthRate * 100).toFixed(1)}% growth rate`,
    }
  }

  private calculateAdjustmentFactors() {
    const growthAdjustment = this.calculateGrowthAdjustment()
    const riskAdjustment = this.calculateRiskAdjustment()
    const marketPositionAdjustment = this.calculateMarketPositionAdjustment()
    const sizeAdjustment = this.calculateSizeAdjustment()

    return {
      growthAdjustment,
      riskAdjustment,
      marketPositionAdjustment,
      sizeAdjustment,
    }
  }

  private calculateGrowthAdjustment(): number {
    const growthRate = this.calculateGrowthRate()
    const stage = this.data.businessDetails.growthStage

    let baseAdjustment = 1

    if (growthRate > 0.3)
      baseAdjustment = 1.3 // High growth
    else if (growthRate > 0.15)
      baseAdjustment = 1.15 // Medium growth
    else if (growthRate > 0.05)
      baseAdjustment = 1.05 // Low growth
    else baseAdjustment = 0.9 // Declining

    // Stage adjustments
    const stageMultipliers = {
      startup: 1.2,
      growth: 1.1,
      mature: 1.0,
      decline: 0.8,
    }

    return baseAdjustment * stageMultipliers[stage]
  }

  private calculateRiskAdjustment(): number {
    const riskFactors = this.data.businessDetails.riskFactors.length
    const customerConcentration =
      this.data.businessDetails.customerConcentration
    const regulatoryRisk = this.data.businessDetails.regulatoryRisk

    let riskScore = 0

    // Risk factor count
    riskScore += riskFactors * 0.02

    // Customer concentration risk
    if (customerConcentration === 'high') riskScore += 0.1
    else if (customerConcentration === 'medium') riskScore += 0.05

    // Regulatory risk
    if (regulatoryRisk === 'high') riskScore += 0.08
    else if (regulatoryRisk === 'medium') riskScore += 0.04

    return Math.max(0.7, 1 - riskScore)
  }

  private calculateMarketPositionAdjustment(): number {
    const position = this.data.businessDetails.marketPosition
    const marketSize = this.data.businessDetails.marketSize

    const positionMultipliers = {
      leader: 1.2,
      challenger: 1.1,
      follower: 1.0,
      niche: 0.95,
    }

    const sizeMultipliers = {
      massive: 1.1,
      large: 1.05,
      medium: 1.0,
      small: 0.95,
    }

    return positionMultipliers[position] * sizeMultipliers[marketSize]
  }

  private calculateSizeAdjustment(): number {
    const revenue = this.data.financialData.annualRevenue

    if (revenue > 100000000) return 1.1 // >$100M
    if (revenue > 50000000) return 1.05 // >$50M
    if (revenue > 10000000) return 1.0 // >$10M
    if (revenue > 1000000) return 0.95 // >$1M
    return 0.9 // <$1M
  }

  private calculateKeyMetrics() {
    const revenue = this.data.financialData.annualRevenue
    const grossProfit = this.data.financialData.grossProfit
    const totalAssets = this.data.financialData.totalAssets
    const netIncome = this.data.financialData.netIncome
    const previousRevenue = this.data.financialData.previousYearRevenue

    return {
      revenueMultiple: this.calculateRevenueMultiple().value / revenue,
      profitMargin: (netIncome / revenue) * 100,
      returnOnAssets: (netIncome / totalAssets) * 100,
      debtToEquity: this.data.financialData.debtToEquity,
      growthRate: this.calculateGrowthRate() * 100,
    }
  }

  private calculateGrowthRate(): number {
    const currentRevenue = this.data.financialData.annualRevenue
    const previousRevenue = this.data.financialData.previousYearRevenue

    if (previousRevenue > 0) {
      return (currentRevenue - previousRevenue) / previousRevenue
    }
    return 0.05 // Default 5% if no previous data
  }

  private calculateDiscountRate(): number {
    // Risk-free rate + risk premium based on business characteristics
    const riskFreeRate = 0.04 // 4% base rate
    let riskPremium = 0.06 // Base 6% risk premium

    // Adjust based on company size and risk factors
    const revenue = this.data.financialData.annualRevenue
    if (revenue < 1000000)
      riskPremium += 0.04 // Small company premium
    else if (revenue < 10000000) riskPremium += 0.02

    // Adjust for risk factors
    const riskFactorCount = this.data.businessDetails.riskFactors.length
    riskPremium += riskFactorCount * 0.005

    return riskFreeRate + riskPremium
  }

  private getAssetMultiplier(): number {
    const industry = this.data.basicInfo.industry

    // Asset-light businesses typically trade at premium to book value
    const assetLightIndustries = [
      'Technology - Software',
      'Professional Services',
      'Media & Entertainment',
    ]

    if (assetLightIndustries.includes(industry)) {
      return 1.5
    }

    return 1.2 // Default asset multiplier
  }

  private calculateConfidence(method: string, value: number): number {
    let confidence = 70 // Base confidence

    // Adjust based on data quality
    if (value > 0) confidence += 10
    if (this.data.financialData.previousYearRevenue > 0) confidence += 10

    // Industry-specific adjustments
    const industry = this.data.basicInfo.industry
    if (INDUSTRY_MULTIPLIERS[industry]) {
      confidence += 10
    }

    // Method-specific adjustments
    if (
      method === 'revenue' &&
      this.data.financialData.annualRevenue > 1000000
    ) {
      confidence += 5
    }

    return Math.min(95, confidence)
  }

  private applyAdjustments(baseValue: number, factors: any): number {
    return (
      baseValue *
      factors.growthAdjustment *
      factors.riskAdjustment *
      factors.marketPositionAdjustment *
      factors.sizeAdjustment
    )
  }

  private calculateWeightedAverage(methods: ValuationMethod[]): number {
    const totalWeight = methods.reduce(
      (sum, method) => sum + method.confidence,
      0
    )
    const weightedSum = methods.reduce(
      (sum, method) => sum + method.value * method.confidence,
      0
    )

    return weightedSum / totalWeight
  }

  private calculateOverallConfidence(methods: ValuationMethod[]): number {
    return (
      methods.reduce((sum, method) => sum + method.confidence, 0) /
      methods.length
    )
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const growthRate = this.calculateGrowthRate()
    const profitMargin =
      (this.data.financialData.netIncome /
        this.data.financialData.annualRevenue) *
      100

    if (growthRate < 0.05) {
      recommendations.push(
        'Focus on growth initiatives to improve revenue trajectory'
      )
    }

    if (profitMargin < 10) {
      recommendations.push(
        'Improve operational efficiency to increase profit margins'
      )
    }

    if (this.data.financialData.debtToEquity > 2) {
      recommendations.push(
        'Consider debt reduction to improve financial stability'
      )
    }

    if (this.data.businessDetails.riskFactors.length > 3) {
      recommendations.push(
        'Develop risk mitigation strategies to reduce business uncertainty'
      )
    }

    return recommendations
  }
}
