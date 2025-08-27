'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LoadingButton } from '@/components/ui/loading'
import { UserType } from '@prisma/client'

const signUpSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    userType: z.nativeEnum(UserType),
    company: z.string().optional(),
    position: z.string().optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignUpFormData = z.infer<typeof signUpSchema>

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userType: UserType.BUYER,
    },
  })

  const watchUserType = watch('userType')

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create account')
      }

      // Redirect to verification page
      router.push('/auth/verify?email=' + encodeURIComponent(data.email))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'linkedin') => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/onboarding' })
    } catch (err) {
      setError('Failed to sign in with ' + provider)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-secondary-900">
          Create Account
        </h1>
        <p className="mt-2 text-secondary-600">
          Join GoodBuy HQ and start your journey
        </p>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* OAuth Providers */}
      <div className="space-y-3">
        <LoadingButton
          isLoading={isLoading}
          onClick={() => handleOAuthSignIn('google')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </LoadingButton>

        <LoadingButton
          isLoading={isLoading}
          onClick={() => handleOAuthSignIn('linkedin')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Continue with LinkedIn
        </LoadingButton>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-secondary-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-secondary-500">
            Or create account with email
          </span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-secondary-700 mb-1"
            >
              First Name
            </label>
            <input
              {...register('firstName')}
              type="text"
              className="input-field"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-error-600">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-secondary-700 mb-1"
            >
              Last Name
            </label>
            <input
              {...register('lastName')}
              type="text"
              className="input-field"
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-error-600">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            className="input-field"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="userType"
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            I am a
          </label>
          <select {...register('userType')} className="input-field">
            <option value={UserType.BUYER}>Business Buyer</option>
            <option value={UserType.BUSINESS_OWNER}>Business Owner</option>
            <option value={UserType.BROKER}>Business Broker</option>
          </select>
          {errors.userType && (
            <p className="mt-1 text-sm text-error-600">
              {errors.userType.message}
            </p>
          )}
        </div>

        {(watchUserType === UserType.BUSINESS_OWNER ||
          watchUserType === UserType.BROKER) && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Company
              </label>
              <input
                {...register('company')}
                type="text"
                className="input-field"
                placeholder="Company name"
              />
            </div>

            <div>
              <label
                htmlFor="position"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Position
              </label>
              <input
                {...register('position')}
                type="text"
                className="input-field"
                placeholder="Your role"
              />
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            className="input-field"
            placeholder="Create a password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-error-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            Confirm Password
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            className="input-field"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <LoadingButton
          isLoading={isLoading}
          type="submit"
          className="w-full btn-primary px-4 py-3 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2"
        >
          Create Account
        </LoadingButton>
      </form>

      <div className="text-center">
        <p className="text-sm text-secondary-600">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
