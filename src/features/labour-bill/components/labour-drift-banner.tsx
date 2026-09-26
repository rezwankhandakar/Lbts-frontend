import { RefreshCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'

interface LabourDriftBannerProps {
  drift: { changed: number; missing: number }
  isDraft: boolean
  canRefresh: boolean
  isRefreshing: boolean
  onRefresh: () => void
}

/**
 * Says when the Trip DO sheet has moved under the bill — a challan corrected, a
 * gate pass matched after the row was scanned in, a line corrected away.
 *
 * The one thing it promises out loud is the one somebody will hesitate over:
 * **refreshing keeps every amount typed**. It re-reads the customer, the
 * address, the model and the Trip DO, and leaves the three cells alone, because
 * an address being fixed is no reason to forget what four men were paid.
 */
export function LabourDriftBanner({
  drift,
  isDraft,
  canRefresh,
  isRefreshing,
  onRefresh,
}: LabourDriftBannerProps) {
  const t = useT()

  const total = drift.changed + drift.missing
  if (total === 0) {
    return null
  }

  /*
   * Two clauses and a joiner, each its own message. English agrees the verb
   * with the count on both sides of the "and"; assembling that from fragments
   * in JSX would be a sentence only English could come out of.
   */
  const changed =
    drift.changed > 0
      ? t('labourBill.details.driftChanged', {
          count: drift.changed,
          n: formatNumber(drift.changed),
        })
      : ''
  const missing =
    drift.missing > 0
      ? t('labourBill.details.driftMissing', {
          count: drift.missing,
          n: formatNumber(drift.missing),
        })
      : ''
  const summary =
    changed && missing ? t('labourBill.details.driftBoth', { changed, missing }) : changed || missing

  return (
    <div
      role="status"
      className="mb-4 flex flex-col gap-3 rounded-xl border border-tone-amber/30 bg-tone-amber/5 p-4 sm:flex-row sm:items-center"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tone-amber/10 text-tone-amber ring-1 ring-tone-amber/20">
        <TriangleAlert className="size-4.5" aria-hidden />
      </span>
      <div className="flex-1 text-sm">
        <p className="font-medium">{t('labourBill.details.driftTitle')}</p>
        <p className="mt-0.5 text-pretty text-muted-foreground">
          {t('labourBill.details.driftSentence', {
            summary,
            hint: isDraft
              ? t('labourBill.details.driftHint')
              : t('labourBill.details.finalizedHint'),
          })}
        </p>
      </div>
      {isDraft && canRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="shrink-0"
        >
          <RefreshCcw
            className={isRefreshing ? 'animate-spin' : undefined}
            data-icon="inline-start"
            aria-hidden
          />
          {isRefreshing ? t('labourBill.details.refreshing') : t('labourBill.details.refresh')}
        </Button>
      )}
    </div>
  )
}
