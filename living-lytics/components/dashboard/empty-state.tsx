import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlugZap, ArrowRight } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  title = "Connect your first data source",
  description = "Start tracking your marketing metrics by connecting Google Analytics, Instagram, or another platform.",
  actionLabel = "Connect Data Source",
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 hover:border-gray-400 transition-colors">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        {/* Icon */}
        <div className="mb-6 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          {icon || (
            <PlugZap className="h-12 w-12 text-blue-600" strokeWidth={1.5} />
          )}
        </div>

        {/* Content */}
        <div className="text-center max-w-md space-y-3 mb-8">
          <h3 className="text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Button */}
        {onAction && (
          <Button
            size="lg"
            onClick={onAction}
            className="group shadow-sm hover:shadow-md"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}

        {/* Optional: Secondary action or help text */}
        {onAction && (
          <p className="text-xs text-gray-500 mt-4">
            Need help? Check out our{" "}
            <button className="text-blue-600 hover:text-blue-700 underline">
              integration guide
            </button>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
