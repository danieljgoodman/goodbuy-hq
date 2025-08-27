import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from './auth'
import { UserType } from '@prisma/client'
import { prisma } from './prisma'

// Server-side authentication check
export async function getAuthSession() {
  return await getServerSession(authOptions)
}

// Require authentication - redirect to signin if not authenticated
export async function requireAuth(redirectTo?: string) {
  const session = await getAuthSession()
  
  if (!session || !session.user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(redirectTo || '/dashboard')}`)
  }
  
  return session
}

// Require specific user types
export async function requireUserType(
  allowedTypes: UserType[],
  redirectTo?: string
) {
  const session = await requireAuth(redirectTo)
  
  if (!allowedTypes.includes(session.user.userType)) {
    redirect('/unauthorized')
  }
  
  return session
}

// Get user with additional database information
export async function getCurrentUser() {
  const session = await getAuthSession()
  
  if (!session?.user?.id) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      businesses: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      },
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
  
  return user
}

// Check if user has specific permissions
export function hasPermission(
  userType: UserType,
  requiredPermissions: UserType[]
): boolean {
  return requiredPermissions.includes(userType)
}

// Role-based access control helpers
export const PERMISSIONS = {
  // General permissions
  VIEW_BUSINESSES: [UserType.BUYER, UserType.BUSINESS_OWNER, UserType.BROKER, UserType.ADMIN],
  CREATE_BUSINESS: [UserType.BUSINESS_OWNER, UserType.BROKER, UserType.ADMIN],
  EDIT_BUSINESS: [UserType.BUSINESS_OWNER, UserType.BROKER, UserType.ADMIN],
  DELETE_BUSINESS: [UserType.BUSINESS_OWNER, UserType.ADMIN],
  
  // Evaluation permissions
  VIEW_EVALUATIONS: [UserType.BUYER, UserType.BUSINESS_OWNER, UserType.BROKER, UserType.ADMIN],
  CREATE_EVALUATION: [UserType.BROKER, UserType.ADMIN],
  EDIT_EVALUATION: [UserType.BROKER, UserType.ADMIN],
  DELETE_EVALUATION: [UserType.ADMIN],
  
  // User management
  VIEW_USERS: [UserType.ADMIN],
  EDIT_USERS: [UserType.ADMIN],
  DELETE_USERS: [UserType.ADMIN],
  
  // Admin permissions
  VIEW_ANALYTICS: [UserType.ADMIN],
  MANAGE_SYSTEM: [UserType.ADMIN],
} as const

// Middleware-compatible auth check
export async function validateSession(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    return session
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}