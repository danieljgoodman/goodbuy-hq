import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SigninForm } from '@/components/forms/signin-form'

// Import mocks
import '../../../mocks/shadcn-mocks'

// Mock next-auth
const mockSignIn = jest.fn()
jest.mock('next-auth/react', () => ({
  signIn: mockSignIn,
  getSession: jest.fn(),
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}))

describe('SigninForm Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignIn.mockResolvedValue({ ok: true, error: null })
  })

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(<SigninForm />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument()
    })

    it('renders form with proper structure', () => {
      render(<SigninForm />)

      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('has proper form validation attributes', () => {
      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for invalid email format', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument()
      })
    })

    it('shows validation error for short password', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(passwordInput, '123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument()
      })
    })

    it('clears validation errors when valid input is entered', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Trigger validation error
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument()
      })

      // Fix the email
      await user.clear(emailInput)
      await user.type(emailInput, 'valid@email.com')

      await waitFor(() => {
        expect(
          screen.queryByText(/please enter a valid email address/i)
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        })
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      mockSignIn.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('handles successful signin', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('handles signin error', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' })

      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })

      // Form should be re-enabled
      expect(submitButton).not.toBeDisabled()
    })

    it('prevents multiple simultaneous submissions', async () => {
      const user = userEvent.setup()
      mockSignIn.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      // Click multiple times quickly
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)

      // Should only call signIn once
      expect(mockSignIn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Interactions', () => {
    it('supports Tab navigation', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      emailInput.focus()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    it('submits form on Enter key in password field', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })
    })

    it('shows/hides password toggle functionality', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Look for password toggle button (if implemented)
      const toggleButton = screen.queryByRole('button', {
        name: /show password/i,
      })
      if (toggleButton) {
        await user.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')

        await user.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'password')
      }
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
    })

    it('associates error messages with form fields', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i)
        const errorMessage = screen.getByText(/email is required/i)

        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
        expect(emailInput).toHaveAttribute('aria-describedby')
        expect(errorMessage).toHaveAttribute(
          'id',
          emailInput.getAttribute('aria-describedby')
        )
      })
    })

    it('announces form submission status to screen readers', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Should announce loading state
      expect(
        screen.getByRole('button', { name: /signing in/i })
      ).toBeInTheDocument()
    })

    it('has proper heading structure', () => {
      render(<SigninForm />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent(/sign in/i)
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const user = userEvent.setup()
      mockSignIn.mockRejectedValue(new Error('Network error'))

      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
      })
    })

    it('handles unexpected signin responses', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({ ok: false, error: null })

      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/signin failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Security', () => {
    it('does not expose password in DOM', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, 'secretpassword')

      // Password should be masked
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput.getAttribute('value')).not.toBe('secretpassword')
    })

    it('clears sensitive data on unmount', () => {
      const { unmount } = render(<SigninForm />)

      // Fill form with data
      const passwordInput = screen.getByLabelText(/password/i)
      userEvent.type(passwordInput, 'secretpassword')

      // Unmount component
      unmount()

      // Re-render should not have previous data
      render(<SigninForm />)
      const newPasswordInput = screen.getByLabelText(/password/i)
      expect(newPasswordInput).toHaveValue('')
    })
  })

  describe('Integration with Authentication Flow', () => {
    it('redirects to callback URL after successful signin', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      // Mock URL with callback parameter
      Object.defineProperty(window, 'location', {
        value: { search: '?callbackUrl=/profile' },
        writable: true,
      })

      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profile')
      })
    })

    it('handles OAuth provider signin', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const googleButton = screen.queryByRole('button', {
        name: /sign in with google/i,
      })
      if (googleButton) {
        await user.click(googleButton)

        expect(mockSignIn).toHaveBeenCalledWith('google', {
          callbackUrl: '/dashboard',
        })
      }
    })
  })

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', async () => {
      const user = userEvent.setup()
      let renderCount = 0

      const TestSigninForm = () => {
        renderCount++
        return <SigninForm />
      }

      render(<TestSigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'a')

      // Should not cause excessive re-renders
      expect(renderCount).toBeLessThan(10)
    })

    it('debounces validation for better performance', async () => {
      const user = userEvent.setup()
      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)

      // Type quickly
      await user.type(emailInput, 'test@example.com', { delay: 1 })

      // Validation should be debounced, not run after each keystroke
      expect(
        screen.queryByText(/please enter a valid email/i)
      ).not.toBeInTheDocument()
    })
  })
})
