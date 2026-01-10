'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BUSINESS_TYPES = [
  'E-commerce',
  'SaaS',
  'Agency',
  'Consulting',
  'Other',
] as const;

type ErrorDetails = {
  message?: string;
  code?: string;
};

const getErrorDetails = (err: unknown): ErrorDetails => {
  if (!err || typeof err !== 'object') {
    return {};
  }

  const record = err as Record<string, unknown>;
  const message = typeof record.message === 'string' ? record.message : undefined;
  const code = typeof record.code === 'string' ? record.code : undefined;

  return { message, code };
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 2;

  const handleNext = () => {
    if (step === 1) {
      if (!businessName.trim()) {
        setError('Business name is required');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!businessType) {
      setError('Business type is required');
      return;
    }

    if (!user) {
      setError('You must be logged in to complete onboarding');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { error: saveError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          business_name: businessName.trim(),
          business_type: businessType,
          subscription_tier: 'free',
          updated_at: new Date().toISOString(),
        });

      if (saveError) throw saveError;

      router.push('/dashboard');
    } catch (err) {
      console.error('Error saving profile:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      const details = getErrorDetails(err);
      if (details.message) {
        console.error('Error message:', details.message);
      }
      if (details.code) {
        console.error('Error code:', details.code);
      }
      setError('Failed to save your information. Please try again.');
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Living Lytics
          </CardTitle>
          <CardDescription className="text-center">
            Let&apos;s get your account set up
          </CardDescription>
          <div className="pt-2">
            <p className="text-sm text-center text-gray-500">
              Step {step} of {totalSteps}
            </p>
            <div className="mt-2 flex gap-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Enter your business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">
                  Business Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={businessType}
                  onValueChange={setBusinessType}
                  disabled={isLoading}
                >
                  <SelectTrigger id="businessType">
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Saving...' : 'Complete'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
