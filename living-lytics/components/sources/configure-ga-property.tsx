'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ConfigureGAPropertyProps {
  sourceId: string
  currentPropertyId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ConfigureGAProperty({
  sourceId,
  currentPropertyId,
  open,
  onOpenChange,
  onSaved,
}: ConfigureGAPropertyProps) {
  const [propertyId, setPropertyId] = useState(currentPropertyId || '')
  const [saving, setSaving] = useState(false)

  // Reset local state when dialog opens
  useEffect(() => {
    if (open) {
      setPropertyId(currentPropertyId || '')
    }
  }, [currentPropertyId, open])

  const handleSave = async () => {
    const normalizedPropertyId = propertyId.trim()

    if (!normalizedPropertyId) {
      toast.error('Please enter a property ID')
      return
    }

    // Basic validation: ensure it's numeric
    if (!/^\d+$/.test(normalizedPropertyId)) {
        toast.error('Property ID should contain numbers only')
        return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/sources/${sourceId}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: normalizedPropertyId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save property ID')
      }

      toast.success('Property ID saved successfully')
      onSaved()
      onOpenChange(false)
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save property ID')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Google Analytics Property</DialogTitle>
          <DialogDescription>
            Enter your GA4 property ID to start syncing data.
            You can find this in Google Analytics under Admin → Property Settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="propertyId">Property ID</Label>
            <Input
              id="propertyId"
              placeholder="123456789"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Example: 123456789 (numbers only)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Property ID'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
