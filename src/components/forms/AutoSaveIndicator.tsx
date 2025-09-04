import React from 'react'
import { Save, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AutoSaveState } from '@/hooks/use-auto-save'

interface AutoSaveIndicatorProps {
  saveState: AutoSaveState
  className?: string
  compact?: boolean
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  saveState,
  className,
  compact = false,
}) => {
  const { saveStatus, lastSaved, hasUnsavedChanges, isSaving, error } =
    saveState

  const formatLastSaved = (date: Date | null): string => {
    if (!date) return ''

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)

    if (diffMinutes < 1) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    return date.toLocaleDateString()
  }

  const getStatusConfig = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: Save,
          text: compact ? 'Saving...' : 'Saving changes...',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          animate: true,
        }

      case 'saved':
        return {
          icon: CheckCircle,
          text: compact ? 'Saved' : `Saved ${formatLastSaved(lastSaved)}`,
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          animate: false,
        }

      case 'error':
        return {
          icon: AlertCircle,
          text: compact ? 'Error' : error || 'Save failed',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          animate: false,
        }

      default: // idle
        if (hasUnsavedChanges) {
          return {
            icon: Clock,
            text: compact ? 'Unsaved' : 'Unsaved changes',
            textColor: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            animate: false,
          }
        }

        return {
          icon: CheckCircle,
          text: compact ? 'Saved' : `Saved ${formatLastSaved(lastSaved)}`,
          textColor: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          animate: false,
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium',
          config.textColor,
          config.bgColor,
          config.borderColor,
          config.animate && 'animate-pulse',
          className
        )}
      >
        <Icon className="w-3 h-3 mr-1" />
        <span>{config.text}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium',
        config.textColor,
        config.bgColor,
        config.borderColor,
        config.animate && 'animate-pulse',
        className
      )}
    >
      <Icon className="w-4 h-4 mr-2" />
      <span>{config.text}</span>
    </div>
  )
}

interface AutoSaveStatusBarProps {
  saveState: AutoSaveState
  onManualSave?: () => void
  className?: string
}

export const AutoSaveStatusBar: React.FC<AutoSaveStatusBarProps> = ({
  saveState,
  onManualSave,
  className,
}) => {
  const { hasUnsavedChanges, isSaving, saveStatus, error } = saveState

  // Show a prominent status bar for errors or unsaved changes
  if (error || (hasUnsavedChanges && saveStatus === 'idle')) {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-lg border',
          error ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200',
          className
        )}
      >
        <div className="flex items-center">
          <AutoSaveIndicator saveState={saveState} />
          {error && (
            <span className="ml-2 text-sm text-red-600">
              Changes may not be saved. Please try saving manually.
            </span>
          )}
        </div>

        {onManualSave && (
          <button
            onClick={onManualSave}
            disabled={isSaving}
            className={cn(
              'px-3 py-1 text-sm font-medium rounded-md border',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              error
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
              isSaving && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSaving ? 'Saving...' : 'Save Now'}
          </button>
        )}
      </div>
    )
  }

  // Subtle status indicator for normal states
  return (
    <div className={cn('flex justify-end', className)}>
      <AutoSaveIndicator saveState={saveState} compact />
    </div>
  )
}
