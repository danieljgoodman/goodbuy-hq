import { requireAuth, getCurrentUser } from '@/lib/auth-utils'
import { UserType } from '@prisma/client'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await requireAuth()
  const user = await getCurrentUser()

  // Redirect users to their role-specific dashboards
  switch (session.user.userType) {
    case UserType.BUSINESS_OWNER:
      redirect('/dashboard/business-owner')
    case UserType.BUYER:
      redirect('/dashboard/buyer')
    case UserType.BROKER:
      redirect('/dashboard/broker')
    case UserType.ADMIN:
      redirect('/dashboard/admin')
    default:
      // Fallback to general dashboard for unknown user types
      redirect('/dashboard/general')
  }
}
