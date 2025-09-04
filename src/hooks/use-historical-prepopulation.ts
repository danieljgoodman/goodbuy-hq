import { useState, useEffect, useCallback } from 'react'
import { BusinessFormData } from '@/lib/validation/business-form-schema'
import {
  HistoricalDataService,
  PrePopulationSuggestion,
} from '@/lib/historical-data-service'

export interface PrePopulationOptions {
  userId: string
  enableAutoPopulation: boolean
  minimumConfidence: number
  maxSuggestions: number
  recordUsage: boolean
}

export interface UseHistoricalPrePopulationReturn {
  suggestions: PrePopulationSuggestion[]
  applySuggestion: (suggestion: PrePopulationSuggestion) => void
  dismissSuggestion: (suggestion: PrePopulationSuggestion) => void
  refreshSuggestions: () => Promise<void>
  recordFieldUsage: (field: keyof BusinessFormData, value: any) => Promise<void>
  isLoading: boolean
  hasHistory: boolean
  userAnalytics: {
    totalPatterns: number
    mostUsedFields: Array<{ field: keyof BusinessFormData; frequency: number }>
    categories: string[]
    locations: string[]
  } | null
}

const defaultOptions: PrePopulationOptions = {
  userId: '',
  enableAutoPopulation: false,
  minimumConfidence: 0.4,
  maxSuggestions: 5,
  recordUsage: true,
}

