import { Building2 } from 'lucide-react'
import { CARRYING_KIND_META, floorLabel, taka } from '../lib/delivery-meta'
import type { TripChallanRecord } from '../types'

const CHIP =
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap'

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
 */
export function DeliveryDetailChips({ challan }: { challan: TripChallanRecord }) {
  return (
    <>
      {challan.floorNo !== null && (
        <span className={`${CHIP} border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo`}>
          <Building2 className="size-3" aria-hidden />
          {floorLabel(challan.floorNo)}
        </span>
      )}

      {challan.carrying.map((entry, index) => {
        const meta = CARRYING_KIND_META[entry.kind]
        const Icon = meta.icon

        return (
          <span
            key={index}
            className={`${CHIP} border-tone-amber/25 bg-tone-amber/10 text-tone-amber`}
            title={meta.hint}
          >
            <Icon className="size-3" aria-hidden />
            {entry.description ? `${meta.label} · ${entry.description}` : meta.label}
            <span className="font-bold tabular-nums">{taka(entry.amount)}</span>
          </span>
        )
      })}

      {challan.carrying.length > 1 && (
        <span className={`${CHIP} border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald`}>
          Carrying total
          <span className="font-bold tabular-nums">{taka(challan.carryingTotal)}</span>
        </span>
      )}
    </>
  )
}
