import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import { ValidationFeedback, FieldValidationWrapper, FormField } from '../../../src/components/forms/ValidationFeedback'
import { ValidationError } from '../../../src/hooks/use-form-validation'

describe('ValidationFeedback', () => {
  const mockError: ValidationError = {
    field: 'title',
    message: 'This field is required',
    type: 'error'
  }

  const mockWarning: ValidationError = {
    field: 'revenue',
    message: 'This value seems high',
    type: 'warning'
  }

  const mockInfo: ValidationError = {
    field: 'description',
    message: 'Consider adding more detail',
    type: 'info'
  }

  it('should render error messages with correct styling', () => {
    render(<ValidationFeedback error={mockError} />)
    
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByRole('text')).toHaveClass('text-red-600')
  })

  it('should render warning messages with correct styling', () => {
    render(<ValidationFeedback warning={mockWarning} />)
    
    expect(screen.getByText('This value seems high')).toBeInTheDocument()
    expect(screen.getByRole('text')).toHaveClass('text-yellow-600')
  })

  it('should render info messages with correct styling', () => {
    render(<ValidationFeedback warning={mockInfo} />)
    
    expect(screen.getByText('Consider adding more detail')).toBeInTheDocument()
    expect(screen.getByRole('text')).toHaveClass('text-blue-600')
  })

  it('should prioritize errors over warnings', () => {
    render(<ValidationFeedback error={mockError} warning={mockWarning} />)
    
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.queryByText('This value seems high')).not.toBeInTheDocument()
  })

  it('should show success state when valid and showSuccess is true', () => {
    render(<ValidationFeedback showSuccess={true} isValid={true} />)
    
    expect(screen.getByText('Looks good!')).toBeInTheDocument()
    expect(screen.getByRole('text')).toHaveClass('text-green-600')
  })

  it('should not render anything when no message and showSuccess is false', () => {
    const { container } = render(<ValidationFeedback />)
    
    expect(container.firstChild).toBeNull()
  })
})

describe('FieldValidationWrapper', () => {
  const mockError: ValidationError = {
    field: 'email',
    message: 'Invalid email format',
    type: 'error'
  }

  it('should apply error styling to input elements', () => {
    render(
      <FieldValidationWrapper field="email" error={mockError}>
        <input type="email" data-testid="email-input" />
      </FieldValidationWrapper>
    )
    
    const input = screen.getByTestId('email-input')
    expect(input).toHaveClass('border-red-300', 'focus:border-red-500', 'focus:ring-red-500')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-validation')
  })

  it('should apply warning styling to input elements', () => {
    render(
      <FieldValidationWrapper field="revenue" warning={mockWarning}>
        <input type="number" data-testid="revenue-input" />
      </FieldValidationWrapper>
    )
    
    const input = screen.getByTestId('revenue-input')
    expect(input).toHaveClass('border-yellow-300', 'focus:border-yellow-500', 'focus:ring-yellow-500')
  })

  it('should apply success styling when valid and showSuccess is true', () => {
    render(
      <FieldValidationWrapper field="title" showSuccess={true}>
        <input type="text" data-testid="title-input" />
      </FieldValidationWrapper>
    )
    
    const input = screen.getByTestId('title-input')
    expect(input).toHaveClass('border-green-300', 'focus:border-green-500', 'focus:ring-green-500')
  })

  it('should preserve existing className on child elements', () => {
    render(
      <FieldValidationWrapper field="title" error={mockError}>
        <input className="custom-class" data-testid="title-input" />
      </FieldValidationWrapper>
    )
    
    const input = screen.getByTestId('title-input')
    expect(input).toHaveClass('custom-class')
    expect(input).toHaveClass('border-red-300')
  })

  it('should work with different input types', () => {
    render(
      <FieldValidationWrapper field="description" error={mockError}>
        <textarea data-testid="description-textarea" />
        <select data-testid="category-select">
          <option>Option 1</option>
        </select>
        <div data-testid="other-element">Not an input</div>
      </FieldValidationWrapper>
    )
    
    // Should apply styling to textarea and select
    expect(screen.getByTestId('description-textarea')).toHaveClass('border-red-300')
    expect(screen.getByTestId('category-select')).toHaveClass('border-red-300')
    
    // Should not apply styling to div
    expect(screen.getByTestId('other-element')).not.toHaveClass('border-red-300')
  })
})

describe('FormField', () => {
  const mockError: ValidationError = {
    field: 'businessName',
    message: 'Business name is required',
    type: 'error'
  }

  it('should render label with required indicator', () => {
    render(
      <FormField label="Business Name" field="businessName" required={true}>
        <input type="text" />
      </FormField>
    )
    
    expect(screen.getByText('Business Name')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('*')).toHaveClass('text-red-500')
  })

  it('should render description when provided', () => {
    render(
      <FormField 
        label="Business Name" 
        field="businessName" 
        description="Enter the legal name of your business"
      >
        <input type="text" />
      </FormField>
    )
    
    expect(screen.getByText('Enter the legal name of your business')).toBeInTheDocument()
  })

  it('should integrate validation feedback', () => {
    render(
      <FormField label="Business Name" field="businessName" error={mockError}>
        <input type="text" data-testid="business-input" />
      </FormField>
    )
    
    expect(screen.getByText('Business name is required')).toBeInTheDocument()
    expect(screen.getByTestId('business-input')).toHaveClass('border-red-300')
  })

  it('should associate label with input via htmlFor', () => {
    render(
      <FormField label="Business Name" field="businessName">
        <input id="businessName" type="text" />
      </FormField>
    )
    
    const label = screen.getByLabelText('Business Name')
    expect(label).toHaveAttribute('id', 'businessName')
  })

  it('should apply custom className', () => {
    render(
      <FormField 
        label="Business Name" 
        field="businessName" 
        className="custom-field-class"
      >
        <input type="text" />
      </FormField>
    )
    
    const container = screen.getByText('Business Name').closest('div')
    expect(container).toHaveClass('custom-field-class')
  })

  it('should show success state when showSuccess is enabled', () => {
    render(
      <FormField 
        label="Business Name" 
        field="businessName" 
        showSuccess={true}
      >
        <input type="text" data-testid="business-input" />
      </FormField>
    )
    
    expect(screen.getByText('Looks good!')).toBeInTheDocument()
    expect(screen.getByTestId('business-input')).toHaveClass('border-green-300')
  })
})