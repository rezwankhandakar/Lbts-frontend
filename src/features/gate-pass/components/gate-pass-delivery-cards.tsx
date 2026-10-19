import { PackageCheck, PackageX, Truck, Undo2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'
import { formatNumber, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PageMeta, PieceFilter } from '../types'

interface GatePassDeliveryCardsProps {
  meta: PageMeta | undefined
  isLoading: boolean
  isFiltered: boolean
  /** The card pressed, if any — `all` when none is. */
  active: PieceFilter
  onSelect: (pieces: PieceFilter) => void
}

interface DeliveryCard {
  key: Exclude<PieceFilter, 'all'>
  label: string
  value: number
  hint: string
  icon: LucideIcon
  chip: string
  bar: string
  pressed: string
  width: number
}

function percentOf(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

/**
 * Where the pieces on every gate pass the filters match are — not the page —
 * as the challans linked on the Trip DO sheet say. **Delivered** is signed
 * for; **Not Delivered** is everything else; of that, **Sent** has left the
 * gate with its signed copy not back yet, and **Returned** came back off a
 * lorry and has not gone out again. A piece no challan has been linked to yet
 * is not delivered.
 *
 * Every card is a filter: pressing one keeps the lines holding pieces in its
 * bucket, and pressing it again lets them go — the way a backlog chip
 * behaves. Drawn at zero, because these are readings rather than jobs.
 */
export function GatePassDeliveryCards({
  meta,
  isLoading,
  isFiltered,
  active,
  onSelect,
}: GatePassDeliveryCardsProps) {
  const t = useT()

  if (isLoading || !meta) {
    return (
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-26 rounded-xl" />
        ))}
      </div>
    )
  }

  const total = meta.totalQty
  const delivered = percentOf(meta.deliveredQty, total)
  const scope = isFiltered ? t('gatePass.stats.scopeFiltered') : t('gatePass.stats.scopeAll')

  const cards: DeliveryCard[] = [
    {
      key: 'delivered',
      label: t('gatePass.stats.delivered'),
      value: meta.deliveredQty,
      hint: t('gatePass.stats.deliveredHint', {
        percent: formatPercent(delivered),
        total: formatNumber(total),
        scope,
      }),
      icon: PackageCheck,
      chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
      bar: 'bg-tone-emerald',
      pressed: 'border-tone-emerald/60 bg-tone-emerald/5 ring-2 ring-tone-emerald/25',
      width: delivered,
    },
    {
      key: 'notDelivered',
      label: t('gatePass.stats.notDelivered'),
      value: meta.notDeliveredQty,
      hint: t('gatePass.stats.notDeliveredHint', { percent: formatPercent(100 - delivered) }),
      icon: PackageX,
      chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
      bar: 'bg-tone-amber',
      pressed: 'border-tone-amber/60 bg-tone-amber/5 ring-2 ring-tone-amber/25',
      width: total > 0 ? 100 - delivered : 0,
    },
    {
      key: 'sent',
      label: t('gatePass.stats.sent'),
      value: meta.sentQty,
      hint: t('gatePass.stats.sentHint', {
        percent: formatPercent(percentOf(meta.sentQty, total)),
      }),
      icon: Truck,
      chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
      bar: 'bg-tone-cyan',
      pressed: 'border-tone-cyan/60 bg-tone-cyan/5 ring-2 ring-tone-cyan/25',
      width: percentOf(meta.sentQty, total),
    },
    {
      key: 'returned',
      label: t('gatePass.stats.returned'),
      value: meta.returnedQty,
      hint: t('gatePass.stats.returnedHint', {
        percent: formatPercent(percentOf(meta.returnedQty, total)),
      }),
      icon: Undo2,
      chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
      bar: 'bg-tone-rose',
      pressed: 'border-tone-rose/60 bg-tone-rose/5 ring-2 ring-tone-rose/25',
      width: percentOf(meta.returnedQty, total),
    },
  ]

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const isActive = active === card.key
        return (
          <button
            key={card.key}
            type="button"
            aria-pressed={isActive}
            title={isActive ? t('gatePass.stats.clearCard') : t('gatePass.stats.filterByCard')}
            onClick={() => onSelect(isActive ? 'all' : card.key)}
            className={cn(
              'rounded-xl border bg-card p-4 text-left shadow-sm transition-colors outline-none',
              'hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50',
              isActive && card.pressed,
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-lg ring-1',
                  card.chip,
                )}
              >
                <card.icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-1 text-3xl leading-none font-semibold tracking-tight tabular-nums">
                  {formatNumber(card.value)}
                  <span className="ml-1.5 text-sm font-medium text-muted-foreground">
                    {t('gatePass.stats.pcs')}
                  </span>
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
          </button>
        )
      })}
    </div>
  )
}
