import { MapPin, MapPinned, StickyNote } from 'lucide-react'
import { formatPadded, useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { completionMeta, whereOf } from '../lib/delivery-meta'
import type { TripChallanRecord } from '../types'
import { ReturnedQtyBadge } from './delivery-badges'
import { DeliveryDetailChips } from './delivery-detail-chips'

interface TripStopChipsProps {
  challans: TripChallanRecord[]
  /** Pressing a stop takes the reader to that challan's card below. */
  onSelect: (challanId: string) => void
}

/**
 * Every door the lorry went to, one small card each: where — the address, its
 * thana and district — and how the delivery there was finished: anything that
 * came back, the floor, what was hired to carry it, and the note somebody left.
 *
 * It is the route at a glance. The challan cards below say *what* went; this
 * says *where*, in the order the challans sit on the trip, numbered the way
 * their cards are so the two can be read against each other. Pressing a stop
 * scrolls to its card.
 *
 * **Every stop is on screen at once — no sideways scroll.** The cards fill a
 * row at no less than 15rem each and the rest wrap onto the next, so a laptop
 * fits five or six to a row. That was a scroll strip for a while, to keep the
 * head of the page one card tall whatever the load; the business preferred
 * seeing every stop over a fixed height, and a stop hidden off the edge of a
 * row is a stop somebody does not check.
 *
 * The status dot is each delivery's own — the colour its badge carries — so a
 * stop still waiting for its signed copy stands out in a row of finished ones.
 * A stop with no floor, carrying or note says so in one muted line rather than
 * leaving a gap, because "nothing recorded" and "card failed to draw" should
 * not look the same.
 */
export function TripStopChips({ challans, onSelect }: TripStopChipsProps) {
  const t = useT()
  const format = useFormatters()

  if (challans.length === 0) {
    return null
  }

  return (
    <section aria-label={t('delivery.hero.stops')}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex size-7 items-center justify-center rounded-lg bg-tone-cyan/10 text-tone-cyan ring-1 ring-tone-cyan/20">
          <MapPinned className="size-4" aria-hidden />
        </span>
        <h2 className="text-sm font-semibold tracking-tight">{t('delivery.hero.stops')}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums">
          {format.number(challans.length)}
        </span>
        <p className="hidden text-[11px] text-muted-foreground sm:ms-auto sm:block">{t('delivery.hero.stopsHint')}</p>
      </div>

      <ol className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-2 pb-0.5">
        {challans.map((challan, index) => (
          <li key={challan.challanId} className="min-w-0">
            <StopCard challan={challan} position={index + 1} onSelect={() => onSelect(challan.challanId)} />
          </li>
        ))}
      </ol>
    </section>
  )
}

function StopCard({
  challan,
  position,
  onSelect,
}: {
  challan: TripChallanRecord
  position: number
  onSelect: () => void
}) {
  const t = useT()

  const meta = completionMeta(challan, t)
  const where = whereOf(challan)
  const hasExtras = challan.floorNo !== null || challan.carrying.length > 0 || challan.deliveryNote !== ''

  return (
    <button
      type="button"
      onClick={onSelect}
      title={t('delivery.hero.jumpTo', { challan: challan.challanNumber })}
      className="group flex h-full w-full flex-col gap-1 rounded-xl border bg-card p-2.5 text-left text-xs shadow-xs transition outline-none hover:-translate-y-px hover:border-primary/30 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-[11px] font-bold text-primary tabular-nums">
          {formatPadded(position, 2)}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">{challan.customerName}</span>
        <span className={cn('size-2 shrink-0 rounded-full ring-2 ring-card', meta.dot)} title={meta.label} aria-hidden />
      </span>

      <span className="flex items-start gap-1.5 text-muted-foreground">
        <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
        <span className="min-w-0">
          <span className="line-clamp-2 wrap-break-word" title={challan.deliveryAddress}>
            {challan.deliveryAddress}
          </span>
          <span className="mt-0.5 block font-medium text-foreground">
            {where.thana} · {where.district}
          </span>
        </span>
      </span>

      <span className="mt-auto flex flex-wrap items-center gap-1 pt-1">
        <ReturnedQtyBadge qty={challan.returnedQty} className="rounded-full px-2 py-0.5" />
        {hasExtras ? (
          <>
            <DeliveryDetailChips challan={challan} compact />
            {challan.deliveryNote && (
              <span
                className="flex w-full min-w-0 items-start gap-1 text-[11px] text-muted-foreground italic"
                title={challan.deliveryNote}
              >
                <StickyNote className="mt-px size-3 shrink-0 not-italic" aria-hidden />
                <span className="line-clamp-2 wrap-break-word">{challan.deliveryNote}</span>
              </span>
            )}
          </>
        ) : (
          <span className="text-[11px] text-muted-foreground/80">{t('delivery.hero.extrasNone')}</span>
        )}
      </span>

      <span className="sr-only">{meta.label}</span>
    </button>
  )
}
