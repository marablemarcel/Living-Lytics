import { createClient } from '@/lib/supabase/client';

export async function signUp(email: string, password: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch {
    return { data: null, error: 'An unexpected error occurred during signup' };
  }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  console.log('signIn function called with email:', email);

  try {
    console.log('Calling supabase.auth.signInWithPassword...');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('Supabase response:', { data, error });

    if (error) {
      console.log('Returning:', { data: null, error: error.message });
      return { data: null, error: error.message };
    }

    console.log('Returning:', { data, error: null });
    return { data, error: null };
  } catch {
    console.log('Returning:', { data: null, error: 'An unexpected error occurred during sign in' });
    return { data: null, error: 'An unexpected error occurred during sign in' };
  }
}

export async function signOut() {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch {
    return { data: null, error: 'An unexpected error occurred during sign out' };
  }
}

export async function getCurrentUser() {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: user, error: null };
  } catch {
    return { data: null, error: 'An unexpected error occurred while fetching user' };
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch {
    return { data: null, error: 'An unexpected error occurred during password reset' };
  }
}
