import React from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepConfig {
  id: number
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  required?: boolean
}

export interface StepStatus {
  id: number
  isValid: boolean
  isComplete: boolean
  hasErrors: boolean
  hasWarnings: boolean
  completionPercentage: number
}

interface ProgressTrackerProps {
  steps: StepConfig[]
  stepStatuses: StepStatus[]
  currentStep: number
  onStepClick?: (step: number) => void
  className?: string
  orientation?: 'horizontal' | 'vertical'
  showPercentage?: boolean
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  stepStatuses,
  currentStep,
  onStepClick,
  className,
  orientation = 'horizontal',
  showPercentage = false,
}) => {
  const getStepStatus = (stepId: number): StepStatus => {
    return (
      stepStatuses.find(s => s.id === stepId) || {
        id: stepId,
        isValid: false,
        isComplete: false,
        hasErrors: false,
        hasWarnings: false,
        completionPercentage: 0,
      }
    )
  }

  const getStepState = (step: StepConfig) => {
    const status = getStepStatus(step.id)
    const isCurrent = step.id === currentStep
    const isPast = step.id < currentStep
    const isFuture = step.id > currentStep

    if (isPast) {
      return status.isComplete
        ? 'completed'
        : status.hasErrors
          ? 'error'
          : 'incomplete'
    }
    if (isCurrent) {
      return status.hasErrors
        ? 'current-error'
        : status.hasWarnings
          ? 'current-warning'
          : 'current'
    }
    return 'future'
  }

  const getStepStyles = (state: string) => {
    const styles = {
      completed: {
        circle: 'bg-green-500 text-white border-green-500',
        title: 'text-green-700',
        connector: 'bg-green-500',
      },
      current: {
        circle: 'bg-blue-500 text-white border-blue-500',
        title: 'text-blue-700 font-medium',
        connector: 'bg-gray-300',
      },
      'current-warning': {
        circle: 'bg-yellow-500 text-white border-yellow-500',
        title: 'text-yellow-700 font-medium',
        connector: 'bg-gray-300',
      },
      'current-error': {
        circle: 'bg-red-500 text-white border-red-500',
        title: 'text-red-700 font-medium',
        connector: 'bg-gray-300',
      },
      error: {
        circle: 'bg-red-100 text-red-600 border-red-300',
        title: 'text-red-600',
        connector: 'bg-gray-300',
      },
      incomplete: {
        circle: 'bg-yellow-100 text-yellow-600 border-yellow-300',
        title: 'text-yellow-600',
        connector: 'bg-gray-300',
      },
      future: {
        circle: 'bg-gray-100 text-gray-400 border-gray-300',
        title: 'text-gray-500',
        connector: 'bg-gray-300',
      },
    }

    return styles[state as keyof typeof styles] || styles.future
  }

  const renderStepIcon = (
    step: StepConfig,
    state: string,
    status: StepStatus
  ) => {
    const styles = getStepStyles(state)
    const Icon = step.icon

    if (state === 'completed') {
      return <Check className="w-4 h-4" />
    }

    if (state.includes('error')) {
      return <AlertCircle className="w-4 h-4" />
    }

    if (Icon) {
      return <Icon className="w-4 h-4" />
    }

    return <span className="text-sm font-medium">{step.id}</span>
  }

  const calculateOverallProgress = () => {
    const totalSteps = steps.length
    const completedSteps = stepStatuses.filter(s => s.isComplete).length
    const partialProgress = stepStatuses
      .filter(s => !s.isComplete)
      .reduce((sum, s) => sum + s.completionPercentage / 100, 0)

    return Math.min(
      100,
      ((completedSteps + partialProgress) / totalSteps) * 100
    )
  }

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {showPercentage && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(calculateOverallProgress())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateOverallProgress()}%` }}
              />
            </div>
          </div>
        )}

        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const state = getStepState(step)
          const styles = getStepStyles(state)
          const isClickable =
            onStepClick && (step.id <= currentStep || status.isComplete)

          return (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-4 top-10 w-0.5 h-6 bg-gray-300" />
              )}

              <div
                className={cn(
                  'flex items-start space-x-3',
                  isClickable &&
                    'cursor-pointer hover:bg-gray-50 p-2 rounded-lg -m-2'
                )}
                onClick={() => isClickable && onStepClick!(step.id)}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2',
                    styles.circle
                  )}
                >
                  {renderStepIcon(step, state, status)}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className={cn('text-sm font-medium', styles.title)}>
                    {step.title}
                    {step.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </div>
                  )}
                  {showPercentage &&
                    !status.isComplete &&
                    status.completionPercentage > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(status.completionPercentage)}% complete
                      </div>
                    )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Horizontal layout
  return (
    <div className={cn('w-full', className)}>
      {showPercentage && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(calculateOverallProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateOverallProgress()}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const state = getStepState(step)
          const styles = getStepStyles(state)
          const isClickable =
            onStepClick && (step.id <= currentStep || status.isComplete)

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step */}
              <div
                className={cn(
                  'flex flex-col items-center space-y-2',
                  isClickable &&
                    'cursor-pointer hover:bg-gray-50 p-2 rounded-lg -m-2'
                )}
                onClick={() => isClickable && onStepClick!(step.id)}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2',
                    styles.circle
                  )}
                >
                  {renderStepIcon(step, state, status)}
                </div>

                {/* Step title */}
                <div className="text-center">
                  <div className={cn('text-sm font-medium', styles.title)}>
                    {step.title}
                    {step.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </div>
                  {showPercentage &&
                    !status.isComplete &&
                    status.completionPercentage > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(status.completionPercentage)}%
                      </div>
                    )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-4', styles.connector)} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
