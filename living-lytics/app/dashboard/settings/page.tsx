'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/app/hooks/useAuth'
import { getProfile, updateProfile } from '@/lib/api/profile'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, User, Lock, Info } from 'lucide-react'

// Validation schemas
const profileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.string().min(1, 'Please select a business type'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

const businessTypeOptions = [
  'E-commerce',
  'SaaS',
  'Agency',
  'Blog/Content',
  'Local Business',
  'Other',
]

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [connectedSourcesCount, setConnectedSourcesCount] = useState<number>(0)

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
    watch: watchProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: '',
      businessType: '',
    },
  })

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const selectedBusinessType = watchProfile('businessType')

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return

      setIsLoadingProfile(true)
      const { data, error } = await getProfile(user.id)

      if (error) {
        toast.error('Failed to load profile', {
          description: error,
        })
      } else if (data) {
        setProfile(data)
        setProfileValue('businessName', data.business_name || '')
        setProfileValue('businessType', data.business_type || '')
      }

      setIsLoadingProfile(false)
    }

    const fetchConnectedSources = async () => {
      try {
        const response = await fetch('/api/sources')
        if (response.ok) {
          const data = await response.json()
          setConnectedSourcesCount(data.connectedCount || 0)
        }
      } catch (error) {
        console.error('Failed to fetch connected sources:', error)
      }
    }

    if (!authLoading) {
      fetchProfile()
      fetchConnectedSources()
    }
  }, [user, authLoading, setProfileValue])

  // Handle profile update
  const onSubmitProfile = async (data: ProfileFormData) => {
    if (!user?.id) {
      toast.error('User not authenticated')
      return
    }

    setIsSavingProfile(true)
    const loadingToast = toast.loading('Saving changes...')

    try {
      const { data: updatedProfile, error } = await updateProfile(user.id, {
        business_name: data.businessName,
        business_type: data.businessType,
      })

      if (error) {
        toast.dismiss(loadingToast)
        toast.error('Failed to update profile', {
          description: error,
        })
      } else {
        setProfile(updatedProfile)
        toast.dismiss(loadingToast)
        toast.success('Profile updated successfully', {
          description: 'Your changes have been saved.',
        })
      }
    } catch (err) {
      toast.dismiss(loadingToast)
      toast.error('An unexpected error occurred', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Handle password change
  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    const loadingToast = toast.loading('Changing password...')

    try {
      const supabase = createClient()

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: data.currentPassword,
      })

      if (signInError) {
        toast.dismiss(loadingToast)
        toast.error('Current password is incorrect', {
          description: 'Please check your current password and try again.',
        })
        setIsChangingPassword(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) {
        toast.dismiss(loadingToast)
        toast.error('Failed to change password', {
          description: updateError.message,
        })
      } else {
        toast.dismiss(loadingToast)
        toast.success('Password changed successfully', {
          description: 'Your password has been updated.',
        })
        resetPasswordForm()
      }
    } catch (err) {
      toast.dismiss(loadingToast)
      toast.error('An unexpected error occurred', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (authLoading || isLoadingProfile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile Settings Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your business details and information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Business Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="businessName"
                  {...registerProfile('businessName')}
                  placeholder="Enter your business name"
                  disabled={isSavingProfile}
                />
                {profileErrors.businessName && (
                  <p className="text-sm text-destructive">
                    {profileErrors.businessName.message}
                  </p>
                )}
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <Label htmlFor="businessType">
                  Business Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedBusinessType}
                  onValueChange={(value) => setProfileValue('businessType', value)}
                  disabled={isSavingProfile}
                >
                  <SelectTrigger id="businessType" className="w-full">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {profileErrors.businessType && (
                  <p className="text-sm text-destructive">
                    {profileErrors.businessType.message}
                  </p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Your email address is managed by your account and cannot be changed here.
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password & Security Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Lock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>Password & Security</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">
                  Current Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerPassword('currentPassword')}
                  placeholder="Enter current password"
                  disabled={isChangingPassword}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  New Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword('newPassword')}
                  placeholder="Enter new password (min. 8 characters)"
                  disabled={isChangingPassword}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm New Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword('confirmPassword')}
                  placeholder="Confirm new password"
                  disabled={isChangingPassword}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Change Password Button */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Information Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View your account details and subscription status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Subscription Tier */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Subscription Tier</p>
                  <p className="text-xs text-muted-foreground">
                    Your current plan level
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold capitalize">
                    {profile?.subscription_tier || 'Free'}
                  </p>
                </div>
              </div>

              {/* Account Created */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-xs text-muted-foreground">
                    Member since
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Data Sources Connected */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Data Sources Connected</p>
                  <p className="text-xs text-muted-foreground">
                    Active integrations
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{connectedSourcesCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
