import { RefreshCcw, Route } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import type { ApiError } from '@/lib/axios'
import { useT } from '@/lib/i18n'

/**
 * A trip that would not load. A 404 is the ordinary answer for a trip that was
 * deleted before dispatch, and says so; anything else offers a retry, because
 * on a sleeping instance the second attempt usually works.
 */
export function TripLoadError({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const t = useT()

  const notFound = error.statusCode === 404

  return (
    <div className="mx-auto w-full max-w-3xl">
      <EmptyState
        icon={Route}
        title={notFound ? t('delivery.trip.notFound') : t('delivery.trip.loadFailed')}
        description={
          notFound
            ? t('delivery.trip.deletedHint')
            : error.message
        }
        action={
          notFound ? (
            <Button render={<Link to="/delivery" />}>{t('delivery.backToList')}</Button>
          ) : (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCcw data-icon="inline-start" aria-hidden />
              {t('common.actions.retry')}
            </Button>
          )
        }
      />
    </div>
  )
}
