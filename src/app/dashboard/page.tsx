import { requireAuth, getCurrentUser } from '@/lib/auth-utils'
import { UserType } from '@prisma/client'

export default async function DashboardPage() {
  const session = await requireAuth()
  const user = await getCurrentUser()

  const getDashboardTitle = (userType: UserType) => {
    switch (userType) {
      case UserType.BUSINESS_OWNER:
        return 'Business Owner Dashboard'
      case UserType.BUYER:
        return 'Buyer Dashboard'
      case UserType.BROKER:
        return 'Broker Dashboard'
      case UserType.ADMIN:
        return 'Admin Dashboard'
      default:
        return 'Dashboard'
    }
  }

  const getUserTypeDescription = (userType: UserType) => {
    switch (userType) {
      case UserType.BUSINESS_OWNER:
        return 'Manage your business listings and track interested buyers'
      case UserType.BUYER:
        return 'Explore businesses for sale and manage your favorites'
      case UserType.BROKER:
        return 'Manage client listings and provide professional evaluations'
      case UserType.ADMIN:
        return 'System administration and user management'
      default:
        return 'Welcome to your dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">
            {getDashboardTitle(session.user.userType)}
          </h1>
          <p className="text-lg text-secondary-600">
            {getUserTypeDescription(session.user.userType)}
          </p>
        </div>

        {/* User Info Card */}
        <div className="card mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {user?.firstName?.[0] || session.user.name?.[0] || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : session.user.name || 'User'}
              </h2>
              <p className="text-secondary-600">{session.user.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {session.user.userType.replace('_', ' ').toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {session.user.userType === UserType.BUSINESS_OWNER && (
            <>
              <div className="card text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {user?.businesses?.length || 0}
                </div>
                <div className="text-secondary-600">Active Listings</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-success-600 mb-2">0</div>
                <div className="text-secondary-600">Inquiries</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-accent-600 mb-2">0</div>
                <div className="text-secondary-600">Views</div>
              </div>
            </>
          )}

          {session.user.userType === UserType.BUYER && (
            <>
              <div className="card text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">0</div>
                <div className="text-secondary-600">Saved Businesses</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-success-600 mb-2">0</div>
                <div className="text-secondary-600">Active Inquiries</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-accent-600 mb-2">0</div>
                <div className="text-secondary-600">Recently Viewed</div>
              </div>
            </>
          )}

          {session.user.userType === UserType.BROKER && (
            <>
              <div className="card text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {user?.businesses?.length || 0}
                </div>
                <div className="text-secondary-600">Client Listings</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-success-600 mb-2">
                  {user?.evaluations?.length || 0}
                </div>
                <div className="text-secondary-600">Evaluations</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-accent-600 mb-2">0</div>
                <div className="text-secondary-600">Active Deals</div>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-8 text-secondary-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>No recent activity to display</p>
            <p className="text-sm mt-1">
              Start by exploring businesses or creating your first listing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}