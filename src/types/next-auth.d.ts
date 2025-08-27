import { UserType } from '@prisma/client'
import type { DefaultSession, DefaultUser } from 'next-auth'
import type { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      userType: UserType
      firstName?: string
      lastName?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    userType: UserType
    firstName?: string
    lastName?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    userType: UserType
    firstName?: string
    lastName?: string
  }
}