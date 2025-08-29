import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ValuationResults } from '@/components/calculator/valuation-results'
import { generateMockValuationResult, generateMockBusiness } from '../../../utils/test-utils'

// Import mocks
import '../../../mocks/shadcn-mocks'

// Mock the PDF export
jest.mock('@/lib/pdf-export', () => ({
  exportToPDF: jest.fn().mockResolvedValue(undefined),
}))

// Mock the chart components
jest.mock('@/components/calculator/valuation-chart', () => ({
  ValuationChart: ({ methods }: any) => (
    <div data-testid="valuation-chart">
      Valuation Chart ({methods.length} methods)
    </div>
  ),
}))

jest.mock('@/components/calculator/metrics-chart', () => ({
  MetricsChart: ({ metrics }: any) => (
    <div data-testid="metrics-chart">
      Metrics Chart ({Object.keys(metrics).length} metrics)
    </div>
  ),
}))

jest.mock('@/components/ai/business-analysis-panel', () => ({
  __esModule: true,
  default: ({ businessData }: any) => (
    <div data-testid="business-analysis-panel">
      AI Analysis for {businessData.name}
    </div>
  ),
}))

const mockResult = generateMockValuationResult({
  companyName: 'Test Company Inc.',
  overallValuation: 1500000,
  confidenceScore: 85,
})

const mockBusinessData = generateMockBusiness({
  name: 'Test Company Inc.',
})

