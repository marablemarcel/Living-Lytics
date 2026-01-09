'use client'

import { useState, useMemo, useCallback } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DateRange,
  getLast7Days,
  getLast30Days,
  getLast90Days,
  getLastYear,
  formatDateRange,
} from '@/lib/utils/dates'

interface DateRangePickerProps {
  value?: DateRange
  onChange: (range: DateRange) => void
}

type PresetType = '7d' | '30d' | '90d' | '1y'

const presets = [
  { id: '7d' as PresetType, label: 'Last 7 days', getRange: getLast7Days },
  { id: '30d' as PresetType, label: 'Last 30 days', getRange: getLast30Days },
  { id: '90d' as PresetType, label: 'Last 90 days', getRange: getLast90Days },
  { id: '1y' as PresetType, label: 'Last 12 months', getRange: getLastYear },
]

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<PresetType>('30d')
  const [open, setOpen] = useState(false)

  const defaultRange = useMemo(() => getLast30Days(), [])
  const currentRange = value || defaultRange

  const handlePresetClick = useCallback((presetId: PresetType) => {
    const preset = presets.find((p) => p.id === presetId)
    if (preset) {
      // Close popover immediately for better UX
      setOpen(false)
      setActivePreset(presetId)

      // Defer the expensive operation
      requestAnimationFrame(() => {
        const range = preset.getRange()
        onChange(range)
      })
    }
  }, [onChange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[280px] justify-start text-left font-normal"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDateRange(currentRange.start, currentRange.end)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Select time period
          </div>
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant={activePreset === preset.id ? 'default' : 'outline'}
              className="justify-start"
              onClick={() => handlePresetClick(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
