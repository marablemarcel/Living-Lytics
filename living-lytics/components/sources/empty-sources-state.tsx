import { Database, Plug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptySourcesStateProps {
  onBrowseSources?: () => void
}

export function EmptySourcesState({ onBrowseSources }: EmptySourcesStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
          <Plug className="h-10 w-10 text-primary" />
        </div>

        <h3 className="text-2xl font-semibold mb-2">
          No data sources connected
        </h3>

        <p className="text-muted-foreground max-w-md mb-6">
          Connect your first platform to start tracking your marketing metrics and gain insights into your performance.
        </p>

        <Button
          onClick={onBrowseSources}
          size="lg"
          className="gap-2"
        >
          <Database className="h-4 w-4" />
          Browse Available Sources
        </Button>
      </CardContent>
    </Card>
  )
}
