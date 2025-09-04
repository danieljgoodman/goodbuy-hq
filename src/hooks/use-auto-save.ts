import { useState, useEffect, useCallback, useRef } from 'react'
import { BusinessFormData } from '@/lib/validation/business-form-schema'

export interface AutoSaveOptions {
  endpoint: string
  interval: number // milliseconds
  maxRetries: number
  enabled: boolean
}

export interface AutoSaveState {
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  error: string | null
}

export interface AutoSaveReturn extends AutoSaveState {
  triggerSave: () => Promise<void>
  resetSaveState: () => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
}

const defaultOptions: AutoSaveOptions = {
  endpoint: '/api/businesses/autosave',
  interval: 30000, // 30 seconds
  maxRetries: 3,
  enabled: true,
}

export const useAutoSave = (
  data: Partial<BusinessFormData>,
  options: Partial<AutoSaveOptions> = {}
): AutoSaveReturn => {
  const opts = { ...defaultOptions, ...options }

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveStatus: 'idle',
    error: null,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const lastDataRef = useRef<string>('')

  // Save function with retry logic
  const saveData = useCallback(async (): Promise<void> => {
    if (!opts.enabled || state.isSaving) return

    setState(prev => ({
      ...prev,
      isSaving: true,
      saveStatus: 'saving',
      error: null,
    }))

    try {
      const response = await fetch(opts.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'DRAFT',
          autoSaved: true,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Save failed: ${response.statusText}`)
      }

      const result = await response.json()

      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        saveStatus: 'saved',
        error: null,
      }))

      retryCountRef.current = 0

      // Clear success status after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, saveStatus: 'idle' }))
      }, 3000)
    } catch (error) {
      console.error('Auto-save failed:', error)

      retryCountRef.current += 1

      if (retryCountRef.current < opts.maxRetries) {
        // Exponential backoff retry
        const retryDelay = Math.pow(2, retryCountRef.current) * 1000
        setTimeout(() => saveData(), retryDelay)
      } else {
        setState(prev => ({
          ...prev,
          isSaving: false,
          saveStatus: 'error',
          error: error instanceof Error ? error.message : 'Save failed',
        }))
        retryCountRef.current = 0
      }
    }
  }, [data, opts.endpoint, opts.enabled, opts.maxRetries, state.isSaving])

  // Manual save trigger
  const triggerSave = useCallback(async (): Promise<void> => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await saveData()
  }, [saveData])

  // Reset save state
  const resetSaveState = useCallback(() => {
    setState(prev => ({
      ...prev,
      saveStatus: 'idle',
      error: null,
      hasUnsavedChanges: false,
    }))
  }, [])

  // Set unsaved changes flag
  const setHasUnsavedChanges = useCallback((hasChanges: boolean) => {
    setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }))
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (!opts.enabled) return

    const currentDataString = JSON.stringify(data)

    // Check if data has actually changed
    if (currentDataString === lastDataRef.current) return

    lastDataRef.current = currentDataString

    // Mark as having unsaved changes
    setState(prev => ({ ...prev, hasUnsavedChanges: true }))

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Only auto-save if we have meaningful data
    const hasMinimalData = data.title && data.title.length > 0

    if (hasMinimalData) {
      timeoutRef.current = setTimeout(() => {
        saveData()
      }, opts.interval)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, opts.enabled, opts.interval, saveData])

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        event.preventDefault()
        event.returnValue =
          'You have unsaved changes. Are you sure you want to leave?'

        // Attempt final save
        if (navigator.sendBeacon) {
          const blob = new Blob(
            [
              JSON.stringify({
                ...data,
                status: 'DRAFT',
                autoSaved: true,
                timestamp: new Date().toISOString(),
              }),
            ],
            { type: 'application/json' }
          )

          navigator.sendBeacon(opts.endpoint, blob)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [state.hasUnsavedChanges, data, opts.endpoint])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    ...state,
    triggerSave,
    resetSaveState,
    setHasUnsavedChanges,
  }
}
