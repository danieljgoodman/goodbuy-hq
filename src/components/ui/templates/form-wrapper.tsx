'use client'

import * as React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * Form field types supported by the form wrapper
 */
export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file'

/**
 * Validation rule interface
 */
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  email?: boolean
  custom?: (value: any) => string | null
}

/**
 * Field definition for form generation
 */
export interface FormField {
  id: string
  name: string
  label: string
  type: FieldType
  placeholder?: string
  defaultValue?: any
  required?: boolean
  validation?: ValidationRule
  options?: { label: string; value: any }[] // For select/radio fields
  description?: string
  disabled?: boolean
  autoComplete?: string
  className?: string
}

/**
 * Form data structure
 */
export interface FormData {
  [key: string]: any
}

/**
 * Form validation errors
 */
export interface FormErrors {
  [key: string]: string
}

/**
 * Props for FormWrapper component
 */
export interface FormWrapperProps {
  /** Form title */
  title: string
  /** Form description */
  description?: string
  /** Form fields configuration */
  fields: FormField[]
  /** Initial form data */
  initialData?: FormData
  /** Submit button text */
  submitText?: string
  /** Cancel button text */
  cancelText?: string
  /** Loading state */
  isLoading?: boolean
  /** Show cancel button */
  showCancel?: boolean
  /** Form layout variant */
  variant?: 'default' | 'compact' | 'split' | 'modal'
  /** Custom CSS classes */
  className?: string
  /** Form submission handler */
  onSubmit: (data: FormData) => Promise<void> | void
  /** Cancel handler */
  onCancel?: () => void
  /** Field value change handler */
  onChange?: (field: string, value: any, formData: FormData) => void
  /** Custom validation handler */
  onValidate?: (data: FormData) => FormErrors
}

/**
 * FormWrapper Component
 *
 * Comprehensive form wrapper component for GoodBuy HQ platform.
 * Provides standardized form layouts, validation, error handling,
 * and submission logic for business data collection.
 *
 * Features:
 * - Dynamic field generation based on configuration
 * - Built-in validation with custom rules
 * - Multiple layout variants (default, compact, split, modal)
 * - Professional styling consistent with GoodBuy HQ design
 * - Loading states and error handling
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Form state management with controlled components
 *
 * @example
 * ```tsx
 * const businessFields = [
 *   {
 *     id: 'businessName',
 *     name: 'businessName',
 *     label: 'Business Name',
 *     type: 'text',
 *     required: true,
 *     validation: { required: true, minLength: 2 }
 *   },
 *   {
 *     id: 'industry',
 *     name: 'industry',
 *     label: 'Industry',
 *     type: 'select',
 *     options: industriesList,
 *     required: true
 *   }
 * ]
 *
 * <FormWrapper
 *   title="Business Registration"
 *   description="Enter your business information"
 *   fields={businessFields}
 *   onSubmit={handleBusinessSubmit}
 *   variant="split"
 * />
 * ```
 */
