import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { completionMeta, lineChangeMeta, tripStatusMeta } from '../lib/delivery-meta'
import { highlightPlate } from '../lib/plate'
import type { CompletionMethod, LineChange } from '../types'

const BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap'

/**
 * A trip's status: a dot beside the word, never colour alone, so it survives a
 * monochrome screen and a colour-blind reader — the shape every badge in the
 * app uses.
 */
export function TripStatusBadge({
  value,
  progress,
  className,
}: {
  value: string
  /**
   * Challans finished out of the trip's total. Drawn as `· 2/3` while the trip
   * is still waiting, so the badge says how much is left, not only that
   * something is; a completed trip needs no count.
   */
  progress?: { done: number; total: number }
  className?: string
}) {
  const t = useT()

  const meta = tripStatusMeta(value, t)
  const showProgress = progress !== undefined && value !== 'Completed' && progress.total > 0

  return (
    <span
      className={cn(BASE, meta.badge, className)}
      title={
        showProgress
          ? `${progress.done} of ${progress.total} challans done. ${meta.description}`
          : meta.description
      }
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
      {showProgress && (
        <span className="font-medium tabular-nums opacity-80">
          · {progress.done}/{progress.total}
        </span>
      )}
    </span>
  )
}

/**
 * What one challan's delivery amounts to: awaiting its signed copy, or
 * complete.
 *
 * Drawn in **both** states, unlike a backlog chip. An absent badge would read
 * as "no information" rather than "not signed for yet", and the delivery still
 * waiting for its copy is precisely the one somebody is looking for.
 */
export function DeliveryOutcomeBadge({
  value,
  method = null,
  className,
}: {
  value: string
  /** Why it is complete, so a returned or copy-less delivery says so. */
  method?: CompletionMethod | null
  className?: string
}) {
  const t = useT()

  const meta = completionMeta({ outcome: value, completionMethod: method }, t)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap',
        meta.badge,
        className,
      )}
      title={meta.description}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}

/**
 * What a trip did to a challan line. Nothing is drawn for a line carried as
 * ordered — the manifest marks the exceptions, and a tick on every row would
 * bury them.
 */
export function LineChangeBadge({
  change,
  detail,
  className,
}: {
  change: LineChange
  /** "2 of 4" — the numbers behind the word, when there are any. */
  detail?: string
  className?: string
}) {
  const t = useT()

  if (change === 'as-ordered') {
    return null
  }

  const meta = lineChangeMeta(change, t)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-px text-[11px] font-semibold whitespace-nowrap',
        meta.badge,
        className,
      )}
      title={meta.description}
    >
      {meta.label}
      {detail && <span className="font-medium opacity-80">· {detail}</span>}
    </span>
  )
}

/**
 * A registration number with the typed digits drawn in bold — so among four
 * plates ending in 1234 the operator sees at a glance *why* each one matched.
 */
export function PlateText({
  plate,
  query,
  className,
}: {
  plate: string
  query: string
  className?: string
}) {
  return (
    <span className={cn('font-mono tracking-tight', className)}>
      {highlightPlate(plate, query).map((segment, index) =>
        segment.match ? (
          <mark
            key={index}
            className="rounded-sm bg-primary/15 px-0.5 font-bold text-primary"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  )
}
