'use client'

import { Database, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * No Data State Component
 * 
 * Displays when no metrics data is available
 */

interface NoDataStateProps {
  title?: string
  description?: string
  showConnectButton?: boolean
}

export function NoDataState({
  title = 'No data available',
  description = 'Connect a data source and sync your data to see metrics here.',
  showConnectButton = true,
}: NoDataStateProps) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Database className="h-8 w-8 text-blue-600" />
      </div>
      
      <h3 className="mt-6 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>

      {showConnectButton && (
        <div className="mt-6 flex gap-3">
          <Link href="/dashboard/sources">
            <Button>
              <LinkIcon className="mr-2 h-4 w-4" />
              Connect Data Source
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
