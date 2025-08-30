'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/loading'

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token && email) {
      verifyEmail()
    } else if (email) {
      setStatus('success')
      setMessage('Please check your email for a verification link.')
    } else {
      setStatus('error')
      setMessage('Invalid verification link.')
    }
  }, [token, email])

  const verifyEmail = async () => {
    try {
      const response = await fetch(
        `/api/auth/verify?token=${token}&email=${encodeURIComponent(email!)}`
      )
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Your email has been verified successfully!')

        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?message=verified')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Failed to verify email.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred while verifying your email.')
    }
  }

  const resendEmail = async () => {
    if (!email) return

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.')
      } else {
        setMessage(data.message || 'Failed to send verification email.')
      }
    } catch (error) {
      setMessage('An error occurred while sending the verification email.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center p-4">
      <div className="card w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <LoadingSpinner size="lg" className="mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Verifying your email...
            </h1>
            <p className="text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Email Verified!
            </h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            {token && (
              <p className="text-sm text-muted-foreground mb-6">
                Redirecting to sign in page...
              </p>
            )}
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continue to Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Verification Failed
            </h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="space-y-3">
              {email && (
                <button
                  onClick={resendEmail}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Resend Verification Email
                </button>
              )}
              <Link
                href="/auth/signup"
                className="inline-block w-full px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-accent transition-colors"
              >
                Back to Sign Up
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
