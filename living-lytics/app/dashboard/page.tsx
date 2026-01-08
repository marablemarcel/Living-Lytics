'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { signOut } from '@/lib/auth/actions';
import { getProfile } from '@/lib/api/profile';
import type { Profile } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function checkProfileCompletion() {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      console.log('Checking profile for user:', user.id);
      const { data: profileData, error } = await getProfile(user.id);
      console.log('Profile result:', profileData);

      if (error || !profileData) {
        // No profile exists, redirect to onboarding
        router.push('/onboarding');
      } else {
        // Profile exists, save it and show dashboard
        setProfile(profileData);
        setCheckingProfile(false);
      }
    }

    if (!loading && user) {
      checkProfileCompletion();
    } else if (!loading && !user) {
      setCheckingProfile(false);
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-4xl font-bold">
            Welcome back, {profile?.business_name || 'User'}!
          </CardTitle>
          <CardDescription className="text-xl font-medium">
            {profile?.business_type ? `${profile.business_type} Business` : 'Living Lytics Dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Logged in as: {user?.email}
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
