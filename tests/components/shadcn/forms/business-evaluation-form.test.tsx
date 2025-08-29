import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BusinessEvaluationForm } from '@/components/calculator/business-evaluation-form'

// Import mocks
import '../../../mocks/shadcn-mocks'

// Mock valuation engine
const mockCalculateValuation = jest.fn()
jest.mock('@/lib/valuation-engine', () => ({
  calculateValuation: mockCalculateValuation,
}))

// Mock form validation
jest.mock('@/lib/form-validation', () => ({
  validateBusinessData: jest.fn(),
  formatCurrency: (value: number) => `$${value.toLocaleString()}`,
}))

const mockOnResults = jest.fn()
const mockOnSave = jest.fn()

const defaultProps = {
  onResults: mockOnResults,
  onSave: mockOnSave,
}

describe('BusinessEvaluationForm Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCalculateValuation.mockResolvedValue({
      overallValuation: 1000000,
      confidenceScore: 85,
      methods: [],
      keyMetrics: {},
      adjustmentFactors: {},
      recommendations: [],
      riskFactors: [],
    })
  })

  describe('Multi-Step Form Navigation', () => {
    it('renders basic info step by default', () => {
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      expect(screen.getByText(/basic information/i)).toBeInTheDocument()
      expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/business name/i)).toBeInTheDocument()
    })

    it('navigates through form steps', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Fill basic info
      await user.type(screen.getByLabelText(/business name/i), 'Test Business')
      await user.selectOptions(screen.getByLabelText(/industry/i), 'Technology')
      await user.type(screen.getByLabelText(/description/i), 'A test business')
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      // Should show business details step
      await waitFor(() => {
        expect(screen.getByText(/business details/i)).toBeInTheDocument()
        expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument()
      })
    })

    it('can navigate back to previous steps', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Fill basic info and go to step 2
      await user.type(screen.getByLabelText(/business name/i), 'Test Business')
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument()
      })
      
      // Click back button
      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)
      
      await waitFor(() => {
        expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument()
        expect(screen.getByDisplayValue('Test Business')).toBeInTheDocument()
      })
    })

    it('shows progress indicator', () => {
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33')
    })
  })

  describe('Form Validation', () => {
    it('validates required fields in basic info step', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/business name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/industry is required/i)).toBeInTheDocument()
      })
      
      // Should not advance to next step
      expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument()
    })

    it('validates business details step', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Complete basic info
      await user.type(screen.getByLabelText(/business name/i), 'Test Business')
      await user.selectOptions(screen.getByLabelText(/industry/i), 'Technology')
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      // Try to proceed without filling business details
      await waitFor(async () => {
        const nextButton = screen.getByRole('button', { name: /next/i })
        await user.click(nextButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/annual revenue is required/i)).toBeInTheDocument()
        expect(screen.getByText(/number of employees is required/i)).toBeInTheDocument()
      })
    })

    it('validates financial data step', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Complete basic info
      await user.type(screen.getByLabelText(/business name/i), 'Test Business')
      await user.selectOptions(screen.getByLabelText(/industry/i), 'Technology')
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      // Complete business details
      await waitFor(async () => {
        await user.type(screen.getByLabelText(/annual revenue/i), '1000000')
        await user.type(screen.getByLabelText(/employees/i), '25')
        await user.click(screen.getByRole('button', { name: /next/i }))
      })
      
      // Try to calculate without financial data
      await waitFor(async () => {
        const calculateButton = screen.getByRole('button', { name: /calculate valuation/i })
        await user.click(calculateButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/net profit is required/i)).toBeInTheDocument()
        expect(screen.getByText(/assets value is required/i)).toBeInTheDocument()
      })
    })

    it('validates numeric fields with proper ranges', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Complete basic info and go to business details
      await user.type(screen.getByLabelText(/business name/i), 'Test Business')
      await user.selectOptions(screen.getByLabelText(/industry/i), 'Technology')
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(async () => {
        // Test negative revenue
        await user.type(screen.getByLabelText(/annual revenue/i), '-1000')
        const nextButton = screen.getByRole('button', { name: /next/i })
        await user.click(nextButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/revenue must be a positive number/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Data Persistence', () => {
    it('preserves data when navigating between steps', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Fill basic info
      await user.type(screen.getByLabelText(/business name/i), 'Test Business')
      await user.selectOptions(screen.getByLabelText(/industry/i), 'Technology')
      await user.type(screen.getByLabelText(/description/i), 'Test description')
      
      // Go to next step
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      // Go back
      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: /back/i }))
      })
      
      // Data should be preserved
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Business')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
      })
    })

    it('saves form as draft', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Fill some data
      await user.type(screen.getByLabelText(/business name/i), 'Draft Business')
      
      // Save draft
      const saveButton = screen.getByRole('button', { name: /save draft/i })
      await user.click(saveButton)
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          businessName: 'Draft Business',
        })
      )
    })
  })

  describe('Form Calculation', () => {
    it('calculates valuation with complete data', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Complete all steps
      await user.type(screen.getByLabelText(/business name/i), 'Test Business')
      await user.selectOptions(screen.getByLabelText(/industry/i), 'Technology')
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(async () => {
        await user.type(screen.getByLabelText(/annual revenue/i), '1000000')
        await user.type(screen.getByLabelText(/employees/i), '25')
        await user.click(screen.getByRole('button', { name: /next/i }))
      })
      
      await waitFor(async () => {
        await user.type(screen.getByLabelText(/net profit/i), '200000')
        await user.type(screen.getByLabelText(/assets/i), '500000')
        await user.type(screen.getByLabelText(/liabilities/i), '100000')
        
        const calculateButton = screen.getByRole('button', { name: /calculate valuation/i })
        await user.click(calculateButton)
      })
      
      await waitFor(() => {
        expect(mockCalculateValuation).toHaveBeenCalledWith(
          expect.objectContaining({
            businessName: 'Test Business',
            industry: 'Technology',
            annualRevenue: 1000000,
            employees: 25,
            netProfit: 200000,
            assets: 500000,
            liabilities: 100000,
          })
        )
        
        expect(mockOnResults).toHaveBeenCalled()
      })
    })

    it('shows loading state during calculation', async () => {
      const user = userEvent.setup()
      mockCalculateValuation.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Fill all required data quickly
      await fillCompleteForm(user)
      
      const calculateButton = screen.getByRole('button', { name: /calculate valuation/i })
      await user.click(calculateButton)
      
      expect(screen.getByText(/calculating/i)).toBeInTheDocument()
      expect(calculateButton).toBeDisabled()
    })

    it('handles calculation errors gracefully', async () => {
      const user = userEvent.setup()
      mockCalculateValuation.mockRejectedValue(new Error('Calculation failed'))
      
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      await fillCompleteForm(user)
      
      const calculateButton = screen.getByRole('button', { name: /calculate valuation/i })
      await user.click(calculateButton)
      
      await waitFor(() => {
        expect(screen.getByText(/calculation failed/i)).toBeInTheDocument()
      })
      
      // Form should be re-enabled
      expect(calculateButton).not.toBeDisabled()
    })
  })

  describe('Advanced Features', () => {
    it('shows optional fields toggle', () => {
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      const toggleButton = screen.getByRole('button', { name: /show advanced options/i })
      expect(toggleButton).toBeInTheDocument()
    })

    it('shows advanced fields when toggled', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      const toggleButton = screen.getByRole('button', { name: /show advanced options/i })
      await user.click(toggleButton)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/market conditions/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/growth rate/i)).toBeInTheDocument()
      })
    })

    it('provides field help tooltips', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      const helpIcon = screen.getByRole('button', { name: /help for annual revenue/i })
      await user.hover(helpIcon)
      
      await waitFor(() => {
        expect(screen.getByText(/total income generated by your business/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper form structure and labels', () => {
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByLabelText(/business name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/industry/i)).toBeInTheDocument()
    })

    it('associates error messages with form fields', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/business name/i)
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
        expect(nameInput).toHaveAttribute('aria-describedby')
      })
    })

    it('announces step changes to screen readers', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Complete basic info
      await user.type(screen.getByLabelText(/business name/i), 'Test Business')
      await user.selectOptions(screen.getByLabelText(/industry/i), 'Technology')
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/step 2 of 3/i)
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      const nameInput = screen.getByLabelText(/business name/i)
      const industrySelect = screen.getByLabelText(/industry/i)
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      nameInput.focus()
      expect(nameInput).toHaveFocus()
      
      await user.tab()
      expect(industrySelect).toHaveFocus()
      
      await user.tab()
      await user.tab() // Skip description
      expect(nextButton).toHaveFocus()
    })
  })

  describe('Responsive Behavior', () => {
    it('adjusts layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Form should render without layout issues
      expect(screen.getByText(/basic information/i)).toBeInTheDocument()
    })

    it('maintains functionality on different screen sizes', async () => {
      const user = userEvent.setup()
      
      // Test on tablet size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Form navigation should still work
      await user.type(screen.getByLabelText(/business name/i), 'Test Business')
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Export and Import', () => {
    it('exports form data', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      // Fill some data
      await user.type(screen.getByLabelText(/business name/i), 'Export Test')
      
      const exportButton = screen.getByRole('button', { name: /export data/i })
      await user.click(exportButton)
      
      // Should trigger download or copy to clipboard
      expect(mockOnSave).toHaveBeenCalled()
    })

    it('imports form data from file', async () => {
      const user = userEvent.setup()
      render(<BusinessEvaluationForm {...defaultProps} />)
      
      const importButton = screen.getByRole('button', { name: /import data/i })
      const fileInput = screen.getByLabelText(/import file/i)
      
      const file = new File(['{"businessName":"Imported Business"}'], 'data.json', {
        type: 'application/json',
      })
      
      await user.upload(fileInput, file)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Imported Business')).toBeInTheDocument()
      })
    })
  })

  // Helper function to fill complete form
  async function fillCompleteForm(user: any) {
    // Step 1
    await user.type(screen.getByLabelText(/business name/i), 'Test Business')
    await user.selectOptions(screen.getByLabelText(/industry/i), 'Technology')
    await user.click(screen.getByRole('button', { name: /next/i }))
    
    // Step 2
    await waitFor(async () => {
      await user.type(screen.getByLabelText(/annual revenue/i), '1000000')
      await user.type(screen.getByLabelText(/employees/i), '25')
      await user.click(screen.getByRole('button', { name: /next/i }))
    })
    
    // Step 3
    await waitFor(async () => {
      await user.type(screen.getByLabelText(/net profit/i), '200000')
      await user.type(screen.getByLabelText(/assets/i), '500000')
      await user.type(screen.getByLabelText(/liabilities/i), '100000')
    })
  }
})