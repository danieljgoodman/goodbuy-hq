import { useState, useEffect, useCallback, useMemo } from 'react'
import { BusinessFormData } from '@/lib/validation/business-form-schema'
import {
  BusinessSuggestionsService,
  BusinessSuggestion,
  SuggestionContext,
} from '@/lib/business-suggestions'

export interface SuggestionPreferences {
  autoApplyHighConfidence: boolean
  minimumConfidence: number
  enabledSources: (
    | 'industry_average'
    | 'similar_business'
    | 'user_history'
    | 'algorithm'
  )[]
  dismissedSuggestions: Set<string>
}

export interface UseSuggestionsReturn {
  suggestions: BusinessSuggestion[]
  getSuggestionsForField: (
    field: keyof BusinessFormData
  ) => BusinessSuggestion[]
  applySuggestion: (suggestion: BusinessSuggestion) => void
  dismissSuggestion: (suggestion: BusinessSuggestion) => void
  refreshSuggestions: () => void
  preferences: SuggestionPreferences
  updatePreferences: (prefs: Partial<SuggestionPreferences>) => void
  isLoading: boolean
}

const defaultPreferences: SuggestionPreferences = {
  autoApplyHighConfidence: false,
  minimumConfidence: 0.3,
  enabledSources: [
    'industry_average',
    'algorithm',
    'similar_business',
    'user_history',
  ],
  dismissedSuggestions: new Set(),
}

export const useBusinessSuggestions = (
  formData: Partial<BusinessFormData>,
  onUpdateFormData: (updates: Partial<BusinessFormData>) => void,
  initialPreferences: Partial<SuggestionPreferences> = {}
): UseSuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<BusinessSuggestion[]>([])
  const [preferences, setPreferences] = useState<SuggestionPreferences>({
    ...defaultPreferences,
    ...initialPreferences,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Build context from current form data
  const context = useMemo((): SuggestionContext => {
    return {
      category: formData.category,
      location: {
        city: formData.city,
        state: formData.state,
      },
      businessSize: formData.revenue
        ? (formData.revenue as number) > 5000000
          ? 'large'
          : (formData.revenue as number) > 1000000
            ? 'medium'
            : 'small'
        : undefined,
      listingType: formData.listingType,
    }
  }, [
    formData.category,
    formData.city,
    formData.state,
    formData.revenue,
    formData.listingType,
  ])

  // Generate suggestions based on current form data
  const generateSuggestions = useCallback(() => {
    setIsLoading(true)

    try {
      const allSuggestions = BusinessSuggestionsService.generateSuggestions(
        formData,
        context
      )

      // Filter suggestions based on preferences
      const filteredSuggestions = allSuggestions.filter(suggestion => {
        // Check minimum confidence
        if (suggestion.confidence < preferences.minimumConfidence) {
          return false
        }

        // Check enabled sources
        if (!preferences.enabledSources.includes(suggestion.source)) {
          return false
        }

        // Check if dismissed
        const suggestionKey = `${suggestion.field}-${suggestion.value}-${suggestion.source}`
        if (preferences.dismissedSuggestions.has(suggestionKey)) {
          return false
        }

        return true
      })

      setSuggestions(filteredSuggestions)

      // Auto-apply high confidence suggestions if enabled
      if (preferences.autoApplyHighConfidence) {
        const highConfidenceSuggestions = filteredSuggestions.filter(
          s => s.confidence >= 0.8
        )
        highConfidenceSuggestions.forEach(suggestion => {
          // Only auto-apply if the field is currently empty
          if (
            !formData[suggestion.field] ||
            formData[suggestion.field] === ''
          ) {
            onUpdateFormData({ [suggestion.field]: suggestion.value })
          }
        })
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [formData, context, preferences, onUpdateFormData])

  // Get suggestions for a specific field
  const getSuggestionsForField = useCallback(
    (field: keyof BusinessFormData): BusinessSuggestion[] => {
      return suggestions.filter(s => s.field === field)
    },
    [suggestions]
  )

  // Apply a suggestion
  const applySuggestion = useCallback(
    (suggestion: BusinessSuggestion) => {
      onUpdateFormData({ [suggestion.field]: suggestion.value })

      // Remove applied suggestion from the list
      setSuggestions(prev => prev.filter(s => s !== suggestion))
    },
    [onUpdateFormData]
  )

  // Dismiss a suggestion
  const dismissSuggestion = useCallback((suggestion: BusinessSuggestion) => {
    const suggestionKey = `${suggestion.field}-${suggestion.value}-${suggestion.source}`

    setPreferences(prev => ({
      ...prev,
      dismissedSuggestions: new Set([
        ...Array.from(prev.dismissedSuggestions),
        suggestionKey,
      ]),
    }))

    // Remove from current suggestions
    setSuggestions(prev => prev.filter(s => s !== suggestion))
  }, [])

  // Manually refresh suggestions
  const refreshSuggestions = useCallback(() => {
    generateSuggestions()
  }, [generateSuggestions])

  // Update preferences
  const updatePreferences = useCallback(
    (newPrefs: Partial<SuggestionPreferences>) => {
      setPreferences(prev => ({ ...prev, ...newPrefs }))
    },
    []
  )

  // Generate suggestions when form data or context changes
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSuggestions()
    }, 500) // Debounce to avoid excessive calls

    return () => clearTimeout(timer)
  }, [generateSuggestions])

  // Store preferences in localStorage
  useEffect(() => {
    try {
      const prefsToStore = {
        ...preferences,
        dismissedSuggestions: Array.from(preferences.dismissedSuggestions),
      }
      localStorage.setItem(
        'business-form-suggestion-preferences',
        JSON.stringify(prefsToStore)
      )
    } catch (error) {
      console.warn('Could not save suggestion preferences to localStorage')
    }
  }, [preferences])

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        'business-form-suggestion-preferences'
      )
      if (stored) {
        const parsed = JSON.parse(stored)
        setPreferences(prev => ({
          ...prev,
          ...parsed,
          dismissedSuggestions: new Set(parsed.dismissedSuggestions || []),
        }))
      }
    } catch (error) {
      console.warn('Could not load suggestion preferences from localStorage')
    }
  }, [])

  return {
    suggestions,
    getSuggestionsForField,
    applySuggestion,
    dismissSuggestion,
    refreshSuggestions,
    preferences,
    updatePreferences,
    isLoading,
  }
}
