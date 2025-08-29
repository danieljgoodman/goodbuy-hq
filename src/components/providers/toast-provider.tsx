'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { toastService, ToastHistoryItem } from '@/lib/toast'

interface ToastContextType {
  history: ToastHistoryItem[]
  clearHistory: () => void
  getRecentToasts: (limit?: number) => ToastHistoryItem[]
  hasUnreadToasts: boolean
  markAsRead: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToastHistory() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastHistory must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center'
  theme?: 'light' | 'dark' | 'system'
  closeButton?: boolean
  richColors?: boolean
  expand?: boolean
  visibleToasts?: number
  toastOptions?: {
    duration?: number
    style?: React.CSSProperties
    className?: string
  }
}

export function ToastProvider({
  children,
  position = 'top-right',
  theme = 'system',
  closeButton = true,
  richColors = true,
  expand = false,
  visibleToasts = 3,
  toastOptions,
}: ToastProviderProps) {
  const [hasUnreadToasts, setHasUnreadToasts] = useState(false)

  const getHistory = useCallback(() => {
    return toastService.getHistory()
  }, [])

  const clearHistory = useCallback(() => {
    toastService.clearHistory()
    setHasUnreadToasts(false)
  }, [])

  const getRecentToasts = useCallback((limit: number = 5) => {
    return toastService.getHistory().slice(0, limit)
  }, [])

  const markAsRead = useCallback(() => {
    setHasUnreadToasts(false)
  }, [])

  // Listen for new toasts (simplified version)
  React.useEffect(() => {
    const checkForNewToasts = () => {
      const history = toastService.getHistory()
      if (history.length > 0) {
        setHasUnreadToasts(true)
      }
    }

    const interval = setInterval(checkForNewToasts, 1000)
    return () => clearInterval(interval)
  }, [])

  const contextValue: ToastContextType = {
    history: getHistory(),
    clearHistory,
    getRecentToasts,
    hasUnreadToasts,
    markAsRead,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toaster
        position={position}
        theme={theme}
        closeButton={closeButton}
        richColors={richColors}
        expand={expand}
        visibleToasts={visibleToasts}
        toastOptions={toastOptions}
      />
    </ToastContext.Provider>
  )
}
