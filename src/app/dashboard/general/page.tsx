import { requireAuth, getCurrentUser } from '@/lib/auth-utils'
import DashboardClient from '../dashboard-client'
import { UserType } from '@prisma/client'

export default async function GeneralDashboardPage() {
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
    <DashboardClient
      session={session}
      user={user}
      dashboardTitle={getDashboardTitle(session.user.userType)}
      dashboardDescription={getUserTypeDescription(session.user.userType)}
    />
  )
}
