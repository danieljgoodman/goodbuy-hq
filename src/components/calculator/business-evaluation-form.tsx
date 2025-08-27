'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Calculator, Building, DollarSign, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EvaluationFormData, FormStep, FormState, ValuationResult } from '@/types/valuation'
import { BasicInfoForm } from './forms/basic-info-form'
import { FinancialDataForm } from './forms/financial-data-form'
import { BusinessDetailsForm } from './forms/business-details-form'
import { ValuationResults } from './valuation-results'
import { ValuationEngine } from '@/lib/valuation-engine'

const FORM_STEPS: { key: FormStep; title: string; icon: any; description: string }[] = [
  {
    key: 'basic-info',
    title: 'Basic Information',
    icon: Building,
    description: 'Company details and industry information'
  },
  {
    key: 'financial-data',
    title: 'Financial Data',
    icon: DollarSign,
    description: 'Revenue, profit, assets, and financial metrics'
  },
  {
    key: 'business-details',
    title: 'Business Details',
    icon: BarChart3,
    description: 'Market position, growth stage, and risk factors'
  },
  {
    key: 'results',
    title: 'Valuation Results',
    icon: Calculator,
    description: 'Your comprehensive business evaluation'
  }
]

export function BusinessEvaluationForm() {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>({
    currentStep: 'basic-info',
    data: {},
    isValid: false,
    errors: {}
  })
  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentStepIndex = FORM_STEPS.findIndex(step => step.key === formState.currentStep)
  const isLastStep = currentStepIndex === FORM_STEPS.length - 1
  const isFirstStep = currentStepIndex === 0

  const updateFormData = <K extends keyof EvaluationFormData>(
    section: K,
    data: EvaluationFormData[K]
  ) => {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [section]: data
      },
      errors: {}
    }))
  }

  const validateCurrentStep = (): boolean => {
    const { currentStep, data } = formState
    
    switch (currentStep) {
      case 'basic-info':
        return !!(
          data.basicInfo?.companyName &&
          data.basicInfo?.industry &&
          data.basicInfo?.businessType &&
          data.basicInfo?.foundedYear
        )
      case 'financial-data':
        return !!(
          data.financialData?.annualRevenue &&
          data.financialData?.grossProfit &&
          data.financialData?.netIncome &&
          data.financialData?.totalAssets
        )
      case 'business-details':
        return !!(
          data.businessDetails?.marketPosition &&
          data.businessDetails?.growthStage
        )
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      setFormState(prev => ({
        ...prev,
        errors: { general: 'Please fill in all required fields' }
      }))
      return
    }

    if (formState.currentStep === 'business-details') {
      // Calculate valuation
      setIsCalculating(true)
      try {
        const engine = new ValuationEngine(formState.data as EvaluationFormData)
        const result = engine.calculateValuation()
        setValuationResult(result)
        setFormState(prev => ({ ...prev, currentStep: 'results' }))
      } catch (error) {
        console.error('Valuation calculation error:', error)
        setFormState(prev => ({
          ...prev,
          errors: { general: 'Error calculating valuation. Please check your inputs.' }
        }))
      }
      setIsCalculating(false)
    } else {
      const nextStepIndex = currentStepIndex + 1
      if (nextStepIndex < FORM_STEPS.length) {
        setFormState(prev => ({
          ...prev,
          currentStep: FORM_STEPS[nextStepIndex].key
        }))
      }
    }
  }

  const handlePrevious = () => {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      setFormState(prev => ({
        ...prev,
        currentStep: FORM_STEPS[prevStepIndex].key
      }))
    }
  }

  const handleStepClick = (stepKey: FormStep) => {
    const stepIndex = FORM_STEPS.findIndex(step => step.key === stepKey)
    const currentIndex = currentStepIndex
    
    // Only allow clicking on previous steps or next step if current is valid
    if (stepIndex < currentIndex || (stepIndex === currentIndex + 1 && validateCurrentStep())) {
      setFormState(prev => ({ ...prev, currentStep: stepKey }))
    }
  }

  const renderCurrentForm = () => {
    switch (formState.currentStep) {
      case 'basic-info':
        return (
          <BasicInfoForm
            data={formState.data.basicInfo}
            onUpdate={(data) => updateFormData('basicInfo', data)}
            errors={formState.errors}
          />
        )
      case 'financial-data':
        return (
          <FinancialDataForm
            data={formState.data.financialData}
            onUpdate={(data) => updateFormData('financialData', data)}
            errors={formState.errors}
          />
        )
      case 'business-details':
        return (
          <BusinessDetailsForm
            data={formState.data.businessDetails}
            onUpdate={(data) => updateFormData('businessDetails', data)}
            errors={formState.errors}
          />
        )
      case 'results':
        return valuationResult ? (
          <ValuationResults result={valuationResult} />
        ) : (
          <div className="text-center p-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p>Calculating your business valuation...</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {FORM_STEPS.map((step, index) => {
            const IconComponent = step.icon
            const isActive = step.key === formState.currentStep
            const isCompleted = index < currentStepIndex
            const isAccessible = index <= currentStepIndex || (index === currentStepIndex + 1 && validateCurrentStep())
            
            return (
              <div key={step.key} className="flex-1 relative">
                <button
                  onClick={() => handleStepClick(step.key)}
                  disabled={!isAccessible}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    isActive
                      ? 'border-primary-500 bg-primary-50'
                      : isCompleted
                      ? 'border-success-500 bg-success-50 hover:bg-success-100'
                      : isAccessible
                      ? 'border-secondary-300 bg-white hover:bg-secondary-50'
                      : 'border-secondary-200 bg-secondary-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : isCompleted
                        ? 'bg-success-500 text-white'
                        : 'bg-secondary-300 text-secondary-600'
                    }`}>
                      {isCompleted ? (
                        <span className="text-sm">✓</span>
                      ) : (
                        <IconComponent className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className={`font-medium ${
                        isActive ? 'text-primary-700' : isCompleted ? 'text-success-700' : 'text-secondary-700'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {step.description}
                      </div>
                    </div>
                  </div>
                </button>
                
                {index < FORM_STEPS.length - 1 && (
                  <div className="absolute top-1/2 -right-2 w-4 h-0.5 bg-secondary-300 transform -translate-y-1/2" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-secondary-200 shadow-lg">
        <div className="p-8">
          {formState.errors.general && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-error-700">{formState.errors.general}</p>
            </div>
          )}
          
          {renderCurrentForm()}
        </div>

        {/* Navigation Buttons */}
        {formState.currentStep !== 'results' && (
          <div className="flex justify-between items-center px-8 py-6 border-t border-secondary-200 bg-secondary-50">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="text-sm text-secondary-500">
              Step {currentStepIndex + 1} of {FORM_STEPS.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={isCalculating || !validateCurrentStep()}
              className="flex items-center space-x-2"
            >
              {isCalculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <span>{formState.currentStep === 'business-details' ? 'Calculate Valuation' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}