export const useHistoricalPrePopulation = (
  formData: Partial<BusinessFormData>,
  onUpdateFormData: (updates: Partial<BusinessFormData>) => void,
  options: Partial<PrePopulationOptions> = {}
): UseHistoricalPrePopulationReturn => {
  const opts = { ...defaultOptions, ...options }

  const [suggestions, setSuggestions] = useState<PrePopulationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasHistory, setHasHistory] = useState(false)
  const [userAnalytics, setUserAnalytics] =
    useState<UseHistoricalPrePopulationReturn['userAnalytics']>(null)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(
    new Set()
  )

  // Generate context from current form data
  const generateContext = useCallback(() => {
    return {
      category: formData.category,
      location: formData.city,
      businessSize: formData.revenue
        ? (((formData.revenue as number) > 5000000
            ? 'large'
            : (formData.revenue as number) > 1000000
              ? 'medium'
              : 'small') as 'small' | 'medium' | 'large')
        : undefined,
    }
  }, [formData.category, formData.city, formData.revenue])

  // Load suggestions from historical data
  const loadSuggestions = useCallback(async () => {
    if (!opts.userId) return

    setIsLoading(true)

    try {
      const context = generateContext()
      const allSuggestions =
        await HistoricalDataService.getPrePopulationSuggestions(
          opts.userId,
          formData,
          context
        )

      // Filter by confidence and max suggestions
      const filteredSuggestions = allSuggestions
        .filter(s => s.confidence >= opts.minimumConfidence)
        .filter(s => {
          const suggestionKey = `${s.field}-${JSON.stringify(s.value)}`
          return !dismissedSuggestions.has(suggestionKey)
        })
        .slice(0, opts.maxSuggestions)

      setSuggestions(filteredSuggestions)
      setHasHistory(allSuggestions.length > 0)

      // Auto-populate high confidence suggestions if enabled
      if (opts.enableAutoPopulation) {
        const autoPopulateSuggestions = filteredSuggestions.filter(
          s => s.confidence >= 0.8
        )

        const updates: Partial<BusinessFormData> = {}
        autoPopulateSuggestions.forEach(suggestion => {
          // Only auto-populate if field is empty
          if (
            !formData[suggestion.field] ||
            formData[suggestion.field] === ''
          ) {
            updates[suggestion.field] = suggestion.value

            // Record the usage
            if (opts.recordUsage) {
              HistoricalDataService.recordUserInput(
                opts.userId,
                suggestion.field,
                suggestion.value,
                context
              )
            }
          }
        })

        if (Object.keys(updates).length > 0) {
          onUpdateFormData(updates)

          // Remove auto-populated suggestions from the list
          setSuggestions(prev =>
            prev.filter(s => !updates.hasOwnProperty(s.field))
          )
        }
      }
    } catch (error) {
      console.error('Failed to load historical suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [opts, formData, generateContext, dismissedSuggestions, onUpdateFormData])

  // Load user analytics
  const loadUserAnalytics = useCallback(async () => {
    if (!opts.userId) return

    try {
      const analytics = await HistoricalDataService.getUserDataAnalytics(
        opts.userId
      )
      setUserAnalytics(analytics)
    } catch (error) {
      console.error('Failed to load user analytics:', error)
    }
  }, [opts.userId])

  // Apply a suggestion
  const applySuggestion = useCallback(
    async (suggestion: PrePopulationSuggestion) => {
      // Update form data
      onUpdateFormData({ [suggestion.field]: suggestion.value })

      // Record usage if enabled
      if (opts.recordUsage) {
        const context = generateContext()
        await HistoricalDataService.recordUserInput(
          opts.userId,
          suggestion.field,
          suggestion.value,
          context
        )
      }

      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => s !== suggestion))
    },
    [onUpdateFormData, opts, generateContext]
  )

  // Dismiss a suggestion
  const dismissSuggestion = useCallback(
    (suggestion: PrePopulationSuggestion) => {
      const suggestionKey = `${suggestion.field}-${JSON.stringify(suggestion.value)}`
      setDismissedSuggestions(
        prev => new Set([...Array.from(prev), suggestionKey])
      )

      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => s !== suggestion))
    },
    []
  )

  // Refresh suggestions manually
  const refreshSuggestions = useCallback(async () => {
    await loadSuggestions()
  }, [loadSuggestions])

  // Record field usage for learning
  const recordFieldUsage = useCallback(
    async (field: keyof BusinessFormData, value: any) => {
      if (!opts.recordUsage || !opts.userId || !value || value === '') return

      try {
        const context = generateContext()
        await HistoricalDataService.recordUserInput(
          opts.userId,
          field,
          value,
          context
        )

        // Refresh analytics if the field was recorded
        await loadUserAnalytics()
      } catch (error) {
        console.error('Failed to record field usage:', error)
      }
    },
    [opts, generateContext, loadUserAnalytics]
  )

  // Load suggestions when form data changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSuggestions()
    }, 1000) // 1 second debounce

    return () => clearTimeout(timer)
  }, [loadSuggestions])

  // Load analytics on mount
  useEffect(() => {
    loadUserAnalytics()
  }, [loadUserAnalytics])

  // Persist dismissed suggestions to localStorage
  useEffect(() => {
    try {
      const dismissed = Array.from(dismissedSuggestions)
      localStorage.setItem(
        `prepopulation-dismissed-${opts.userId}`,
        JSON.stringify(dismissed)
      )
    } catch (error) {
      console.warn('Failed to persist dismissed suggestions')
    }
  }, [dismissedSuggestions, opts.userId])

  // Load dismissed suggestions from localStorage
  useEffect(() => {
    if (!opts.userId) return

    try {
      const stored = localStorage.getItem(
        `prepopulation-dismissed-${opts.userId}`
      )
      if (stored) {
        const dismissed = JSON.parse(stored) as string[]
        setDismissedSuggestions(new Set(dismissed))
      }
    } catch (error) {
      console.warn('Failed to load dismissed suggestions')
    }
  }, [opts.userId])

  // Record form data changes for learning
  useEffect(() => {
    if (!opts.recordUsage || !opts.userId) return

    // Record changes with a delay to avoid recording every keystroke
    const timer = setTimeout(() => {
      Object.entries(formData).forEach(([field, value]) => {
        if (value && value !== '') {
          recordFieldUsage(field as keyof BusinessFormData, value)
        }
      })
    }, 5000) // 5 second delay

    return () => clearTimeout(timer)
  }, [formData, recordFieldUsage, opts])

  return {
    suggestions,
    applySuggestion,
    dismissSuggestion,
    refreshSuggestions,
    recordFieldUsage,
    isLoading,
    hasHistory,
    userAnalytics,
  }
}
