import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/pricing', '/about', '/contact', '/features'];

export async function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.url);

  const pathname = request.nextUrl.pathname;

  // Check if this is a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = pathname.startsWith('/auth');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Allow public routes without authentication
  if (isPublicRoute) {
    console.log('Public route, allowing access');
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('Session:', session ? { user: session.user.email, expires_at: session.expires_at } : null);

  // Check if session is expired
  if (session && session.expires_at) {
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();

    if (expiresAt < now) {
      console.log('Session expired, clearing and redirecting to login');
      // Session is expired, clear it
      await supabase.auth.signOut();
      const redirectUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If no session and trying to access dashboard routes, redirect to login
  if (!session && isDashboardRoute) {
    const redirectUrl = new URL('/auth/login', request.url);
    console.log('Redirecting to:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }

  // If has session and trying to access auth routes, redirect to dashboard
  if (session && isAuthRoute) {
    const redirectUrl = new URL('/dashboard', request.url);
    console.log('Redirecting to:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }

  console.log('Allowing request to continue');
  // Allow the request to continue
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (e.g. .png, .jpg, .svg, etc.)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    '/dashboard/:path*',
  ],
};
