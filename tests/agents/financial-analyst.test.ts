import FinancialAnalyst, {
  FinancialStatement,
} from '@/agents/financial-analyst'
import { BusinessData } from '@/types/business'

describe('FinancialAnalyst', () => {
  let analyst: FinancialAnalyst
  let mockBusinessData: BusinessData

  beforeEach(() => {
    analyst = new FinancialAnalyst()
    mockBusinessData = {
      id: '1',
      businessName: 'Test Business',
      industry: 'Technology',
      location: 'New York',
      annualRevenue: 1000000,
      monthlyProfit: 50000,
      yearsInOperation: 5,
      employees: 10,
      businessType: 'service',
      description: 'Test business description',
    }
  })

  describe('importBusinessData', () => {
    it('should create a financial statement from business data', () => {
      const statement = analyst.importBusinessData(mockBusinessData)

      expect(statement).toEqual(
        expect.objectContaining({
          revenue: 1000000,
          netIncome: 600000, // 50k * 12
          period: 'Annual',
        })
      )
      expect(statement.grossProfit).toBeGreaterThan(0)
      expect(statement.totalAssets).toBeGreaterThan(0)
    })

    it('should handle missing revenue data', () => {
      const dataWithoutRevenue = {
        ...mockBusinessData,
        annualRevenue: undefined,
      }
      const statement = analyst.importBusinessData(dataWithoutRevenue)

      expect(statement.revenue).toBe(0)
      expect(statement.grossProfit).toBe(0)
    })
  })

  describe('calculateFinancialRatios', () => {
    it('should calculate profitability ratios correctly', () => {
      const statement = analyst.importBusinessData(mockBusinessData)
      const ratios = analyst.calculateFinancialRatios(statement)

      expect(ratios.grossProfitMargin).toBeGreaterThan(0)
      expect(ratios.netProfitMargin).toBeGreaterThan(0)
      expect(ratios.returnOnAssets).toBeGreaterThan(0)
      expect(ratios.returnOnEquity).toBeGreaterThan(0)
    })

    it('should calculate liquidity ratios', () => {
      const statement = analyst.importBusinessData(mockBusinessData)
      const ratios = analyst.calculateFinancialRatios(statement)

      expect(ratios.currentRatio).toBeGreaterThan(0)
      expect(ratios.quickRatio).toBeGreaterThan(0)
      expect(ratios.cashRatio).toBeGreaterThan(0)
    })

    it('should handle zero denominators safely', () => {
      const zeroRevenueData = {
        ...mockBusinessData,
        annualRevenue: 0,
        monthlyProfit: 0,
      }
      const statement = analyst.importBusinessData(zeroRevenueData)
      const ratios = analyst.calculateFinancialRatios(statement)

      expect(ratios.grossProfitMargin).toBe(0)
      expect(ratios.netProfitMargin).toBe(0)
      expect(ratios.assetTurnover).toBe(0)
    })
  })

  describe('calculateFinancialHealthScore', () => {
    it('should generate a health score between 0-100', () => {
      const statement = analyst.importBusinessData(mockBusinessData)
      const ratios = analyst.calculateFinancialRatios(statement)
      const healthScore = analyst.calculateFinancialHealthScore(ratios)

      expect(healthScore.overallScore).toBeGreaterThanOrEqual(0)
      expect(healthScore.overallScore).toBeLessThanOrEqual(100)
      expect(healthScore.categoryScores).toHaveProperty('profitability')
      expect(healthScore.categoryScores).toHaveProperty('liquidity')
      expect(healthScore.categoryScores).toHaveProperty('efficiency')
      expect(healthScore.categoryScores).toHaveProperty('leverage')
      expect(healthScore.categoryScores).toHaveProperty('growth')
    })

    it('should provide recommendations and insights', () => {
      const statement = analyst.importBusinessData(mockBusinessData)
      const ratios = analyst.calculateFinancialRatios(statement)
      const healthScore = analyst.calculateFinancialHealthScore(ratios)

      expect(Array.isArray(healthScore.strengths)).toBe(true)
      expect(Array.isArray(healthScore.weaknesses)).toBe(true)
      expect(Array.isArray(healthScore.recommendations)).toBe(true)
      expect(['Low', 'Medium', 'High', 'Critical']).toContain(
        healthScore.riskLevel
      )
    })
  })

  describe('analyzeCashFlow', () => {
    it('should analyze cash flow metrics', () => {
      const statement = analyst.importBusinessData(mockBusinessData)
      const cashFlowAnalysis = analyst.analyzeCashFlow(statement)

      expect(cashFlowAnalysis.operatingCashFlow).toBeGreaterThan(0)
      expect(cashFlowAnalysis.freeCashFlow).toBeGreaterThan(0)
      expect(cashFlowAnalysis.cashFlowMargin).toBeGreaterThan(0)
      expect(['Stable', 'Variable', 'Volatile']).toContain(
        cashFlowAnalysis.cashFlowPredictability
      )
    })
  })

  describe('generateForecast', () => {
    it('should generate financial forecast', () => {
      analyst.importBusinessData(mockBusinessData)
      const forecast = analyst.generateForecast(12)

      expect(forecast.period).toBe(12)
      expect(forecast.projectedRevenue).toBeGreaterThan(0)
      expect(forecast.projectedProfit).toBeGreaterThan(0)
      expect(forecast.confidence).toBeGreaterThanOrEqual(20)
      expect(forecast.confidence).toBeLessThanOrEqual(95)
      expect(forecast.scenarioAnalysis).toHaveProperty('optimistic')
      expect(forecast.scenarioAnalysis).toHaveProperty('realistic')
      expect(forecast.scenarioAnalysis).toHaveProperty('pessimistic')
    })

    it('should include assumptions in forecast', () => {
      analyst.importBusinessData(mockBusinessData)
      const forecast = analyst.generateForecast()

      expect(Array.isArray(forecast.assumptions)).toBe(true)
      expect(forecast.assumptions.length).toBeGreaterThan(0)
    })
  })

  describe('generateAnalysisReport', () => {
    it('should generate comprehensive analysis report', () => {
      analyst.importBusinessData(mockBusinessData)
      const report = analyst.generateAnalysisReport()

      expect(report).toHaveProperty('statement')
      expect(report).toHaveProperty('ratios')
      expect(report).toHaveProperty('healthScore')
      expect(report).toHaveProperty('cashFlowAnalysis')
      expect(report).toHaveProperty('forecast')
      expect(report).toHaveProperty('trends')
      expect(Array.isArray(report.trends)).toBe(true)
    })
  })

  describe('analyzeTrends', () => {
    it('should require at least 2 statements for trend analysis', () => {
      analyst.importBusinessData(mockBusinessData)

      expect(() => {
        analyst.analyzeTrends('revenue')
      }).toThrow('Need at least 2 financial statements for trend analysis')
    })

    it('should analyze trends when sufficient data exists', () => {
      // Add first statement
      analyst.importBusinessData(mockBusinessData)

      // Add second statement with different values
      const updatedData = {
        ...mockBusinessData,
        annualRevenue: 1200000,
        monthlyProfit: 55000,
      }
      analyst.importBusinessData(updatedData)

      const trendAnalysis = analyst.analyzeTrends('revenue')

      expect(trendAnalysis.metric).toBe('revenue')
      expect(trendAnalysis.currentValue).toBe(1200000)
      expect(trendAnalysis.previousValue).toBe(1000000)
      expect(trendAnalysis.changeAmount).toBe(200000)
      expect(trendAnalysis.changePercent).toBe(20)
      expect(['increasing', 'decreasing', 'stable']).toContain(
        trendAnalysis.trend
      )
      expect(['low', 'medium', 'high']).toContain(trendAnalysis.volatility)
    })
  })
})
