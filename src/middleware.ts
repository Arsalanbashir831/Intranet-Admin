import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from '@/constants/routes'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the pathname of the requests (e.g. /, /login, /dashboard)
  const isAuthPage = pathname.startsWith(ROUTES.AUTH.LOGIN)
  const isAdminPage = pathname.startsWith(ROUTES.ADMIN.DASHBOARD)
  const isRootPage = pathname === '/'
  
  // Get the access token from cookies or headers
  const accessToken = request.cookies.get('accessToken')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '')
  
  // If it's the root page, let the client-side handle the redirect
  if (isRootPage) {
    return NextResponse.next()
  }
  
  // If user is trying to access auth pages but is authenticated
  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL(ROUTES.ADMIN.DASHBOARD, request.url))
  }
  
  // If user is trying to access admin pages but is not authenticated
  if (isAdminPage && !accessToken) {
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
