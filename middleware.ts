import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /admin, /mascotas)
  const { pathname } = request.nextUrl

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    // In a real application, you would validate the JWT token here
    // For now, we'll let the client-side ProtectedRoute handle the protection
    return NextResponse.next()
  }

  // Protected user routes
  if (pathname.startsWith('/mascotas') || pathname.startsWith('/mis-procesos')) {
    // In a real application, you would validate the JWT token here
    // For now, we'll let the client-side ProtectedRoute handle the protection
    return NextResponse.next()
  }

  // Public routes - allow access
  return NextResponse.next()
}

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}