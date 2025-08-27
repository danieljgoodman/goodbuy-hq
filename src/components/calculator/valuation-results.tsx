'use client'

import { useState } from 'react'
import {
  Download,
  Save,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ValuationResult } from '@/types/valuation'
import { formatCurrency } from '@/lib/utils'
import { exportToPDF } from '@/lib/pdf-export'
import { EvaluationStorage } from '@/lib/evaluation-storage'
import { ValuationChart } from './valuation-chart'
import { MetricsChart } from './metrics-chart'

interface ValuationResultsProps {
  result: ValuationResult
}

export function ValuationResults({ result }: ValuationResultsProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'methods' | 'metrics' | 'recommendations'
  >('overview')
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Implement save to user account
    setTimeout(() => setIsSaving(false), 1000)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      await exportToPDF(result)
    } catch (error) {
      console.error('PDF export failed:', error)
      // TODO: Show error notification
    }
    setIsExporting(false)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success-600 bg-success-100'
    if (confidence >= 60) return 'text-warning-600 bg-warning-100'
    return 'text-error-600 bg-error-100'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence'
    if (confidence >= 60) return 'Medium Confidence'
    return 'Low Confidence'
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Target },
    { key: 'methods', label: 'Valuation Methods', icon: BarChart3 },
    { key: 'metrics', label: 'Key Metrics', icon: PieChart },
    { key: 'recommendations', label: 'Recommendations', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-secondary-900 mb-2">
          Business Valuation Report
        </h2>
        <p className="text-secondary-600">
          {result.companyName} • Generated on{' '}
          {new Date(result.evaluationDate).toLocaleDateString()}
        </p>
      </div>

      {/* Overall Valuation Card */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50 border border-primary-200 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
          <DollarSign className="w-8 h-8 text-white" />
        </div>

        <div className="text-4xl font-bold text-secondary-900 mb-2">
          {formatCurrency(result.overallValuation)}
        </div>

        <div className="text-lg text-secondary-600 mb-4">
          Estimated Business Value
        </div>

        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidenceScore)}`}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {getConfidenceLabel(result.confidenceScore)} (
          {result.confidenceScore.toFixed(0)}%)
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          variant="outline"
          className="flex items-center space-x-2"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Report'}</span>
        </Button>

        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center space-x-2"
        >
          {isExporting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isExporting ? 'Generating PDF...' : 'Export PDF'}</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <div className="flex space-x-8">
          {tabs.map(tab => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 py-3 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-600 hover:text-primary-600'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-secondary-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Valuation Breakdown
            </h3>
            <ValuationChart methods={result.methods} />
          </div>

          <div className="bg-white border border-secondary-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Adjustment Factors
            </h3>
            <div className="space-y-4">
              {Object.entries(result.adjustmentFactors).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-secondary-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <div className="flex items-center">
                    <div
                      className={`text-sm font-medium ${
                        value > 1
                          ? 'text-success-600'
                          : value < 1
                            ? 'text-error-600'
                            : 'text-secondary-600'
                      }`}
                    >
                      {value > 1 ? '+' : ''}
                      {((value - 1) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'methods' && (
        <div className="grid gap-6">
          {result.methods.map(method => (
            <div
              key={method.name}
              className="bg-white border border-secondary-200 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">
                    {method.name}
                  </h3>
                  <p className="text-sm text-secondary-600 mt-1">
                    {method.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-secondary-900">
                    {formatCurrency(method.value)}
                  </div>
                  <div
                    className={`text-sm font-medium ${getConfidenceColor(method.confidence)}`}
                  >
                    {method.confidence.toFixed(0)}% confidence
                  </div>
                </div>
              </div>

              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${method.confidence}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-secondary-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Financial Metrics
            </h3>
            <MetricsChart metrics={result.keyMetrics} />
          </div>

          <div className="bg-white border border-secondary-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Key Performance Indicators
            </h3>
            <div className="space-y-4">
              {Object.entries(result.keyMetrics).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-secondary-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="font-medium text-secondary-900">
                    {(typeof value === 'number' && key.includes('Rate')) ||
                    key.includes('Margin') ||
                    key.includes('Return')
                      ? `${value.toFixed(1)}%`
                      : typeof value === 'number' && key.includes('Multiple')
                        ? `${value.toFixed(1)}x`
                        : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="grid gap-6">
          <div className="bg-white border border-secondary-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-success-500 mr-2" />
              Recommendations
            </h3>
            <div className="space-y-3">
              {result.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-secondary-700">{recommendation}</p>
                </div>
              ))}
            </div>

            {result.recommendations.length === 0 && (
              <p className="text-secondary-500 italic">
                Your business shows strong performance across all key metrics.
                Continue monitoring market conditions and growth opportunities.
              </p>
            )}
          </div>

          <div className="bg-white border border-secondary-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-warning-500 mr-2" />
              Risk Factors
            </h3>
            <div className="space-y-3">
              {result.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-warning-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-secondary-700">{risk}</p>
                </div>
              ))}
            </div>

            {result.riskFactors.length === 0 && (
              <p className="text-secondary-500 italic">
                No significant risk factors identified. Your business appears to
                have a stable risk profile.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-6">
        <h3 className="font-medium text-secondary-800 mb-2">
          Important Disclaimer
        </h3>
        <p className="text-sm text-secondary-600 leading-relaxed">
          This valuation is an estimate based on the information provided and
          industry benchmarks. Actual business value may vary significantly
          based on market conditions, buyer perspectives, due diligence
          findings, and other factors not captured in this analysis. For
          investment decisions or transactions, consult with qualified financial
          professionals and consider obtaining a professional business
          appraisal.
        </p>
      </div>
    </div>
  )
}
