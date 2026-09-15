import { PackageCheck, PackageX } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { PageMeta } from '../types'

interface GatePassDeliveryCardsProps {
  meta: PageMeta | undefined
  isLoading: boolean
  isFiltered: boolean
}

/**
 * Delivered and not-delivered pieces across every gate pass the filters match
 * — not the page — as the challans linked on the Trip DO sheet say. A piece
 * is delivered when it went out on a trip whose signed copy is in; a linked
 * return takes pieces back into Not Delivered, and a linked re-send takes them
 * out again. A piece no challan has been linked to yet is not delivered.
 */
export function GatePassDeliveryCards({ meta, isLoading, isFiltered }: GatePassDeliveryCardsProps) {
  if (isLoading || !meta) {
    return (
      <div className="mb-4 grid gap-3 sm:grid-cols-2" aria-busy="true">
        <Skeleton className="h-[6.5rem] rounded-xl" />
        <Skeleton className="h-[6.5rem] rounded-xl" />
      </div>
    )
  }

  const total = meta.totalQty
  const percent = total > 0 ? Math.round((meta.deliveredQty / total) * 100) : 0
  const scope = isFiltered ? 'on the gate passes these filters match' : 'on every gate pass'

  const cards = [
    {
      label: 'Delivered Qty',
      value: meta.deliveredQty,
      hint: `${percent}% of ${total.toLocaleString()} pcs ${scope}`,
      icon: PackageCheck,
      chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
      bar: 'bg-tone-emerald',
      width: percent,
    },
    {
      label: 'Not Delivered Qty',
      value: meta.notDeliveredQty,
      hint: `${100 - percent}% still to deliver, or not on a challan yet`,
      icon: PackageX,
      chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
      bar: 'bg-tone-amber',
      width: total > 0 ? 100 - percent : 0,
    },
  ]

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg ring-1', card.chip)}>
              <card.icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-3xl leading-none font-semibold tracking-tight tabular-nums">
                {card.value.toLocaleString()}
                <span className="ml-1.5 text-sm font-medium text-muted-foreground">pcs</span>
              </p>
              <p className="mt-2 truncate text-[11px] text-muted-foreground">{card.hint}</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div
              className={cn('h-full rounded-full transition-[width] duration-500', card.bar)}
              style={{ width: `${card.width}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
