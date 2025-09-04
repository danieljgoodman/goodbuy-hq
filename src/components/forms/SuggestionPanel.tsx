import React, { useState } from 'react'
import {
  Lightbulb,
  Check,
  X,
  TrendingUp,
  Calculator,
  Users,
  ChevronDown,
  ChevronUp,
  Settings,
  RefreshCw,
  Info,
} from 'lucide-react'
import { BusinessSuggestion } from '@/lib/business-suggestions'
import { BusinessSuggestionsService } from '@/lib/business-suggestions'
import { UseSuggestionsReturn } from '@/hooks/use-business-suggestions'
import { BusinessFormData } from '@/lib/validation/business-form-schema'
import { cn } from '@/lib/utils'

interface SuggestionPanelProps {
  suggestions: UseSuggestionsReturn
  className?: string
  compact?: boolean
}

const sourceIcons = {
  industry_average: TrendingUp,
  algorithm: Calculator,
  similar_business: Users,
  user_history: Users,
}

const sourceLabels = {
  industry_average: 'Industry Average',
  algorithm: 'Calculated',
  similar_business: 'Similar Businesses',
  user_history: 'Your History',
}

const confidenceLabels = {
  high: { min: 0.7, label: 'High', color: 'text-green-600 bg-green-50' },
  medium: { min: 0.4, label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
  low: { min: 0, label: 'Low', color: 'text-gray-600 bg-gray-50' },
}

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  suggestions,
  className,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [showSettings, setShowSettings] = useState(false)

  const {
    suggestions: suggestionList,
    applySuggestion,
    dismissSuggestion,
    refreshSuggestions,
    preferences,
    updatePreferences,
    isLoading,
  } = suggestions

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= confidenceLabels.high.min) return 'high'
    if (confidence >= confidenceLabels.medium.min) return 'medium'
    return 'low'
  }

  const groupedSuggestions = suggestionList.reduce(
    (groups, suggestion) => {
      const field = suggestion.field
      if (!groups[field]) {
        groups[field] = []
      }
      groups[field].push(suggestion)
      return groups
    },
    {} as Record<string, BusinessSuggestion[]>
  )

  if (suggestionList.length === 0 && !isLoading) {
    return null
  }

  const renderSuggestion = (suggestion: BusinessSuggestion) => {
    const SourceIcon = sourceIcons[suggestion.source]
    const confidenceLevel = getConfidenceLevel(suggestion.confidence)
    const confidenceConfig = confidenceLabels[confidenceLevel]
    const formattedValue =
      BusinessSuggestionsService.formatSuggestionValue(suggestion)

    return (
      <div
        key={`${suggestion.field}-${suggestion.value}-${suggestion.source}`}
        className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
      >
        <div className="flex-shrink-0 mt-0.5">
          <SourceIcon className="w-4 h-4 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900">
              {formattedValue}
            </span>
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                confidenceConfig.color
              )}
            >
              {Math.round(suggestion.confidence * 100)}%
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2">{suggestion.reason}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {sourceLabels[suggestion.source]}
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => applySuggestion(suggestion)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
              >
                <Check className="w-3 h-3 mr-1" />
                Apply
              </button>

              <button
                onClick={() => dismissSuggestion(suggestion)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-3 h-3 mr-1" />
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSettings = () => (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Suggestion Settings</h4>

      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={preferences.autoApplyHighConfidence}
            onChange={e =>
              updatePreferences({ autoApplyHighConfidence: e.target.checked })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            Auto-apply high confidence suggestions
          </span>
        </label>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Minimum confidence:{' '}
            {Math.round(preferences.minimumConfidence * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={preferences.minimumConfidence}
            onChange={e =>
              updatePreferences({
                minimumConfidence: parseFloat(e.target.value),
              })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Enabled sources:
          </label>
          <div className="space-y-1">
            {Object.entries(sourceLabels).map(([source, label]) => (
              <label key={source} className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.enabledSources.includes(source as any)}
                  onChange={e => {
                    const newSources = e.target.checked
                      ? [...preferences.enabledSources, source as any]
                      : preferences.enabledSources.filter(s => s !== source)
                    updatePreferences({ enabledSources: newSources })
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'bg-blue-50 border border-blue-200 rounded-lg',
        compact && 'shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-200">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-medium text-blue-900">
            Smart Suggestions
            {suggestionList.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {suggestionList.length}
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={refreshSuggestions}
            disabled={isLoading}
            className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
            title="Refresh suggestions"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {compact && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Settings */}
      {showSettings && renderSettings()}

      {/* Content */}
      {(!compact || isExpanded) && (
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mr-2" />
              <span className="text-sm text-blue-600">
                Generating suggestions...
              </span>
            </div>
          ) : suggestionList.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-sm text-gray-500">
              <Info className="w-4 h-4 mr-2" />
              <span>No suggestions available at the moment</span>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSuggestions).map(
                ([field, fieldSuggestions]) => (
                  <div key={field} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="space-y-2">
                      {fieldSuggestions.map(renderSuggestion)}
                    </div>
                  </div>
                )
              )}

              {suggestionList.length > 0 && (
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600 text-center">
                    Suggestions are based on industry data and may not reflect
                    your specific situation. Always verify before applying.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface FieldSuggestionButtonProps {
  field: keyof BusinessFormData
  suggestions: UseSuggestionsReturn
  className?: string
}

export const FieldSuggestionButton: React.FC<FieldSuggestionButtonProps> = ({
  field,
  suggestions,
  className,
}) => {
  const fieldSuggestions = suggestions.getSuggestionsForField(field)

  if (fieldSuggestions.length === 0) {
    return null
  }

  const bestSuggestion = fieldSuggestions[0] // Already sorted by confidence
  const formattedValue =
    BusinessSuggestionsService.formatSuggestionValue(bestSuggestion)

  return (
    <button
      onClick={() => suggestions.applySuggestion(bestSuggestion)}
      className={cn(
        'inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors',
        className
      )}
      title={bestSuggestion.reason}
    >
      <Lightbulb className="w-3 h-3 mr-1" />
      Try: {formattedValue}
    </button>
  )
}