export function FormWrapper({
  title,
  description,
  fields,
  initialData = {},
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  showCancel = false,
  variant = 'default',
  className,
  onSubmit,
  onCancel,
  onChange,
  onValidate,
}: FormWrapperProps) {
  // Form state
  const [formData, setFormData] = React.useState<FormData>(initialData)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [touched, setTouched] = React.useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Validate individual field
  const validateField = React.useCallback(
    (field: FormField, value: any): string | null => {
      const { validation, required } = field
      if (!validation && !required) return null

      // Required validation
      if (
        required &&
        (!value || (typeof value === 'string' && value.trim() === ''))
      ) {
        return `${field.label} is required`
      }

      if (!validation || !value) return null

      // String validations
      if (typeof value === 'string') {
        if (validation.minLength && value.length < validation.minLength) {
          return `${field.label} must be at least ${validation.minLength} characters`
        }
        if (validation.maxLength && value.length > validation.maxLength) {
          return `${field.label} must be no more than ${validation.maxLength} characters`
        }
        if (validation.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return `${field.label} must be a valid email address`
        }
        if (validation.pattern && !validation.pattern.test(value)) {
          return `${field.label} format is invalid`
        }
      }

      // Number validations
      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          return `${field.label} must be at least ${validation.min}`
        }
        if (validation.max !== undefined && value > validation.max) {
          return `${field.label} must be no more than ${validation.max}`
        }
      }

      // Custom validation
      if (validation.custom) {
        return validation.custom(value)
      }

      return null
    },
    []
  )

  // Validate all fields
  const validateForm = React.useCallback((): FormErrors => {
    const newErrors: FormErrors = {}

    fields.forEach(field => {
      const error = validateField(field, formData[field.name])
      if (error) {
        newErrors[field.name] = error
      }
    })

    // Custom form validation
    if (onValidate) {
      const customErrors = onValidate(formData)
      Object.assign(newErrors, customErrors)
    }

    return newErrors
  }, [fields, formData, validateField, onValidate])

  // Handle field change
  const handleFieldChange = (field: FormField, value: any) => {
    const newFormData = { ...formData, [field.name]: value }
    setFormData(newFormData)

    // Clear error when user starts typing
    if (errors[field.name]) {
      setErrors(prev => ({ ...prev, [field.name]: '' }))
    }

    // Call external change handler
    onChange?.(field.name, value, newFormData)
  }

  // Handle field blur
  const handleFieldBlur = (field: FormField) => {
    setTouched(prev => ({ ...prev, [field.name]: true }))
    const error = validateField(field, formData[field.name])
    if (error) {
      setErrors(prev => ({ ...prev, [field.name]: error }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formErrors = validateForm()
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      // Mark all fields as touched to show errors
      const allTouched = fields.reduce(
        (acc, field) => ({ ...acc, [field.name]: true }),
        {}
      )
      setTouched(allTouched)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render field based on type
  const renderField = (field: FormField) => {
    const hasError = touched[field.name] && errors[field.name]
    const fieldValue = formData[field.name] ?? field.defaultValue ?? ''

    const commonProps = {
      id: field.id,
      name: field.name,
      disabled: field.disabled || isLoading || isSubmitting,
      autoComplete: field.autoComplete,
      className: cn(
        'transition-all duration-200',
        hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        field.className
      ),
      'aria-invalid': hasError ? true : false,
      'aria-describedby': hasError ? `${field.id}-error` : undefined,
    }

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={fieldValue}
            placeholder={field.placeholder}
            onChange={e => handleFieldChange(field, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            rows={4}
            className={cn(
              'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              commonProps.className
            )}
          />
        )

      case 'select':
        return (
          <select
            {...commonProps}
            value={fieldValue}
            onChange={e => handleFieldChange(field, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              commonProps.className
            )}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              {...commonProps}
              type="checkbox"
              checked={!!fieldValue}
              onChange={e => handleFieldChange(field, e.target.checked)}
              onBlur={() => handleFieldBlur(field)}
              className={cn(
                'h-4 w-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                commonProps.className
              )}
            />
            <label
              htmlFor={field.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </label>
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  {...commonProps}
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  value={option.value}
                  checked={fieldValue === option.value}
                  onChange={e => handleFieldChange(field, e.target.value)}
                  onBlur={() => handleFieldBlur(field)}
                  className="h-4 w-4 border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <label
                  htmlFor={`${field.id}-${option.value}`}
                  className="text-sm font-medium leading-none"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        )

      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={fieldValue}
            placeholder={field.placeholder}
            onChange={e => {
              const value =
                field.type === 'number'
                  ? parseFloat(e.target.value) || 0
                  : e.target.value
              handleFieldChange(field, value)
            }}
            onBlur={() => handleFieldBlur(field)}
          />
        )
    }
  }

  // Get form layout classes
  const getFormLayout = () => {
    switch (variant) {
      case 'compact':
        return 'py-4'
      case 'split':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-8'
      case 'modal':
        return 'max-w-md mx-auto'
      default:
        return ''
    }
  }

  return (
    <Card className={cn('w-full', getFormLayout(), className)}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {fields.map(field => (
            <div key={field.id} className="space-y-2">
              {field.type !== 'checkbox' && (
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
              )}

              {renderField(field)}

              {field.description && (
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
              )}

              {touched[field.name] && errors[field.name] && (
                <p
                  id={`${field.id}-error`}
                  className="text-xs text-red-600"
                  role="alert"
                >
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                submitText
              )}
            </Button>

            {showCancel && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isSubmitting}
              >
                {cancelText}
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <span className="text-red-500">*</span> Required fields
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

export default FormWrapper
