import { RefreshCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'

interface BillDriftBannerProps {
  drift: { changed: number; missing: number }
  isDraft: boolean
  canRefresh: boolean
  isRefreshing: boolean
  onRefresh: () => void
}

/**
 * Says when the Trip DO sheet has moved under the bill — a challan corrected, a
 * gate pass's CSD fixed, a line corrected away. A draft can copy the sheet
 * again; a finalized bill keeps what it charged, and says so.
 */
export function BillDriftBanner({ drift, isDraft, canRefresh, isRefreshing, onRefresh }: BillDriftBannerProps) {
  const t = useT()

  const total = drift.changed + drift.missing
  if (total === 0) {
    return null
  }

  /* Two clauses and a joiner, each its own message — see the labour bill's. */
  const changed =
    drift.changed > 0
      ? t('bill.details.driftChanged', {
          count: drift.changed,
          n: formatNumber(drift.changed),
        })
      : ''
  const missing =
    drift.missing > 0
      ? t('bill.details.driftMissing', {
          count: drift.missing,
          n: formatNumber(drift.missing),
        })
      : ''
  const summary =
    changed && missing ? t('bill.details.driftBoth', { changed, missing }) : changed || missing

  return (
    <div
      role="status"
      className="mb-4 flex flex-col gap-3 rounded-xl border border-tone-amber/30 bg-tone-amber/5 p-4 sm:flex-row sm:items-center"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tone-amber/10 text-tone-amber ring-1 ring-tone-amber/20">
        <TriangleAlert className="size-4.5" aria-hidden />
      </span>
      <div className="flex-1 text-sm">
        <p className="font-medium">{t('bill.details.driftTitle')}</p>
        <p className="mt-0.5 text-pretty text-muted-foreground">
          {t('bill.details.driftSentence', {
            summary,
            hint: isDraft ? t('bill.details.driftHint') : t('bill.details.finalizedHint'),
          })}
        </p>
      </div>
      {isDraft && canRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing} className="shrink-0">
          <RefreshCcw className={isRefreshing ? 'animate-spin' : undefined} data-icon="inline-start" aria-hidden />
          {isRefreshing ? t('bill.details.refreshing') : t('bill.details.refresh')}
        </Button>
      )}
    </div>
  )
}
