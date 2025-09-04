import React from 'react'
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { ValidationError } from '@/hooks/use-form-validation'
import { cn } from '@/lib/utils'

interface ValidationFeedbackProps {
  error?: ValidationError
  warning?: ValidationError
  className?: string
  showSuccess?: boolean
  isValid?: boolean
  id?: string
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  error,
  warning,
  className,
  showSuccess = false,
  isValid = false,
  id,
}) => {
  // Priority: Error > Warning > Success > Nothing
  const message = error || warning

  if (!message && (!showSuccess || !isValid)) {
    return null
  }

  // Success state
  if (!message && showSuccess && isValid) {
    return (
      <div
        className={cn(
          'flex items-center mt-1 text-sm text-green-600',
          className
        )}
      >
        <CheckCircle2 className="w-4 h-4 mr-1 flex-shrink-0" />
        <span>Looks good!</span>
      </div>
    )
  }

  // Error or warning state
  const isError = message?.type === 'error'
  const isWarning = message?.type === 'warning'
  const isInfo = message?.type === 'info'

  const iconMap = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colorMap = {
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }

  const Icon = iconMap[message!.type]
  const textColor = colorMap[message!.type]

  return (
    <div className={cn('flex items-start mt-1 text-sm', textColor, className)}>
      <Icon className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
      <span>{message!.message}</span>
    </div>
  )
}

interface FieldValidationWrapperProps {
  field: string
  error?: ValidationError
  warning?: ValidationError
  children: React.ReactNode
  className?: string
  showSuccess?: boolean
}

export const FieldValidationWrapper: React.FC<FieldValidationWrapperProps> = ({
  field,
  error,
  warning,
  children,
  className,
  showSuccess = false,
}) => {
  const hasError = Boolean(error)
  const hasWarning = Boolean(warning && !error)
  const isValid = !hasError && !hasWarning

  // Add validation styling to input elements
  const childrenWithValidation = React.Children.map(children, child => {
    if (
      React.isValidElement(child) &&
      (child.type === 'input' ||
        child.type === 'textarea' ||
        child.type === 'select')
    ) {
      const validationClasses = cn(
        hasError && 'border-red-300 focus:border-red-500 focus:ring-red-500',
        hasWarning &&
          'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
        isValid &&
          showSuccess &&
          'border-green-300 focus:border-green-500 focus:ring-green-500'
      )

      return React.cloneElement(child, {
        className: cn(child.props.className, validationClasses),
        'aria-invalid': hasError,
        'aria-describedby':
          hasError || hasWarning ? `${field}-validation` : undefined,
      })
    }
    return child
  })

  return (
    <div className={cn('space-y-1', className)}>
      {childrenWithValidation}
      <ValidationFeedback
        error={error}
        warning={warning}
        showSuccess={showSuccess}
        isValid={isValid}
        id={`${field}-validation`}
      />
    </div>
  )
}

interface FormFieldProps {
  label: string
  field: string
  required?: boolean
  error?: ValidationError
  warning?: ValidationError
  children: React.ReactNode
  className?: string
  showSuccess?: boolean
  description?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  field,
  required = false,
  error,
  warning,
  children,
  className,
  showSuccess = false,
  description,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={field}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {description && <p className="text-sm text-gray-600">{description}</p>}

      <FieldValidationWrapper
        field={field}
        error={error}
        warning={warning}
        showSuccess={showSuccess}
      >
        {children}
      </FieldValidationWrapper>
    </div>
  )
}
