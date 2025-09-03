/**
 * Example integration of Financial Analyst Agent with UI Components
 * Shows how to use the Financial Analyst Agent to generate data for dashboard display
 */

import React, { useState, useEffect } from 'react'
import FinancialAnalyst from '@/agents/financial-analyst'
import { FinancialHealthCard } from '@/components/business-analysis'
import { BusinessData } from '@/types/business'
import FinancialFormatter from '@/utils/financial-formatter'

interface FinancialAnalysisIntegrationProps {
  businessData: BusinessData
}

export function FinancialAnalysisIntegration({
  businessData,
}: FinancialAnalysisIntegrationProps) {
  const [analyst] = useState(() => new FinancialAnalyst())
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function performAnalysis() {
      try {
        setLoading(true)
        setError(null)

        // Import business data into the financial analyst
        const statement = analyst.importBusinessData(businessData)

        // Generate comprehensive analysis
        const report = analyst.generateAnalysisReport()

        // Format data for UI components
        const formattedData = formatAnalysisForUI(report)

        setAnalysisData(formattedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed')
        console.error('Financial analysis error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (businessData) {
      performAnalysis()
    }
  }, [businessData, analyst])

  const formatAnalysisForUI = (report: any) => {
    const { ratios, healthScore, cashFlowAnalysis, forecast } = report

    // Format financial metrics for FinancialHealthCard
    const financialMetrics = [
      {
        label: 'Revenue',
        value: FinancialFormatter.formatCurrency(report.statement.revenue),
        change: ratios.revenueGrowthRate,
        trend:
          ratios.revenueGrowthRate > 0
            ? ('up' as const)
            : ratios.revenueGrowthRate < 0
              ? ('down' as const)
              : ('stable' as const),
      },
      {
        label: 'Gross Profit Margin',
        value: FinancialFormatter.formatPercentage(ratios.grossProfitMargin),
        change: 0, // Would need historical data for change
        trend:
          ratios.grossProfitMargin > 30
            ? ('up' as const)
            : ratios.grossProfitMargin < 20
              ? ('down' as const)
              : ('stable' as const),
      },
      {
        label: 'Net Profit Margin',
        value: FinancialFormatter.formatPercentage(ratios.netProfitMargin),
        change: ratios.profitGrowthRate,
        trend:
          ratios.profitGrowthRate > 0
            ? ('up' as const)
            : ratios.profitGrowthRate < 0
              ? ('down' as const)
              : ('stable' as const),
      },
      {
        label: 'Cash Flow',
        value: FinancialFormatter.formatCurrency(
          cashFlowAnalysis.operatingCashFlow
        ),
        change: 0, // Would need historical data
        trend:
          cashFlowAnalysis.operatingCashFlow > 0
            ? ('up' as const)
            : ('down' as const),
      },
      {
        label: 'Current Ratio',
        value: FinancialFormatter.formatRatio(ratios.currentRatio),
        change: 0,
        trend:
          ratios.currentRatio > 1.5
            ? ('up' as const)
            : ratios.currentRatio < 1
              ? ('down' as const)
              : ('stable' as const),
      },
      {
        label: 'ROE',
        value: FinancialFormatter.formatPercentage(ratios.returnOnEquity),
        change: 0,
        trend:
          ratios.returnOnEquity > 15
            ? ('up' as const)
            : ratios.returnOnEquity < 5
              ? ('down' as const)
              : ('stable' as const),
      },
    ]

    // Format cash flow data
    const cashFlowData = {
      operatingCashFlow: cashFlowAnalysis.operatingCashFlow,
      freeCashFlow: cashFlowAnalysis.freeCashFlow,
      cashFlowMargin: cashFlowAnalysis.cashFlowMargin,
      predictability: cashFlowAnalysis.cashFlowPredictability,
    }

    // Format health score data
    const healthData = {
      overallScore: healthScore.overallScore,
      categoryScores: healthScore.categoryScores,
      riskLevel: healthScore.riskLevel,
      strengths: healthScore.strengths,
      weaknesses: healthScore.weaknesses,
      recommendations: healthScore.recommendations,
    }

    // Format forecast data
    const forecastData = {
      projectedRevenue: forecast.projectedRevenue,
      projectedProfit: forecast.projectedProfit,
      confidence: forecast.confidence,
      scenarios: forecast.scenarioAnalysis,
    }

    return {
      financialMetrics,
      ratios,
      cashFlowData,
      healthData,
      forecastData,
      rawReport: report,
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Analysis Error</h3>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No analysis data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Financial Health Overview */}
      <FinancialHealthCard
        title="Financial Health Analysis"
        metrics={analysisData.financialMetrics}
        period="Current Analysis"
      />

      {/* Financial Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Financial Health Score</h3>
          <div className="text-center mb-6">
            <div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-2xl font-bold ${FinancialFormatter.getHealthScoreColor(analysisData.healthData.overallScore)}`}
            >
              {analysisData.healthData.overallScore}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Risk Level:{' '}
              <span
                className={`font-medium ${FinancialFormatter.getRiskLevelColor(analysisData.healthData.riskLevel)}`}
              >
                {analysisData.healthData.riskLevel}
              </span>
            </p>
          </div>

          {/* Category Scores */}
          <div className="space-y-3">
            {Object.entries(analysisData.healthData.categoryScores).map(
              ([category, score]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium capitalize">
                    {category}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${FinancialFormatter.getHealthScoreColor(score as number)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {score as number}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>

          {analysisData.healthData.strengths.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-green-800 mb-2">
                Strengths
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                {analysisData.healthData.strengths.map(
                  (strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      {strength}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {analysisData.healthData.weaknesses.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-red-800 mb-2">
                Areas for Improvement
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {analysisData.healthData.weaknesses.map(
                  (weakness: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      {weakness}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {analysisData.healthData.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                Recommendations
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {analysisData.healthData.recommendations.map(
                  (recommendation: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {recommendation}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Cash Flow Analysis */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Cash Flow Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {FinancialFormatter.formatCurrency(
                analysisData.cashFlowData.operatingCashFlow
              )}
            </p>
            <p className="text-sm text-muted-foreground">Operating Cash Flow</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {FinancialFormatter.formatCurrency(
                analysisData.cashFlowData.freeCashFlow
              )}
            </p>
            <p className="text-sm text-muted-foreground">Free Cash Flow</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {FinancialFormatter.formatPercentage(
                analysisData.cashFlowData.cashFlowMargin
              )}
            </p>
            <p className="text-sm text-muted-foreground">Cash Flow Margin</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Cash Flow Predictability:{' '}
            <span className="font-medium">
              {analysisData.cashFlowData.predictability}
            </span>
          </p>
        </div>
      </div>

      {/* Financial Forecast */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">12-Month Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">Projections</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="font-medium">
                  {FinancialFormatter.formatCurrency(
                    analysisData.forecastData.projectedRevenue
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Profit</span>
                <span className="font-medium">
                  {FinancialFormatter.formatCurrency(
                    analysisData.forecastData.projectedProfit
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Confidence
                </span>
                <span className="font-medium">
                  {analysisData.forecastData.confidence}%
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Scenario Analysis</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-green-600">Optimistic</span>
                <span>
                  {FinancialFormatter.formatCurrency(
                    analysisData.forecastData.scenarios.optimistic.revenue
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Realistic</span>
                <span>
                  {FinancialFormatter.formatCurrency(
                    analysisData.forecastData.scenarios.realistic.revenue
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Pessimistic</span>
                <span>
                  {FinancialFormatter.formatCurrency(
                    analysisData.forecastData.scenarios.pessimistic.revenue
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialAnalysisIntegration
