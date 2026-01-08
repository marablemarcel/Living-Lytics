"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"

interface PeriodSelectorProps {
  value: string
  onChange: (value: string) => void
}

const periodOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
  { value: "custom", label: "Custom range" },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-fit min-w-[160px]">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <SelectValue placeholder="Select period" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {periodOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.value === "custom"}
          >
            {option.label}
            {option.value === "custom" && (
              <span className="text-xs text-gray-400 ml-2">(Coming soon)</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Helper function to get period label
export function getPeriodLabel(period: string): string {
  const option = periodOptions.find((opt) => opt.value === period)
  return option?.label || "Last 30 days"
}
