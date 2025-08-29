import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import BusinessListingForm from '@/components/forms/business-listing-form'

export default async function SellPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/sell')
  }

  if (
    session.user.userType !== 'BUSINESS_OWNER' &&
    session.user.userType !== 'ADMIN'
  ) {
    redirect('/dashboard?error=insufficient_permissions')
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              List Your Business for Sale
            </h1>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Create a comprehensive listing to attract qualified buyers. Our
              platform connects you with serious investors and entrepreneurs
              looking for opportunities like yours.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <BusinessListingForm />
      </div>

      {/* Help Section */}
      <div className="bg-primary-50 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary-900 mb-8 text-center">
              Tips for a Successful Listing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-secondary-900 mb-2">
                  Complete Information
                </h3>
                <p className="text-secondary-600 text-sm">
                  Provide detailed financial and operational information to
                  build buyer confidence.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-secondary-900 mb-2">
                  High-Quality Photos
                </h3>
                <p className="text-secondary-600 text-sm">
                  Upload professional photos of your business, storefront, and
                  key assets.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-secondary-900 mb-2">
                  Honest Pricing
                </h3>
                <p className="text-secondary-600 text-sm">
                  Set a realistic asking price based on your business metrics
                  and market value.
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold text-secondary-900 mb-4">
                Need Help?
              </h3>
              <p className="text-secondary-600 mb-4">
                Our team is here to help you create the perfect listing. Contact
                us if you need:
              </p>
              <ul className="list-disc list-inside text-secondary-600 space-y-1 mb-4">
                <li>Professional business valuation</li>
                <li>Marketing consultation</li>
                <li>Financial document preparation</li>
                <li>Photography services</li>
              </ul>
              <Button className="bg-primary-500 hover:bg-primary-600">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
