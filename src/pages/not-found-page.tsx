import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'

export function NotFoundPage() {
  return (
    <div className="flex h-full items-center justify-center py-20">
      <EmptyState
        icon={<Compass className="h-5 w-5" />}
        title="Page not found"
        description="The screen you're looking for doesn't exist or has moved."
        action={
          <Button asChild size="sm">
            <Link to="/">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  )
}
