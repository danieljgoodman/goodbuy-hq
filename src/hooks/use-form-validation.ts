import { useState, useCallback, useEffect } from 'react'
import {
  BusinessFormData,
  validateField,
  validateStep,
} from '@/lib/validation/business-form-schema'

export interface ValidationError {
  field: string
  message: string
  type: 'error' | 'warning' | 'info'
}

export interface FormValidationHookReturn {
  errors: ValidationError[]
  warnings: ValidationError[]
  isValidStep: (step: number) => boolean
  validateField: (
    field: keyof BusinessFormData,
    value: any
  ) => ValidationError[]
  validateForm: (data: Partial<BusinessFormData>) => {
    isValid: boolean
    errors: ValidationError[]
  }
  clearFieldErrors: (field: keyof BusinessFormData) => void
  clearAllErrors: () => void
  getFieldError: (field: keyof BusinessFormData) => ValidationError | undefined
  getFieldWarning: (
    field: keyof BusinessFormData
  ) => ValidationError | undefined
}

export const useFormValidation = (
  formData: Partial<BusinessFormData>
): FormValidationHookReturn => {
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [warnings, setWarnings] = useState<ValidationError[]>([])

  // Validate individual field with real-time feedback
  const validateFieldCallback = useCallback(
    (field: keyof BusinessFormData, value: any): ValidationError[] => {
      const fieldErrors = validateField(field, value)
      const validationErrors: ValidationError[] = fieldErrors.map(message => ({
        field,
        message,
        type: 'error' as const,
      }))

      // Add business logic warnings
      const fieldWarnings = generateFieldWarnings(field, value, formData)

      // Update state
      setErrors(prev => [
        ...prev.filter(err => err.field !== field),
        ...validationErrors,
      ])

      setWarnings(prev => [
        ...prev.filter(warn => warn.field !== field),
        ...fieldWarnings,
      ])

      return [...validationErrors, ...fieldWarnings]
    },
    [formData]
  )

  // Generate intelligent warnings based on business logic
  const generateFieldWarnings = useCallback(
    (
      field: keyof BusinessFormData,
      value: any,
      data: Partial<BusinessFormData>
    ): ValidationError[] => {
      const warnings: ValidationError[] = []

      switch (field) {
        case 'askingPrice':
          if (data.revenue && value) {
            const priceNum =
              parseFloat(value.toString().replace(/[,$]/g, '')) || 0
            const revenueNum =
              parseFloat(data.revenue.toString().replace(/[,$]/g, '')) || 0
            if (revenueNum > 0) {
              const multiple = priceNum / revenueNum
              if (multiple > 5) {
                warnings.push({
                  field,
                  message: `Asking price is ${multiple.toFixed(1)}x annual revenue - this may be high for most buyers`,
                  type: 'warning',
                })
              } else if (multiple < 0.5) {
                warnings.push({
                  field,
                  message: `Asking price seems low compared to annual revenue - consider reviewing`,
                  type: 'info',
                })
              }
            }
          }
          break

        case 'profit':
          if (data.revenue && value) {
            const profitNum =
              parseFloat(value.toString().replace(/[,$]/g, '')) || 0
            const revenueNum =
              parseFloat(data.revenue.toString().replace(/[,$]/g, '')) || 0
            if (revenueNum > 0) {
              const margin = (profitNum / revenueNum) * 100
              if (margin < 5) {
                warnings.push({
                  field,
                  message: `Profit margin of ${margin.toFixed(1)}% is quite low - buyers may have concerns`,
                  type: 'warning',
                })
              } else if (margin > 50) {
                warnings.push({
                  field,
                  message: `High profit margin of ${margin.toFixed(1)}% - ensure this is sustainable`,
                  type: 'info',
                })
              }
            }
          }
          break

        case 'employees':
          if (value) {
            const employeeNum = parseInt(value.toString()) || 0
            if (employeeNum > 50 && !data.revenue) {
              warnings.push({
                field,
                message:
                  'Large employee count - consider adding revenue information for context',
                type: 'info',
              })
            }
          }
          break

        case 'established':
          if (value) {
            const yearEstablished = parseInt(value.toString()) || 0
            const age = new Date().getFullYear() - yearEstablished
            if (age < 2) {
              warnings.push({
                field,
                message:
                  'Very new business - buyers may prefer more established businesses',
                type: 'info',
              })
            } else if (age > 50) {
              warnings.push({
                field,
                message:
                  'Well-established business - highlight your stability and track record',
                type: 'info',
              })
            }
          }
          break

        case 'description':
          if (value && (value as string).length < 100) {
            warnings.push({
              field,
              message: 'Consider adding more detail to attract serious buyers',
              type: 'info',
            })
          }
          break

        case 'yearlyGrowth':
          if (value !== undefined && value !== '') {
            const growth = parseFloat(value.toString()) || 0
            if (growth < -10) {
              warnings.push({
                field,
                message:
                  'Negative growth may concern buyers - consider explaining circumstances',
                type: 'warning',
              })
            } else if (growth > 100) {
              warnings.push({
                field,
                message:
                  'Exceptional growth rate - buyers will want to see supporting documentation',
                type: 'info',
              })
            }
          }
          break

        case 'liabilities':
          if (value && data.totalAssets) {
            const liabilitiesNum =
              parseFloat(value.toString().replace(/[,$]/g, '')) || 0
            const assetsNum =
              parseFloat(data.totalAssets.toString().replace(/[,$]/g, '')) || 0
            const ratio = assetsNum > 0 ? liabilitiesNum / assetsNum : 0
            if (ratio > 0.8) {
              warnings.push({
                field,
                message: 'High debt-to-asset ratio may concern buyers',
                type: 'warning',
              })
            }
          }
          break
      }

      return warnings
    },
    []
  )

  // Validate entire form
  const validateForm = useCallback(
    (data: Partial<BusinessFormData>) => {
      try {
        // Clear previous errors
        setErrors([])
        setWarnings([])

        // Validate each field
        const allErrors: ValidationError[] = []
        const allWarnings: ValidationError[] = []

        Object.entries(data).forEach(([field, value]) => {
          if (value !== undefined && value !== '') {
            const fieldValidation = validateFieldCallback(
              field as keyof BusinessFormData,
              value
            )
            const fieldErrors = fieldValidation.filter(v => v.type === 'error')
            const fieldWarnings = fieldValidation.filter(
              v => v.type !== 'error'
            )

            allErrors.push(...fieldErrors)
            allWarnings.push(...fieldWarnings)
          }
        })

        setErrors(allErrors)
        setWarnings(allWarnings)

        return {
          isValid: allErrors.length === 0,
          errors: allErrors,
        }
      } catch (error) {
        const fallbackError: ValidationError = {
          field: 'form',
          message: 'Form validation failed',
          type: 'error',
        }
        setErrors([fallbackError])
        return {
          isValid: false,
          errors: [fallbackError],
        }
      }
    },
    [validateFieldCallback]
  )

  // Check if specific step is valid
  const isValidStep = useCallback(
    (step: number): boolean => {
      const stepValidation = validateStep(step, formData)
      return stepValidation.isValid
    },
    [formData]
  )

  // Clear field errors
  const clearFieldErrors = useCallback((field: keyof BusinessFormData) => {
    setErrors(prev => prev.filter(err => err.field !== field))
    setWarnings(prev => prev.filter(warn => warn.field !== field))
  }, [])

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors([])
    setWarnings([])
  }, [])

  // Get specific field error
  const getFieldError = useCallback(
    (field: keyof BusinessFormData): ValidationError | undefined => {
      return errors.find(err => err.field === field && err.type === 'error')
    },
    [errors]
  )

  // Get specific field warning
  const getFieldWarning = useCallback(
    (field: keyof BusinessFormData): ValidationError | undefined => {
      return warnings.find(
        warn =>
          warn.field === field &&
          (warn.type === 'warning' || warn.type === 'info')
      )
    },
    [warnings]
  )

  // Auto-validate form when data changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      validateForm(formData)
    }
  }, [formData, validateForm])

  return {
    errors,
    warnings,
    isValidStep,
    validateField: validateFieldCallback,
    validateForm,
    clearFieldErrors,
    clearAllErrors,
    getFieldError,
    getFieldWarning,
  }
}
