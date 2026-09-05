import { cn } from '@/lib/utils'
import { batchStatusMeta, challanStatusMeta } from '../lib/challan-meta'

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
  const meta = challanStatusMeta(status)

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

/** The same, for a source batch: still processing, or every page accounted for. */
export function ChallanBatchStatusBadge({ status, className }: StatusBadgeProps) {
  const meta = batchStatusMeta(status)

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
