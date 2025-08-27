import Link from 'next/link'
import SignInForm from '@/components/forms/signin-form'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-6">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
              GoodBuy HQ
            </h1>
          </Link>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-secondary-900">
              Welcome to the future of business transactions
            </h2>
            <p className="text-lg text-secondary-600">
              Connect with verified business owners, access detailed evaluations, and make informed decisions with our professional platform.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-secondary-700">Verified business listings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-secondary-700">Professional evaluations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-secondary-700">Secure transactions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign in form */}
        <div className="flex justify-center lg:justify-end">
          <div className="card w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  )
}