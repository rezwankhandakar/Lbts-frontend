import { RefreshCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const total = drift.changed + drift.missing
  if (total === 0) {
    return null
  }

  const parts = [
    drift.changed > 0 && `${drift.changed} ${drift.changed === 1 ? 'row has' : 'rows have'} changed`,
    drift.missing > 0 &&
      `${drift.missing} ${drift.missing === 1 ? 'row is' : 'rows are'} no longer on the sheet`,
  ].filter(Boolean)

  return (
    <div
      role="status"
      className="mb-4 flex flex-col gap-3 rounded-xl border border-tone-amber/30 bg-tone-amber/5 p-4 sm:flex-row sm:items-center"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tone-amber/10 text-tone-amber ring-1 ring-tone-amber/20">
        <TriangleAlert className="size-4.5" aria-hidden />
      </span>
      <div className="flex-1 text-sm">
        <p className="font-medium">The Trip DO sheet has moved since these rows were scanned in</p>
        <p className="mt-0.5 text-pretty text-muted-foreground">
          {parts.join(' and ')}.{' '}
          {isDraft
            ? 'Refresh to re-read the sheet — every amount you have typed is kept, rows that are gone are taken off, and a row that has just learned its CSD moves into that section. A labour bill cannot be finalized until it matches.'
            : 'This bill is finalized, so it keeps what it charged. Reopen it to bring it up to date.'}
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
          {isRefreshing ? 'Refreshing…' : 'Refresh from Trip DO'}
        </Button>
      )}
    </div>
  )
}
