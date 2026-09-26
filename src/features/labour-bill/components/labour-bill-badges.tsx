import { CircleDashed, Link2Off, TriangleAlert } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { labourBillStatusMeta } from '../lib/labour-bill-meta'
import type { LabourLineDrift } from '../types'

const PILL =
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap'

/** Draft or Finalized. */
export function LabourBillStatusBadge({ status, className }: { status: string; className?: string }) {
  const t = useT()

  const meta = labourBillStatusMeta(status, t)
  return (
    <span className={cn(PILL, meta.badge, className)} title={meta.description}>
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}

/**
 * A row whose Trip DO sheet row has moved, or is gone. Drawn only when there is
 * something to say: this is a to-do rather than a status, and a mark on every
 * settled row would be a mark nobody reads.
 */
export function LabourDriftMark({ drift }: { drift: LabourLineDrift }) {
  const t = useT()

  if (drift === 'none') {
    return null
  }
  return drift === 'changed' ? (
    <TriangleAlert
      className="size-3.5 shrink-0 text-tone-amber"
      aria-label={t('labourBill.details.changedAria')}
    />
  ) : (
    <Link2Off
      className="size-3.5 shrink-0 text-tone-rose"
      aria-label={t('labourBill.details.goneAria')}
    />
  )
}

/**
 * A row scanned in before its gate pass was matched. The Trip DO and CSD cells
 * are blank until somebody links it on the sheet, and an empty cell on its own
 * reads as a transcription somebody forgot rather than as work still to do.
 */
export function NoTripDoChip() {
  const t = useT()

  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border border-tone-amber/25 bg-tone-amber/10 px-1.5 py-px text-[10.5px] font-medium text-tone-amber"
      title={t('labourBill.fields.noTripDo')}
    >
      <CircleDashed className="size-3" aria-hidden />
      {t('labourBill.noTripDoChip')}
    </span>
  )
}
