import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // If there's an error from the OAuth provider, redirect to login with error
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  // If there's a code, exchange it for a session
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        return NextResponse.redirect(
          new URL('/auth/login?error=Unable to authenticate', request.url)
        );
      }

      // Successfully authenticated, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (err) {
      console.error('Unexpected error during authentication:', err);
      return NextResponse.redirect(
        new URL('/auth/login?error=An unexpected error occurred', request.url)
      );
    }
  }

  // No code or error present, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url));
}
