import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Allow public routes
    const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/verify', '/auth/error']
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // Redirect to signin if not authenticated
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Role-based access control
    const userType = token.userType
    
    // Admin-only routes
    if (pathname.startsWith('/admin')) {
      if (userType !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }
    
    // Business owner/broker routes
    if (pathname.startsWith('/manage') || pathname.startsWith('/evaluations')) {
      if (!['BUSINESS_OWNER', 'BROKER', 'ADMIN'].includes(userType as string)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Always allow public routes
        const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/verify', '/auth/error']
        if (publicRoutes.includes(pathname)) {
          return true
        }
        
        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}