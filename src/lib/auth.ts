import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import LinkedInProvider from 'next-auth/providers/linkedin'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { UserType, SubscriptionTier, SubscriptionStatus } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
          image: profile.picture,
          userType: UserType.BUYER, // Default user type
        }
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
          image: profile.picture,
          userType: UserType.BUYER, // Default user type
        }
      },
    }),
    // Microsoft Azure AD Provider would be added here
    // AzureADProvider({
    //   clientId: process.env.AZURE_AD_CLIENT_ID!,
    //   clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    //   tenantId: process.env.AZURE_AD_TENANT_ID,
    // }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.hashedPassword) {
          throw new Error('No user found with this email')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          userType: user.userType,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Include user type and subscription info in JWT token
      if (user) {
        token.userType = user.userType
        token.firstName = user.firstName
        token.lastName = user.lastName
        // Fetch subscription info on login
        if (token.sub) {
          const userWithSubscription = await prisma.user.findUnique({
            where: { id: token.sub },
            include: { subscription: true },
          })
          if (userWithSubscription) {
            token.subscriptionTier = userWithSubscription.subscriptionTier
            token.subscriptionStatus = userWithSubscription.subscriptionStatus
            token.subscriptionId =
              userWithSubscription.subscriptionId || undefined
            token.currentPeriodEnd =
              userWithSubscription.currentPeriodEnd?.toISOString()
            token.trialEndsAt = userWithSubscription.trialEndsAt?.toISOString()
          }
        }
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token.userType = session.userType
        token.firstName = session.firstName
        token.lastName = session.lastName
        // Refresh subscription info on session update
        if (token.sub) {
          const userWithSubscription = await prisma.user.findUnique({
            where: { id: token.sub },
            include: { subscription: true },
          })
          if (userWithSubscription) {
            token.subscriptionTier = userWithSubscription.subscriptionTier
            token.subscriptionStatus = userWithSubscription.subscriptionStatus
            token.subscriptionId =
              userWithSubscription.subscriptionId || undefined
            token.currentPeriodEnd =
              userWithSubscription.currentPeriodEnd?.toISOString()
            token.trialEndsAt = userWithSubscription.trialEndsAt?.toISOString()
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.sub!
        session.user.userType = token.userType as UserType
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.subscriptionTier =
          token.subscriptionTier as SubscriptionTier
        session.user.subscriptionStatus =
          token.subscriptionStatus as SubscriptionStatus
        session.user.subscriptionId = token.subscriptionId as string
        session.user.currentPeriodEnd = token.currentPeriodEnd
          ? new Date(token.currentPeriodEnd)
          : undefined
        session.user.trialEndsAt = token.trialEndsAt
          ? new Date(token.trialEndsAt)
          : undefined
      }

      return session
    },
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-ins
      if (account?.provider === 'google' || account?.provider === 'linkedin') {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          // If user doesn't exist, create with additional profile data and default subscription
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                firstName: (profile as any)?.given_name,
                lastName: (profile as any)?.family_name,
                userType: UserType.BUYER,
                status: 'ACTIVE',
                emailVerified: new Date(),
                subscriptionTier: SubscriptionTier.FREE,
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                subscription: {
                  create: {
                    tier: SubscriptionTier.FREE,
                    status: SubscriptionStatus.ACTIVE,
                    aiAnalysesPerMonthLimit: 5,
                    portfolioSizeLimit: 1,
                    reportGenerationLimit: 2,
                  },
                },
              },
            })
          } else {
            // Update last login and ensure subscription exists
            const subscription = await prisma.subscription.findUnique({
              where: { userId: existingUser.id },
            })

            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() },
            })

            // Create default subscription if none exists
            if (!subscription) {
              await prisma.subscription.create({
                data: {
                  userId: existingUser.id,
                  tier: SubscriptionTier.FREE,
                  status: SubscriptionStatus.ACTIVE,
                  aiAnalysesPerMonthLimit: 5,
                  portfolioSizeLimit: 1,
                  reportGenerationLimit: 2,
                },
              })
            }
          }

          return true
        } catch (error) {
          console.error('Sign in error:', error)
          return false
        }
      }

      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
