import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ValuationSummary from '@/components/business-analysis/ValuationSummary'

const mockMethods = [
  {
    name: 'DCF Analysis',
    value: 2500000,
    weight: 40,
    confidence: 85,
  },
  {
    name: 'Comparable Companies',
    value: 2200000,
    weight: 35,
    confidence: 75,
  },
  {
    name: 'Asset Based',
    value: 1800000,
    weight: 25,
    confidence: 90,
  },
]

describe('ValuationSummary', () => {
  it('renders valuation summary with final value', () => {
    render(
      <ValuationSummary
        finalValuation={2300000}
        confidenceScore={82}
        methods={mockMethods}
      />
    )

    expect(screen.getByText('Business Valuation')).toBeInTheDocument()
    expect(screen.getByText('$2.3M')).toBeInTheDocument()
    expect(screen.getByText('High Confidence')).toBeInTheDocument()
    expect(screen.getByText('82%')).toBeInTheDocument()
  })

  it('displays all valuation methods', () => {
    render(
      <ValuationSummary
        finalValuation={2300000}
        confidenceScore={82}
        methods={mockMethods}
      />
    )

    expect(screen.getByText('DCF Analysis')).toBeInTheDocument()
    expect(screen.getByText('Weight: 40%')).toBeInTheDocument()
    expect(screen.getByText('$2.5M')).toBeInTheDocument()

    expect(screen.getByText('Comparable Companies')).toBeInTheDocument()
    expect(screen.getByText('Asset Based')).toBeInTheDocument()
  })

  it('shows correct confidence levels', () => {
    const lowConfidence = render(
      <ValuationSummary
        finalValuation={2000000}
        confidenceScore={45}
        methods={mockMethods}
      />
    )

    expect(screen.getByText('Low Confidence')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <ValuationSummary
        finalValuation={2300000}
        confidenceScore={82}
        methods={mockMethods}
      />
    )

    const summary = screen.getByRole('region', {
      name: /business valuation summary/i,
    })
    expect(summary).toBeInTheDocument()
  })

  it('formats currency correctly', () => {
    render(
      <ValuationSummary
        finalValuation={1234567}
        confidenceScore={80}
        methods={mockMethods}
        currency="EUR"
      />
    )

    expect(screen.getByText(/€1\.2M/)).toBeInTheDocument()
  })
})
