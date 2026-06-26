import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import type { UserRole } from '@/lib/types';

/**
 * Route access rules by role.
 * Each role can only access paths under its prefix.
 */
const ROLE_ROUTE_PREFIX: Record<UserRole, string> = {
  customer: '/customer',
  inspector: '/inspector',
  admin: '/admin',
};

/**
 * Routes that don't require authentication.
 */
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/about',
  '/pricing',
  '/contact',
  '/blog',
  '/reports', // public shareable reports
];

/**
 * Auth-related paths (redirect to dashboard if already logged in).
 */
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

/**
 * Check if a path is public (no auth required).
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Check if a path is an auth page.
 */
function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Check if a path is a dashboard path (requires auth).
 */
function isDashboardPath(pathname: string): boolean {
  return (
    pathname.startsWith('/customer') ||
    pathname.startsWith('/inspector') ||
    pathname.startsWith('/admin')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // static files (favicon.ico, sw.js, etc.)
  ) {
    return NextResponse.next();
  }

  // Create Supabase client and refresh session
  const { supabase, response } = createClient(request);

  // Get current session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---- UNAUTHENTICATED USER ----
  if (!user) {
    // Allow public paths
    if (isPublicPath(pathname)) {
      return response;
    }
    // Redirect to login for protected paths
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ---- AUTHENTICATED USER ----

  // Get user role from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = (profile?.role as UserRole) || 'customer';

  // Redirect authenticated users away from auth pages
  if (isAuthPath(pathname)) {
    return NextResponse.redirect(new URL(ROLE_ROUTE_PREFIX[role], request.url));
  }

  // Root path — redirect to appropriate dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL(ROLE_ROUTE_PREFIX[role], request.url));
  }

  // Allow public paths for authenticated users
  if (isPublicPath(pathname) && !isDashboardPath(pathname)) {
    return response;
  }

  // ---- ROLE-BASED ACCESS CONTROL ----
  if (isDashboardPath(pathname)) {
    const allowedPrefix = ROLE_ROUTE_PREFIX[role];

    // Check if user is accessing their own portal
    if (!pathname.startsWith(allowedPrefix)) {
      // Redirect to correct portal
      return NextResponse.redirect(new URL(allowedPrefix, request.url));
    }
  }

  // Set role header for downstream use
  response.headers.set('x-user-role', role);
  response.headers.set('x-user-id', user.id);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
