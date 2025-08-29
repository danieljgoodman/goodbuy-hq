'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoadingButton } from '@/components/ui/loading'
import { UserType } from '@prisma/client'
import { signUpSchema, type SignUpFormData } from '@/lib/form-schemas'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle,
  Info,
} from 'lucide-react'
import { toastService } from '@/lib/toast'

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: UserType.BUYER,
      company: '',
      position: '',
      agreeToTerms: false,
      subscribeNewsletter: false,
    },
    mode: 'onBlur', // Validate on blur for better UX
  })

  const watchUserType = form.watch('userType')
  const watchPassword = form.watch('password')

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

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

      const successMessage =
        'Account created successfully! Redirecting to verification...'
      setSuccess(successMessage)
      toastService.success(
        'Account Created!',
        'Please check your email for verification instructions'
      )

      // Redirect to verification page after a brief delay
      setTimeout(() => {
        router.push('/auth/verify?email=' + encodeURIComponent(data.email))
      }, 1500)
    } catch (err: any) {
      const errorMessage =
        err.message || 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
      toastService.formValidationError('Account Creation', errorMessage)
      form.setFocus('email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'linkedin') => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/onboarding' })
    } catch (err) {
      const errorMessage = `Failed to sign in with ${provider}`
      setError(errorMessage)
      toastService.error('OAuth Sign In Failed', errorMessage)
      setIsLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' }

    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

    if (score < 2) return { score, text: 'Weak', color: 'bg-red-500' }
    if (score < 4) return { score, text: 'Fair', color: 'bg-yellow-500' }
    if (score < 5) return { score, text: 'Good', color: 'bg-blue-500' }
    return { score, text: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(watchPassword || '')

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-secondary-900">
          Create Account
        </h1>
        <p className="mt-2 text-secondary-600">
          Join GoodBuy HQ and start your journey
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* OAuth Providers */}
      <div className="space-y-3">
        <LoadingButton
          isLoading={isLoading}
          onClick={() => handleOAuthSignIn('google')}
          variant="outline"
          size="lg"
          className="w-full justify-center gap-3"
          disabled={success !== ''}
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
          variant="outline"
          size="lg"
          className="w-full justify-center gap-3"
          disabled={success !== ''}
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John"
                      disabled={isLoading || success !== ''}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Doe"
                      disabled={isLoading || success !== ''}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="john@example.com"
                    disabled={isLoading || success !== ''}
                    className="h-11"
                    aria-describedby="email-description"
                  />
                </FormControl>
                <FormDescription id="email-description">
                  We'll send you a verification email at this address
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* User Type Field */}
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I am a *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading || success !== ''}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserType.BUYER}>
                      Business Buyer
                    </SelectItem>
                    <SelectItem value={UserType.BUSINESS_OWNER}>
                      Business Owner
                    </SelectItem>
                    <SelectItem value={UserType.BROKER}>
                      Business Broker
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  This helps us customize your experience
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conditional Company/Position Fields */}
          {(watchUserType === UserType.BUSINESS_OWNER ||
            watchUserType === UserType.BROKER) && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Company name"
                        disabled={isLoading || success !== ''}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Your role"
                        disabled={isLoading || success !== ''}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      disabled={isLoading || success !== ''}
                      className="h-11 pr-10"
                      aria-describedby="password-description"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                {watchPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-secondary-600">
                        {passwordStrength.text}
                      </span>
                    </div>
                    <FormDescription
                      id="password-description"
                      className="text-xs"
                    >
                      Must contain at least 8 characters, one uppercase, one
                      lowercase, and one number
                    </FormDescription>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      disabled={isLoading || success !== ''}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600"
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Terms and Conditions */}
          <FormField
            control={form.control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading || success !== ''}
                    aria-describedby="terms-description"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-primary-600 hover:text-primary-500 underline"
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-primary-600 hover:text-primary-500 underline"
                    >
                      Privacy Policy
                    </Link>{' '}
                    *
                  </FormLabel>
                  <FormDescription id="terms-description">
                    Required to create your account
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Newsletter Subscription */}
          <FormField
            control={form.control}
            name="subscribeNewsletter"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading || success !== ''}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    Send me updates about new features and market insights
                  </FormLabel>
                  <FormDescription>
                    You can unsubscribe at any time
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <LoadingButton
            isLoading={isLoading}
            type="submit"
            disabled={isLoading || success !== ''}
            variant="default"
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : success !== '' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Account Created!
              </>
            ) : (
              'Create Account'
            )}
          </LoadingButton>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-sm text-secondary-600">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="text-primary-600 hover:text-primary-500 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-sm"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
