import { actorInitials } from '@/lib/day-grouping'
import { useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * The cells the trips table and the trip cards draw alike, so a plate or a
 * blank bill reads the same at a desk and on a phone.
 */

/**
 * A registration number drawn as a plate: monospace in a bordered badge, the
 * one thing on a trip row somebody matches against the lorry in the yard.
 */
export function PlateBadge({ plate, className }: { plate: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border bg-background px-1.5 py-0.5 font-mono text-xs font-semibold tracking-tight shadow-xs',
        className,
      )}
    >
      {plate}
    </span>
  )
}

/**
 * Who drove, behind their initials. A trip's driver is a copy taken at
 * confirmation, so there is no photo to draw — the initials are what tell
 * "Kobir" and "Kamal" apart down a column without reading either.
 */
export function DriverName({ name, note }: { name: string; note?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tone-indigo/10 text-[11px] font-semibold text-tone-indigo"
        aria-hidden
      >
        {actorInitials(name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium">{name}</span>
        {note && <span className="block text-[11px] text-tone-indigo">{note}</span>}
      </span>
    </span>
  )
}

/**
 * A trip's rent or labour bill. A figure nobody has entered is not a zero, and
 * is drawn in amber so a column of them reads as the backlog it is — the
 * trips a month-end bill is still waiting on.
 */
export function BillAmount({ amount, className }: { amount: number | null; className?: string }) {
  const t = useT()
  const format = useFormatters()

  if (amount === null) {
    return (
      <span className={cn('text-xs font-medium text-tone-amber', className)}>{t('delivery.bill.notEntered')}</span>
    )
  }

  return <span className={cn('text-[13px] font-semibold tabular-nums', className)}>{format.taka(amount)}</span>
}
