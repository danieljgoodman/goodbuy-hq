import { toast, ExternalToast } from 'sonner'
import React from 'react'

export interface ToastHistoryItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'progress'
  title: string
  description?: string
  timestamp: Date
  undoAction?: () => void
}

class ToastService {
  private history: ToastHistoryItem[] = []
  private maxHistorySize = 50

  private addToHistory(item: ToastHistoryItem) {
    this.history.unshift(item)
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize)
    }
  }

  private createToastId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Success toast with business context
  success(
    title: string,
    description?: string,
    options?: ExternalToast & { undoAction?: () => void }
  ) {
    const id = this.createToastId()

    this.addToHistory({
      id,
      type: 'success',
      title,
      description,
      timestamp: new Date(),
      undoAction: options?.undoAction,
    })

    return toast.success(title, {
      description,
      duration: 4000,
      ...options,
      action: options?.undoAction
        ? {
            label: 'Undo',
            onClick: options.undoAction,
          }
        : options?.action,
    })
  }

  // Error toast with detailed error handling
  error(title: string, description?: string, options?: ExternalToast) {
    const id = this.createToastId()

    this.addToHistory({
      id,
      type: 'error',
      title,
      description,
      timestamp: new Date(),
    })

    return toast.error(title, {
      description,
      duration: 6000,
      ...options,
    })
  }

  // Warning toast for business alerts
  warning(title: string, description?: string, options?: ExternalToast) {
    const id = this.createToastId()

    this.addToHistory({
      id,
      type: 'warning',
      title,
      description,
      timestamp: new Date(),
    })

    return toast.warning(title, {
      description,
      duration: 5000,
      ...options,
    })
  }

  // Info toast for tips and updates
  info(title: string, description?: string, options?: ExternalToast) {
    const id = this.createToastId()

    this.addToHistory({
      id,
      type: 'info',
      title,
      description,
      timestamp: new Date(),
    })

    return toast.info(title, {
      description,
      duration: 4000,
      ...options,
    })
  }

  // Progress toast for long operations
  progress(
    title: string,
    description?: string,
    options?: { onCancel?: () => void }
  ) {
    const id = this.createToastId()

    this.addToHistory({
      id,
      type: 'progress',
      title,
      description,
      timestamp: new Date(),
    })

    return toast.loading(title, {
      description,
      duration: Infinity,
      action: options?.onCancel
        ? {
            label: 'Cancel',
            onClick: options.onCancel,
          }
        : undefined,
    })
  }

  // Update progress toast
  updateProgress(
    toastId: string | number,
    title: string,
    description?: string
  ) {
    return toast.loading(title, {
      id: toastId,
      description,
      duration: Infinity,
    })
  }

  // Complete progress toast
  completeProgress(
    toastId: string | number,
    title: string,
    description?: string
  ) {
    return toast.success(title, {
      id: toastId,
      description,
      duration: 4000,
    })
  }

  // Dismiss specific toast
  dismiss(toastId?: string | number) {
    toast.dismiss(toastId)
  }

  // Get toast history
  getHistory(): ToastHistoryItem[] {
    return [...this.history]
  }

  // Clear history
  clearHistory() {
    this.history = []
  }

  // Business-specific toast methods
  businessSaved(businessName: string, undoAction?: () => void) {
    return this.success(
      'Business Saved Successfully',
      `${businessName} has been added to your listings`,
      { undoAction }
    )
  }

  inquirySent(businessName: string) {
    return this.success(
      'Inquiry Sent',
      `Your inquiry about ${businessName} has been sent to the owner`
    )
  }

  evaluationCompleted(businessName: string, valuation: string) {
    return this.success(
      'Evaluation Completed',
      `${businessName} has been valued at ${valuation}`
    )
  }

  formValidationError(field: string, error: string) {
    return this.error('Form Validation Error', `${field}: ${error}`)
  }

  apiError(action: string, error?: string) {
    return this.error(
      'Operation Failed',
      error || `Failed to ${action}. Please try again.`
    )
  }

  networkError() {
    return this.error(
      'Network Error',
      'Please check your internet connection and try again'
    )
  }

  accountLimitWarning(limit: string, current: number, max: number) {
    return this.warning(
      'Account Limit Reached',
      `You've used ${current} of ${max} ${limit}. Consider upgrading your plan.`
    )
  }

  missingInfoWarning(fields: string[]) {
    return this.warning(
      'Missing Information',
      `Please complete: ${fields.join(', ')}`
    )
  }

  featureAnnouncement(feature: string, description: string) {
    return this.info(`New Feature: ${feature}`, description)
  }

  tipOfTheDay(tip: string) {
    return this.info('Tip of the Day', tip)
  }

  fileUploadProgress(filename: string, onCancel?: () => void) {
    return this.progress('Uploading File', `Uploading ${filename}...`, {
      onCancel,
    })
  }

  dataProcessing(operation: string, onCancel?: () => void) {
    return this.progress('Processing Data', `${operation} in progress...`, {
      onCancel,
    })
  }

  aiAnalysisProgress(businessName: string, onCancel?: () => void) {
    return this.progress(
      'AI Analysis in Progress',
      `Analyzing ${businessName} business data...`,
      { onCancel }
    )
  }
}

// Export singleton instance
export const toastService = new ToastService()

// Export convenience functions
export const showToast = toastService
export { toast }
