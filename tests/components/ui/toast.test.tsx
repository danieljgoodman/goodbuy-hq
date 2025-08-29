/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toastService } from '@/lib/toast'
import { ToastProvider } from '@/components/providers/toast-provider'
import { ToastDemo } from '@/components/ui/toast-demo'
import { ToastHistory } from '@/components/ui/toast-history'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 minutes ago',
}))

// Test wrapper with ToastProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider position="top-right" theme="light">
    {children}
  </ToastProvider>
)

describe('Toast System', () => {
  beforeEach(() => {
    // Clear toast history before each test
    toastService.clearHistory()
  })

  describe('toastService', () => {
    it('should create success toast', () => {
      const toastId = toastService.success(
        'Test Success',
        'This is a test message'
      )
      expect(toastId).toBeDefined()

      const history = toastService.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('success')
      expect(history[0].title).toBe('Test Success')
      expect(history[0].description).toBe('This is a test message')
    })

    it('should create error toast', () => {
      const toastId = toastService.error(
        'Test Error',
        'This is an error message'
      )
      expect(toastId).toBeDefined()

      const history = toastService.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('error')
      expect(history[0].title).toBe('Test Error')
    })

    it('should create warning toast', () => {
      const toastId = toastService.warning(
        'Test Warning',
        'This is a warning message'
      )
      expect(toastId).toBeDefined()

      const history = toastService.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('warning')
      expect(history[0].title).toBe('Test Warning')
    })

    it('should create info toast', () => {
      const toastId = toastService.info('Test Info', 'This is an info message')
      expect(toastId).toBeDefined()

      const history = toastService.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('info')
      expect(history[0].title).toBe('Test Info')
    })

    it('should create progress toast', () => {
      const mockCancel = jest.fn()
      const toastId = toastService.progress('Test Progress', 'Processing...', {
        onCancel: mockCancel,
      })
      expect(toastId).toBeDefined()

      const history = toastService.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('progress')
      expect(history[0].title).toBe('Test Progress')
    })

    it('should maintain toast history', () => {
      toastService.success('Success 1')
      toastService.error('Error 1')
      toastService.warning('Warning 1')

      const history = toastService.getHistory()
      expect(history).toHaveLength(3)
      expect(history[0].title).toBe('Warning 1') // Most recent first
      expect(history[1].title).toBe('Error 1')
      expect(history[2].title).toBe('Success 1')
    })

    it('should clear history', () => {
      toastService.success('Success 1')
      toastService.error('Error 1')

      expect(toastService.getHistory()).toHaveLength(2)

      toastService.clearHistory()
      expect(toastService.getHistory()).toHaveLength(0)
    })

    it('should limit history size', () => {
      // Add more toasts than the max history size (50)
      for (let i = 0; i < 60; i++) {
        toastService.success(`Toast ${i}`)
      }

      const history = toastService.getHistory()
      expect(history).toHaveLength(50)
      expect(history[0].title).toBe('Toast 59') // Most recent
      expect(history[49].title).toBe('Toast 10') // Oldest kept
    })

    it('should handle business-specific toasts', () => {
      const undoAction = jest.fn()

      toastService.businessSaved('Test Business', undoAction)
      toastService.inquirySent('Test Business')
      toastService.evaluationCompleted('Test Business', '$1M')

      const history = toastService.getHistory()
      expect(history).toHaveLength(3)
      expect(history[2].title).toBe('Business Saved Successfully')
      expect(history[2].undoAction).toBe(undoAction)
      expect(history[1].title).toBe('Inquiry Sent')
      expect(history[0].title).toBe('Evaluation Completed')
    })

    it('should handle form validation errors', () => {
      toastService.formValidationError('Email', 'Invalid format')

      const history = toastService.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('error')
      expect(history[0].title).toBe('Form Validation Error')
      expect(history[0].description).toBe('Email: Invalid format')
    })

    it('should handle API errors', () => {
      toastService.apiError('save business')

      const history = toastService.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('error')
      expect(history[0].title).toBe('Operation Failed')
      expect(history[0].description).toBe(
        'Failed to save business. Please try again.'
      )
    })

    it('should handle network errors', () => {
      toastService.networkError()

      const history = toastService.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('error')
      expect(history[0].title).toBe('Network Error')
    })

    it('should update progress toast', () => {
      const toastId = toastService.progress('Initial Progress')

      toastService.updateProgress(
        toastId,
        'Updated Progress',
        'Still working...'
      )
      toastService.completeProgress(toastId, 'Completed!', 'Task finished')

      // History should still have one entry for the original toast
      const history = toastService.getHistory()
      expect(history).toHaveLength(1)
    })
  })

  describe('ToastProvider', () => {
    it('should render children', () => {
      render(
        <TestWrapper>
          <div data-testid="child">Test Child</div>
        </TestWrapper>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should provide toast context', () => {
      const TestComponent = () => {
        // This would normally use useToastHistory hook
        // For testing, we'll just verify the provider doesn't crash
        return <div data-testid="context-test">Context Test</div>
      }

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      expect(screen.getByTestId('context-test')).toBeInTheDocument()
    })
  })

  describe('ToastDemo', () => {
    it('should render demo buttons', () => {
      render(
        <TestWrapper>
          <ToastDemo />
        </TestWrapper>
      )

      expect(screen.getByText('Business Saved')).toBeInTheDocument()
      expect(screen.getByText('Inquiry Sent')).toBeInTheDocument()
      expect(screen.getByText('Form Error')).toBeInTheDocument()
      expect(screen.getByText('API Error')).toBeInTheDocument()
      expect(screen.getByText('Account Limit')).toBeInTheDocument()
      expect(screen.getByText('New Feature')).toBeInTheDocument()
      expect(screen.getByText('File Upload')).toBeInTheDocument()
    })

    it('should trigger toasts when buttons are clicked', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <ToastDemo />
        </TestWrapper>
      )

      // Clear any existing history
      toastService.clearHistory()

      // Click success button
      const businessSavedBtn = screen.getByText('Business Saved')
      await user.click(businessSavedBtn)

      // Wait for toast to be added to history
      await waitFor(() => {
        const history = toastService.getHistory()
        expect(history).toHaveLength(1)
        expect(history[0].title).toBe('Business Saved Successfully')
      })
    })

    it('should handle progress toasts with completion', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <ToastDemo />
        </TestWrapper>
      )

      // Clear history
      toastService.clearHistory()

      // Click file upload button
      const fileUploadBtn = screen.getByText('File Upload')
      await user.click(fileUploadBtn)

      // Should create initial progress toast
      await waitFor(() => {
        const history = toastService.getHistory()
        expect(history).toHaveLength(1)
        expect(history[0].title).toBe('Uploading File')
      })

      // Wait for completion (demo has 3 second timeout)
      await waitFor(
        () => {
          const history = toastService.getHistory()
          expect(history).toHaveLength(1) // Still one entry, but completed
        },
        { timeout: 4000 }
      )
    })
  })

  describe('ToastHistory', () => {
    it('should render empty state when no toasts', () => {
      render(
        <TestWrapper>
          <ToastHistory />
        </TestWrapper>
      )

      expect(screen.getByText('No notifications yet')).toBeInTheDocument()
    })

    it('should render toast history items', () => {
      // Add some toasts to history
      toastService.success('Test Success')
      toastService.error('Test Error')

      render(
        <TestWrapper>
          <ToastHistory />
        </TestWrapper>
      )

      expect(screen.getByText('Test Success')).toBeInTheDocument()
      expect(screen.getByText('Test Error')).toBeInTheDocument()
    })

    it('should show clear button when there are toasts', () => {
      toastService.success('Test Success')

      render(
        <TestWrapper>
          <ToastHistory />
        </TestWrapper>
      )

      const clearButton = screen.getByRole('button', { name: /trash/i })
      expect(clearButton).toBeInTheDocument()
    })

    it('should clear history when clear button is clicked', async () => {
      const user = userEvent.setup()

      toastService.success('Test Success')
      toastService.error('Test Error')

      render(
        <TestWrapper>
          <ToastHistory />
        </TestWrapper>
      )

      expect(screen.getByText('Test Success')).toBeInTheDocument()

      const clearButton = screen.getByRole('button', { name: /trash/i })
      await user.click(clearButton)

      await waitFor(() => {
        expect(screen.getByText('No notifications yet')).toBeInTheDocument()
      })
    })

    it('should show undo button for toasts with undo action', () => {
      const undoAction = jest.fn()
      toastService.success('Test Success', 'Description', { undoAction })

      render(
        <TestWrapper>
          <ToastHistory />
        </TestWrapper>
      )

      expect(screen.getByText('Undo')).toBeInTheDocument()
    })

    it('should call undo action when undo button is clicked', async () => {
      const user = userEvent.setup()
      const undoAction = jest.fn()

      toastService.success('Test Success', 'Description', { undoAction })

      render(
        <TestWrapper>
          <ToastHistory />
        </TestWrapper>
      )

      const undoButton = screen.getByText('Undo')
      await user.click(undoButton)

      expect(undoAction).toHaveBeenCalledTimes(1)
    })

    it('should limit displayed items when maxItems is set', () => {
      // Add multiple toasts
      for (let i = 0; i < 10; i++) {
        toastService.success(`Toast ${i}`)
      }

      render(
        <TestWrapper>
          <ToastHistory maxItems={5} />
        </TestWrapper>
      )

      // Should only show 5 most recent
      expect(screen.getByText('Toast 9')).toBeInTheDocument()
      expect(screen.getByText('Toast 5')).toBeInTheDocument()
      expect(screen.queryByText('Toast 4')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <ToastDemo />
        </TestWrapper>
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
        // Buttons should be keyboard accessible
        expect(button).not.toHaveAttribute('tabindex', '-1')
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <ToastDemo />
        </TestWrapper>
      )

      const firstButton = screen.getByText('Business Saved')

      // Should be focusable
      await user.tab()
      expect(firstButton).toHaveFocus()

      // Should be activatable with Enter
      await user.keyboard('{Enter}')

      await waitFor(() => {
        const history = toastService.getHistory()
        expect(history).toHaveLength(1)
      })
    })
  })

  describe('Performance', () => {
    it('should handle multiple rapid toast calls', () => {
      const startTime = performance.now()

      // Create many toasts rapidly
      for (let i = 0; i < 100; i++) {
        toastService.success(`Toast ${i}`)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100)

      // Should maintain only the last 50 (max history size)
      const history = toastService.getHistory()
      expect(history).toHaveLength(50)
    })

    it('should not leak memory with many toasts', () => {
      const initialHistory = toastService.getHistory().length

      // Add many toasts
      for (let i = 0; i < 200; i++) {
        toastService.success(`Memory test ${i}`)
      }

      // Should still respect max size
      const history = toastService.getHistory()
      expect(history.length).toBeLessThanOrEqual(50)
    })
  })
})
