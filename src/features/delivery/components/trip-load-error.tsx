import { RefreshCcw, Route } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import type { ApiError } from '@/lib/axios'

/**
 * A trip that would not load. A 404 is the ordinary answer for a trip that was
 * deleted before dispatch, and says so; anything else offers a retry, because
 * on a sleeping instance the second attempt usually works.
 */
export function TripLoadError({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const notFound = error.statusCode === 404

  return (
    <div className="mx-auto w-full max-w-3xl">
      <EmptyState
        icon={Route}
        title={notFound ? 'Trip not found' : 'Could not load this trip'}
        description={
          notFound
            ? 'It may have been deleted before it left the gate, which releases every challan it carried.'
            : error.message
        }
        action={
          notFound ? (
            <Button render={<Link to="/delivery" />}>Back to deliveries</Button>
          ) : (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCcw data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          )
        }
      />
    </div>
  )
}
