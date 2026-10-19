import { Building2 } from 'lucide-react'
import { carryingKindMeta, floorLabel, taka } from '../lib/delivery-meta'
import type { TripChallanRecord } from '../types'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const CHIP = 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium'

/**
 * How the delivery was finished, as chips: the floor it went up to, each thing
 * hired to get it there with what it cost, and the total when there is more
 * than one.
 *
 * One chip per charge rather than a single total, because "Labour ৳400 ·
 * Vehicle ৳150" is the answer to the question somebody actually asks about a
 * delivery that cost more than expected. Returns a fragment so the chips flow
 * into whatever badge row they are placed in; nothing is drawn when nothing was
 * recorded.
 *
 * A charge's description is always drawn on its chip: it is what somebody typed
 * to say what the money paid for, and a tooltip is a place a phone never shows.
 *
 * `compact` is for a card sized to fit two rows on a laptop — a challan on the
 * trip page — where a long description would push the chip past the card's
 * edge: the chips may wrap, and a described chip wraps its text inside the card
 * rather than running off it.
 */
export function DeliveryDetailChips({
  challan,
  compact = false,
}: {
  challan: TripChallanRecord
  compact?: boolean
}) {
  const t = useT()

  const chip = cn(CHIP, !compact && 'whitespace-nowrap')

  return (
    <>
      {challan.floorNo !== null && (
        <span className={`${chip} border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo`}>
          <Building2 className="size-3 shrink-0" aria-hidden />
          {floorLabel(challan.floorNo, t)}
        </span>
      )}

      {challan.carrying.map((entry, index) => {
        const meta = carryingKindMeta(entry.kind, t)
        const Icon = meta.icon
        const described = entry.description ? `${meta.label} · ${entry.description}` : meta.label

        return (
          <span
            key={index}
            className={cn(
              chip,
              'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
              compact && entry.description && 'max-w-full rounded-lg',
            )}
            title={meta.hint}
          >
            <Icon className="size-3 shrink-0" aria-hidden />
            <span className={cn(compact && 'min-w-0 wrap-break-word')}>{described}</span>
            <span className="shrink-0 font-bold whitespace-nowrap tabular-nums">{taka(entry.amount)}</span>
          </span>
        )
      })}

      {challan.carrying.length > 1 && (
        <span className={`${chip} border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald`}>
          {t('delivery.extras.carryingTotal')}
          <span className="font-bold tabular-nums">{taka(challan.carryingTotal)}</span>
        </span>
      )}
    </>
  )
}
