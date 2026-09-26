import { Split } from 'lucide-react'
import { shortTripNumber } from '@/features/delivery/lib/cart'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { TripDoRowRecord } from '../types'

/**
 * Small cells of the sheet, kept apart so the row reads as a list of columns.
 *
 * A blank value is a dash rather than an empty cell: in a grid of twenty
 * columns an empty cell reads as a rendering fault, and a dash reads as
 * "nothing here".
 */

export function Dash() {
  return <span className="text-muted-foreground/60">—</span>
}

/** Long text, truncated to the column with the whole value on hover. */
export function TextCell({
  value,
  width,
  strong,
  muted,
}: {
  value: string
  width: string
  strong?: boolean
  muted?: boolean
}) {
  if (!value) {
    return <Dash />
  }
  return (
    <span
      className={cn('block truncate', width, strong && 'font-medium', muted && 'text-muted-foreground')}
      title={value}
    >
      {value}
    </span>
  )
}

/** Trips as the gate knows them — "TRIP-0012" — the vendor code on hover. */
export function TripNumbersCell({ tripNumbers }: { tripNumbers: string[] }) {
  if (tripNumbers.length === 0) {
    return <Dash />
  }

  const shown = tripNumbers.slice(0, 2)
  const more = tripNumbers.length - shown.length

  return (
    <span className="flex items-center gap-1" title={tripNumbers.join('\n')}>
      {shown.map((tripNumber) => (
        <span
          key={tripNumber}
          className="rounded-md border bg-background px-1.5 py-px font-mono text-[11px] tabular-nums"
        >
          {shortTripNumber(tripNumber)}
        </span>
      ))}
      {more > 0 && <span className="text-[11px] text-muted-foreground">+{more}</span>}
    </span>
  )
}

/** ISD, OSD-Metro or OSD-Thana — or a flag saying nobody has worked it out yet. */
export function LocationCell({ locationType }: { locationType: string | null }) {
  const t = useT()

  if (!locationType) {
    return <span className="text-[11px] font-medium text-tone-amber">{t('tripDo.pending')}</span>
  }
  return (
    <span className="rounded-md border bg-background px-1.5 py-px font-mono text-[11px]">
      {locationType}
    </span>
  )
}

/**
 * The quantity, and — when the line is divided — which share of it this is.
 * "3 of 5" is what makes a split row readable without opening anything.
 */
export function QtyCell({ row }: { row: TripDoRowRecord }) {
  const isPart = row.kind === 'Order' && row.lineQty > 0 && row.qty !== row.lineQty

  return (
    <span className="flex flex-col items-end leading-tight">
      <span className="text-[13px] font-semibold tabular-nums">{row.qty}</span>
      {isPart ? (
        <span className="text-[10px] text-muted-foreground tabular-nums">of {row.lineQty}</span>
      ) : (
        row.partCount > 1 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Split className="size-2.5" aria-hidden />
            {row.partCount} parts
          </span>
        )
      )}
    </span>
  )
}
