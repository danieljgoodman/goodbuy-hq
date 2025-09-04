import { UserType, SubscriptionTier, SubscriptionStatus } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      userType: UserType
      firstName?: string
      lastName?: string
      subscriptionTier: SubscriptionTier
      subscriptionStatus: SubscriptionStatus
      subscriptionId?: string
      currentPeriodEnd?: Date
      trialEndsAt?: Date
    } & DefaultSession['user']
  }

  interface User {
    userType: UserType
    firstName?: string
    lastName?: string
    subscriptionTier?: SubscriptionTier
    subscriptionStatus?: SubscriptionStatus
    subscriptionId?: string
    currentPeriodEnd?: Date
    trialEndsAt?: Date
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userType: UserType
    firstName?: string
    lastName?: string
    subscriptionTier: SubscriptionTier
    subscriptionStatus: SubscriptionStatus
    subscriptionId?: string
    currentPeriodEnd?: string
    trialEndsAt?: string
  }
}
