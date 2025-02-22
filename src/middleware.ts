import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Paths that require authentication
const protectedPaths = ['/dashboard', '/account']
// Paths that should not be accessible when authenticated
const authPaths = ['/auth/login', '/auth/signup']

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  const path = request.nextUrl.pathname

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(prefix => path.startsWith(prefix))
  // Check if the path is an auth path
  const isAuthPath = authPaths.some(prefix => path.startsWith(prefix))

  // Redirect authenticated users trying to access auth pages
  if (isAuthenticated && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users trying to access protected pages
  if (!isAuthenticated && isProtectedPath) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 