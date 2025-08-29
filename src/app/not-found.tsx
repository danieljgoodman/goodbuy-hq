'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-50">
      <div className="text-center max-w-md p-8">
        <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl font-bold text-secondary-500">404</span>
        </div>

        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          Page Not Found
        </h1>

        <p className="text-secondary-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full border border-secondary-300 text-secondary-700 px-6 py-3 rounded-lg font-medium hover:bg-secondary-50 transition-colors focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