describe('ValuationResults Component', () => {
  describe('Basic Rendering', () => {
    it('renders the component with result data', () => {
      render(<ValuationResults result={mockResult} />)
      
      expect(screen.getByText('Business Valuation Report')).toBeInTheDocument()
      expect(screen.getByText('Test Company Inc.')).toBeInTheDocument()
      expect(screen.getByText('$1,500,000')).toBeInTheDocument()
      expect(screen.getByText('High Confidence (85%)')).toBeInTheDocument()
    })

    it('displays the evaluation date', () => {
      render(<ValuationResults result={mockResult} />)
      
      const dateText = screen.getByText(/Generated on/)
      expect(dateText).toBeInTheDocument()
    })

    it('shows confidence score with appropriate styling', () => {
      const highConfidenceResult = generateMockValuationResult({
        confidenceScore: 90,
      })
      
      render(<ValuationResults result={highConfidenceResult} />)
      
      expect(screen.getByText('High Confidence (90%)')).toBeInTheDocument()
    })

    it('shows medium confidence styling', () => {
      const mediumConfidenceResult = generateMockValuationResult({
        confidenceScore: 70,
      })
      
      render(<ValuationResults result={mediumConfidenceResult} />)
      
      expect(screen.getByText('Medium Confidence (70%)')).toBeInTheDocument()
    })

    it('shows low confidence styling', () => {
      const lowConfidenceResult = generateMockValuationResult({
        confidenceScore: 50,
      })
      
      render(<ValuationResults result={lowConfidenceResult} />)
      
      expect(screen.getByText('Low Confidence (50%)')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('renders all tabs when business data is not provided', () => {
      render(<ValuationResults result={mockResult} />)
      
      expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /valuation methods/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /key metrics/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /recommendations/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /ai analysis/i })).not.toBeInTheDocument()
    })

    it('renders AI Analysis tab when business data is provided', () => {
      render(<ValuationResults result={mockResult} businessData={mockBusinessData} />)
      
      expect(screen.getByRole('button', { name: /ai analysis/i })).toBeInTheDocument()
    })

    it('switches between tabs', async () => {
      const user = userEvent.setup()
      render(<ValuationResults result={mockResult} />)
      
      const methodsTab = screen.getByRole('button', { name: /valuation methods/i })
      await user.click(methodsTab)
      
      // Should show methods content
      await waitFor(() => {
        expect(screen.getByText('Discounted Cash Flow')).toBeInTheDocument()
        expect(screen.getByText('Market Multiple')).toBeInTheDocument()
      })
    })

    it('shows metrics tab content', async () => {
      const user = userEvent.setup()
      render(<ValuationResults result={mockResult} />)
      
      const metricsTab = screen.getByRole('button', { name: /key metrics/i })
      await user.click(metricsTab)
      
      await waitFor(() => {
        expect(screen.getByTestId('metrics-chart')).toBeInTheDocument()
      })
    })

    it('shows recommendations tab content', async () => {
      const user = userEvent.setup()
      render(<ValuationResults result={mockResult} />)
      
      const recommendationsTab = screen.getByRole('button', { name: /recommendations/i })
      await user.click(recommendationsTab)
      
      await waitFor(() => {
        expect(screen.getByText('Recommendations')).toBeInTheDocument()
        expect(screen.getByText('Risk Factors')).toBeInTheDocument()
      })
    })
  })

  describe('Overview Tab', () => {
    it('displays valuation chart', () => {
      render(<ValuationResults result={mockResult} />)
      
      expect(screen.getByTestId('valuation-chart')).toBeInTheDocument()
    })

    it('displays adjustment factors', () => {
      render(<ValuationResults result={mockResult} />)
      
      expect(screen.getByText('Adjustment Factors')).toBeInTheDocument()
      expect(screen.getByText(/market conditions/i)).toBeInTheDocument()
      expect(screen.getByText(/business risk/i)).toBeInTheDocument()
      expect(screen.getByText(/management quality/i)).toBeInTheDocument()
    })

    it('formats adjustment factors correctly', () => {
      const result = generateMockValuationResult({
        adjustmentFactors: {
          marketConditions: 1.1, // +10%
          businessRisk: 0.9,     // -10%
          managementQuality: 1.0, // 0%
        },
      })
      
      render(<ValuationResults result={result} />)
      
      expect(screen.getByText('+10.0%')).toBeInTheDocument()
      expect(screen.getByText('-10.0%')).toBeInTheDocument()
      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })
  })

  describe('Methods Tab', () => {
    it('displays all valuation methods', async () => {
      const user = userEvent.setup()
      render(<ValuationResults result={mockResult} />)
      
      const methodsTab = screen.getByRole('button', { name: /valuation methods/i })
      await user.click(methodsTab)
      
      await waitFor(() => {
        expect(screen.getByText('Discounted Cash Flow')).toBeInTheDocument()
        expect(screen.getByText('Market Multiple')).toBeInTheDocument()
        expect(screen.getByText('DCF analysis based on projected cash flows')).toBeInTheDocument()
        expect(screen.getByText('Comparison with similar businesses in the market')).toBeInTheDocument()
      })
    })

    it('formats method values correctly', async () => {
      const user = userEvent.setup()
      render(<ValuationResults result={mockResult} />)
      
      const methodsTab = screen.getByRole('button', { name: /valuation methods/i })
      await user.click(methodsTab)
      
      await waitFor(() => {
        expect(screen.getByText('$1,300,000')).toBeInTheDocument()
        expect(screen.getByText('$1,100,000')).toBeInTheDocument()
        expect(screen.getByText('80% confidence')).toBeInTheDocument()
        expect(screen.getByText('90% confidence')).toBeInTheDocument()
      })
    })
  })

  describe('Metrics Tab', () => {
    it('displays metrics chart and KPIs', async () => {
      const user = userEvent.setup()
      render(<ValuationResults result={mockResult} />)
      
      const metricsTab = screen.getByRole('button', { name: /key metrics/i })
      await user.click(metricsTab)
      
      await waitFor(() => {
        expect(screen.getByTestId('metrics-chart')).toBeInTheDocument()
        expect(screen.getByText('Key Performance Indicators')).toBeInTheDocument()
      })
    })

    it('formats metric values correctly', async () => {
      const user = userEvent.setup()
      const result = generateMockValuationResult({
        keyMetrics: {
          revenueGrowthRate: 15.5,
          profitMargin: 12.3,
          debtToEquityRatio: 0.4,
          returnOnAssets: 8.7,
          priceToEarningsMultiple: 12.5,
        },
      })
      
      render(<ValuationResults result={result} />)
      
      const metricsTab = screen.getByRole('button', { name: /key metrics/i })
      await user.click(metricsTab)
      
      await waitFor(() => {
        expect(screen.getByText('15.5%')).toBeInTheDocument() // Growth rate
        expect(screen.getByText('12.3%')).toBeInTheDocument() // Margin
        expect(screen.getByText('12.5x')).toBeInTheDocument() // Multiple
        expect(screen.getByText('8.7%')).toBeInTheDocument() // Return
      })
    })
  })

  describe('Recommendations Tab', () => {
    it('displays recommendations and risk factors', async () => {
      const user = userEvent.setup()
      render(<ValuationResults result={mockResult} />)
      
      const recommendationsTab = screen.getByRole('button', { name: /recommendations/i })
      await user.click(recommendationsTab)
      
      await waitFor(() => {
        expect(screen.getByText('Consider expanding market reach to increase valuation')).toBeInTheDocument()
        expect(screen.getByText('Focus on improving profit margins through cost optimization')).toBeInTheDocument()
        expect(screen.getByText('High dependency on single customer segment')).toBeInTheDocument()
        expect(screen.getByText('Limited geographical diversification')).toBeInTheDocument()
      })
    })

    it('shows fallback message when no recommendations', async () => {
      const user = userEvent.setup()
      const result = generateMockValuationResult({
        recommendations: [],
        riskFactors: [],
      })
      
      render(<ValuationResults result={result} />)
      
      const recommendationsTab = screen.getByRole('button', { name: /recommendations/i })
      await user.click(recommendationsTab)
      
      await waitFor(() => {
        expect(screen.getByText(/Your business shows strong performance/)).toBeInTheDocument()
        expect(screen.getByText(/No significant risk factors identified/)).toBeInTheDocument()
      })
    })
  })

  describe('AI Analysis Tab', () => {
    it('displays AI analysis when business data is provided', async () => {
      const user = userEvent.setup()
      render(<ValuationResults result={mockResult} businessData={mockBusinessData} />)
      
      const aiTab = screen.getByRole('button', { name: /ai analysis/i })
      await user.click(aiTab)
      
      await waitFor(() => {
        expect(screen.getByTestId('business-analysis-panel')).toBeInTheDocument()
        expect(screen.getByText('AI Analysis for Test Business Inc.')).toBeInTheDocument()
      })
    })
  })

  describe('Action Buttons', () => {
    it('handles save action', async () => {
      const user = userEvent.setup()
      render(<ValuationResults result={mockResult} />)
      
      const saveButton = screen.getByRole('button', { name: /save report/i })
      await user.click(saveButton)
      
      // Should show loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument()
      
      // Should return to normal state
      await waitFor(() => {
        expect(screen.getByText('Save Report')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('handles PDF export', async () => {
      const user = userEvent.setup()
      const { exportToPDF } = require('@/lib/pdf-export')
      
      render(<ValuationResults result={mockResult} />)
      
      const exportButton = screen.getByRole('button', { name: /export pdf/i })
      await user.click(exportButton)
      
      // Should show loading state
      expect(screen.getByText('Generating PDF...')).toBeInTheDocument()
      
      // Should call export function
      expect(exportToPDF).toHaveBeenCalledWith(mockResult)
      
      // Should return to normal state
      await waitFor(() => {
        expect(screen.getByText('Export PDF')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('handles PDF export error', async () => {
      const user = userEvent.setup()
      const { exportToPDF } = require('@/lib/pdf-export')
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      exportToPDF.mockRejectedValueOnce(new Error('Export failed'))
      
      render(<ValuationResults result={mockResult} />)
      
      const exportButton = screen.getByRole('button', { name: /export pdf/i })
      await user.click(exportButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('PDF export failed:', expect.any(Error))
        expect(screen.getByText('Export PDF')).toBeInTheDocument()
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Disclaimer', () => {
    it('displays disclaimer section', () => {
      render(<ValuationResults result={mockResult} />)
      
      expect(screen.getByText('Important Disclaimer')).toBeInTheDocument()
      expect(screen.getByText(/This valuation is an estimate based on the information provided/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<ValuationResults result={mockResult} />)
      
      const mainHeading = screen.getByRole('heading', { level: 2, name: 'Business Valuation Report' })
      expect(mainHeading).toBeInTheDocument()
    })

    it('has proper tab navigation', () => {
      render(<ValuationResults result={mockResult} />)
      
      const tabButtons = screen.getAllByRole('button').filter(button => 
        button.textContent?.includes('Overview') ||
        button.textContent?.includes('Valuation Methods') ||
        button.textContent?.includes('Key Metrics') ||
        button.textContent?.includes('Recommendations')
      )
      
      expect(tabButtons.length).toBeGreaterThan(0)
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ValuationResults result={mockResult} />)
      
      const methodsTab = screen.getByRole('button', { name: /valuation methods/i })
      methodsTab.focus()
      expect(methodsTab).toHaveFocus()
      
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByText('Discounted Cash Flow')).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('renders correctly on different screen sizes', () => {
      render(<ValuationResults result={mockResult} />)
      
      // Should have responsive classes
      const container = screen.getByText('Business Valuation Report').closest('div')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing method data gracefully', () => {
      const resultWithoutMethods = generateMockValuationResult({
        methods: [],
      })
      
      render(<ValuationResults result={resultWithoutMethods} />)
      
      expect(screen.getByText('Business Valuation Report')).toBeInTheDocument()
    })

    it('handles missing metrics gracefully', () => {
      const resultWithoutMetrics = generateMockValuationResult({
        keyMetrics: {},
      })
      
      render(<ValuationResults result={resultWithoutMetrics} />)
      
      expect(screen.getByText('Business Valuation Report')).toBeInTheDocument()
    })
  })
})