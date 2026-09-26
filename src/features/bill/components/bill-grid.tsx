import { Plus, ReceiptText, RefreshCcw, SearchX, TriangleAlert } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { BillRecord } from '../types'
import { BillCard } from './bill-card'
import { useT } from '@/lib/i18n'

interface BillGridProps {
  records: BillRecord[]
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  isFiltered: boolean
  canCreate: boolean
  onRetry: () => void
  onReset: () => void
  onCreate: () => void
}

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'

/**
 * Which of the four states the list is in. "Nothing matched" and "nothing yet"
 * are told apart because their fixes differ: one is a filter to clear, the
 * other is a bill to open.
 */
export function BillGrid({
  records,
  isLoading,
  isFetching,
  errorMessage,
  isFiltered,
  canCreate,
  onRetry,
  onReset,
  onCreate,
}: BillGridProps) {
  const t = useT()

  if (isLoading) {
    return (
      <div className={GRID} aria-busy="true">
        <span className="sr-only">{t('bill.list.loading')}</span>
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-[14.5rem] rounded-xl" />
        ))}
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center px-6 py-14 text-center" role="alert">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <TriangleAlert className="size-5" aria-hidden />
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight">
          {t('bill.list.loadFailed')}
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-pretty text-muted-foreground">{errorMessage}</p>
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry} disabled={isFetching}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          {isFetching ? t('bill.list.retrying') : t('common.actions.retry')}
        </Button>
      </div>
    )
  }

  if (records.length === 0 && isFiltered) {
    return (
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <SearchX className="size-5" aria-hidden />
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight">
          {t('bill.list.noMatches')}
        </h3>
        <p className="mt-1.5 max-w-md text-sm text-pretty text-muted-foreground">
          {t('bill.list.noMatchesHint')}
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>
          {t('common.actions.clearFilters')}
        </Button>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title={t('bill.list.empty')}
        description={t('bill.listDescription')}
        className="min-h-[22rem] border-dashed shadow-none"
        action={
          canCreate ? (
            <Button onClick={onCreate}>
              <Plus data-icon="inline-start" aria-hidden />
              {t('bill.list.openFirst')}
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className={GRID}>
      {records.map((bill) => (
        <BillCard key={bill.id} bill={bill} />
      ))}
    </div>
  )
}
