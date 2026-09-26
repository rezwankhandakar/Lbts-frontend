import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { batchStatusMeta, challanStatusMeta, dispatchMetaFor } from '../lib/challan-meta'

interface StatusBadgeProps {
  status: string
  className?: string
}

/**
 * A filled indicator dot beside the word, rather than a coloured word alone —
 * status must survive both a monochrome screen and a colour-blind reader. The
 * same shape as `UserStatusBadge` and `GatePassStatusBadge`, because a status
 * is a status.
 */
export function ChallanStatusBadge({ status, className }: StatusBadgeProps) {
  const t = useT()
  const meta = challanStatusMeta(status, t)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        meta.badge,
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}

/**
 * How much of a challan has left the gate, written by the Delivery module.
 *
 * Drawn in **every** state, including "not dispatched" — this is a status
 * badge on a row, where an absent chip would read as "no information" rather
 * than "nothing has gone", and a challan waiting for a lorry is precisely what
 * somebody scanning this column is looking for.
 *
 * A part-sent challan carries its numbers, because "Part sent" without them
 * leaves the only useful question — how much is left — unanswered.
 */
export function DispatchBadge({
  record,
  className,
  hideQty = false,
}: {
  record: {
    dispatchStatus: string
    dispatchedQty: number
    totalQty: number
    returnedQty?: number
    resentQty?: number
  }
  className?: string
  /** For a caller that draws the quantities itself, beside a progress bar. */
  hideQty?: boolean
}) {
  const t = useT()
  const meta = dispatchMetaFor(record, t)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        meta.badge,
        className,
      )}
      title={meta.description}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
      {!hideQty && record.dispatchStatus === 'Partial' && (
        <span className="font-medium tabular-nums opacity-80">
          {t('challan.dispatch.ofTotal', {
            sent: formatNumber(record.dispatchedQty),
            total: formatNumber(record.totalQty),
          })}
        </span>
      )}
    </span>
  )
}

/** The same, for a source batch: still processing, or every page accounted for. */
export function ChallanBatchStatusBadge({ status, className }: StatusBadgeProps) {
  const t = useT()
  const meta = batchStatusMeta(status, t)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        meta.badge,
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}
