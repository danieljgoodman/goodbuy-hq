'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Calculator,
  Building,
  DollarSign,
  BarChart3,
  Brain,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EvaluationFormData,
  FormStep,
  FormState,
  ValuationResult,
} from '@/types/valuation'
import { BasicInfoForm } from './forms/basic-info-form'
import { FinancialDataForm } from './forms/financial-data-form'
import { BusinessDetailsForm } from './forms/business-details-form'
import { ValuationResults } from './valuation-results'
import { ValuationEngine } from '@/lib/valuation-engine'

const FORM_STEPS: {
  key: FormStep
  title: string
  icon: any
  description: string
}[] = [
  {
    key: 'basic-info',
    title: 'Basic Information',
    icon: Building,
    description: 'Company details and industry information',
  },
  {
    key: 'financial-data',
    title: 'Financial Data',
    icon: DollarSign,
    description: 'Revenue, profit, assets, and financial metrics',
  },
  {
    key: 'business-details',
    title: 'Business Details',
    icon: BarChart3,
    description: 'Market position, growth stage, and risk factors',
  },
  {
    key: 'results',
    title: 'Valuation Results',
    icon: Calculator,
    description: 'Your comprehensive business evaluation',
  },
]

export function BusinessEvaluationForm() {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>({
    currentStep: 'basic-info',
    data: {},
    isValid: false,
    errors: {},
  })
  const [valuationResult, setValuationResult] =
    useState<ValuationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentStepIndex = FORM_STEPS.findIndex(
    step => step.key === formState.currentStep
  )
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
        [section]: data,
      },
      errors: {},
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
        errors: { general: 'Please fill in all required fields' },
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
          errors: {
            general: 'Error calculating valuation. Please check your inputs.',
          },
        }))
      }
      setIsCalculating(false)
    } else {
      const nextStepIndex = currentStepIndex + 1
      if (nextStepIndex < FORM_STEPS.length) {
        setFormState(prev => ({
          ...prev,
          currentStep: FORM_STEPS[nextStepIndex].key,
        }))
      }
    }
  }

  const handlePrevious = () => {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      setFormState(prev => ({
        ...prev,
        currentStep: FORM_STEPS[prevStepIndex].key,
      }))
    }
  }

  const handleStepClick = (stepKey: FormStep) => {
    const stepIndex = FORM_STEPS.findIndex(step => step.key === stepKey)
    const currentIndex = currentStepIndex

    // Only allow clicking on previous steps or next step if current is valid
    if (
      stepIndex < currentIndex ||
      (stepIndex === currentIndex + 1 && validateCurrentStep())
    ) {
      setFormState(prev => ({ ...prev, currentStep: stepKey }))
    }
  }

  const renderCurrentForm = () => {
    switch (formState.currentStep) {
      case 'basic-info':
        return (
          <BasicInfoForm
            data={formState.data.basicInfo}
            onUpdate={data => updateFormData('basicInfo', data)}
            errors={formState.errors}
          />
        )
      case 'financial-data':
        return (
          <FinancialDataForm
            data={formState.data.financialData}
            onUpdate={data => updateFormData('financialData', data)}
            errors={formState.errors}
          />
        )
      case 'business-details':
        return (
          <BusinessDetailsForm
            data={formState.data.businessDetails}
            onUpdate={data => updateFormData('businessDetails', data)}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Brain className="w-4 h-4" />
            <span>AI-Powered Evaluation</span>
            <Sparkles className="w-4 h-4" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Business Valuation Calculator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get an accurate valuation of your business using advanced AI
            algorithms and comprehensive market analysis.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center justify-between gap-4">
            {FORM_STEPS.map((step, index) => {
              const IconComponent = step.icon
              const isActive = step.key === formState.currentStep
              const isCompleted = index < currentStepIndex
              const isAccessible =
                index <= currentStepIndex ||
                (index === currentStepIndex + 1 && validateCurrentStep())

              return (
                <motion.div
                  key={step.key}
                  className="flex-1 relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                >
                  <motion.button
                    onClick={() => handleStepClick(step.key)}
                    disabled={!isAccessible}
                    className={`w-full text-left p-6 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                      isActive
                        ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-200/50'
                        : isCompleted
                          ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg shadow-green-200/50'
                          : isAccessible
                            ? 'border-slate-200 bg-white/70 hover:bg-white hover:shadow-lg shadow-slate-200/50'
                            : 'border-slate-200 bg-slate-50/50 opacity-50 cursor-not-allowed'
                    }`}
                    whileHover={isAccessible ? { y: -2 } : {}}
                    whileTap={isAccessible ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                            : isCompleted
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                        }`}
                        whileHover={isAccessible ? { scale: 1.1 } : {}}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        {isCompleted ? (
                          <motion.span
                            className="text-lg font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 10,
                            }}
                          >
                            ✓
                          </motion.span>
                        ) : (
                          <IconComponent className="w-5 h-5" />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.div
                          className={`font-semibold text-sm ${
                            isActive
                              ? 'text-blue-700'
                              : isCompleted
                                ? 'text-green-700'
                                : 'text-slate-700'
                          }`}
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {step.title}
                        </motion.div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {step.description}
                        </div>
                        {isActive && (
                          <motion.div
                            className="mt-2 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${((index + 1) / FORM_STEPS.length) * 100}%`,
                            }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        )}
                      </div>
                    </div>
                  </motion.button>

                  {index < FORM_STEPS.length - 1 && (
                    <motion.div
                      className="absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-slate-300 to-slate-200 transform -translate-y-1/2"
                      initial={{ width: 0 }}
                      animate={{ width: '1rem' }}
                      transition={{ delay: 0.2 * index, duration: 0.3 }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="p-8">
            <AnimatePresence mode="wait">
              {formState.errors.general && (
                <motion.div
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-red-700 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-xs">
                      !
                    </span>
                    {formState.errors.general}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={formState.currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {renderCurrentForm()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Enhanced Navigation Buttons */}
          {formState.currentStep !== 'results' && (
            <motion.div
              className="flex justify-between items-center px-8 py-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/50 backdrop-blur-sm rounded-b-2xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <motion.div
                whileHover={!isFirstStep ? { scale: 1.02 } : {}}
                whileTap={!isFirstStep ? { scale: 0.98 } : {}}
              >
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  className="flex items-center space-x-2 hover:bg-slate-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
              </motion.div>

              <div className="flex items-center space-x-3">
                <div className="text-sm text-slate-500">
                  Step {currentStepIndex + 1} of {FORM_STEPS.length}
                </div>
                <div className="flex space-x-1">
                  {FORM_STEPS.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index <= currentStepIndex
                          ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                          : 'bg-slate-200'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * index, duration: 0.2 }}
                    />
                  ))}
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleNext}
                  disabled={isCalculating || !validateCurrentStep()}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <span>Analyzing...</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>
                        {formState.currentStep === 'business-details'
                          ? 'Generate AI Valuation'
                          : 'Continue'}
                      </span>
                      {formState.currentStep === 'business-details' ? (
                        <Zap className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
