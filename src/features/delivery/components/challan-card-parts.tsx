import type { ReactNode } from 'react'
import { ExternalLink, Undo2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPadded, useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { completionMeta, lineDetail } from '../lib/delivery-meta'
import type { TripChallanRecord, TripLineRecord } from '../types'
import { NoteLine } from './challan-party-details'
import { LineChangeBadge, ReturnedQtyBadge } from './delivery-badges'
import { DeliveryDetailChips } from './delivery-detail-chips'

/**
 * The pieces of a challan card on a trip, shared by the trip page's grid
 * (`TripChallanCard`) and the delivery page (`CompletionChallanCard`) — so a
 * challan reads the same on both, which is the point: an operator meets it on
 * one and finishes it on the other.
 *
 * They differ only where the job does. The trip page numbers its cards and
 * links each through to its delivery; the delivery page has one challan, and
 * while somebody is recording what came back, a stepper stands where each
 * line's quantity is.
 */

/**
 * The band across the top, in the delivery's own colour: the identifiers and
 * where it stands, then the customer, then the pieces.
 *
 * `returned` is passed rather than read, because the delivery page draws what
 * is being typed before it is saved; the delivered figure follows from it.
 * Without a `position` — one challan on its own page — the circle carries the
 * delivery's own icon instead of a number nobody needs.
 */
export function ChallanCardHeader({
  challan,
  returned,
  position,
}: {
  challan: TripChallanRecord
  returned: number
  position?: number
}) {
  const t = useT()
  const format = useFormatters()

  const meta = completionMeta(challan, t)
  const Icon = meta.icon

  return (
    <header className={cn('relative isolate overflow-hidden px-3.5 py-2.5 text-primary-foreground', meta.band)}>
      <div
        className="pointer-events-none absolute -top-14 -right-8 size-32 rounded-full bg-primary-foreground/10"
        aria-hidden
      />

      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground font-mono text-[13px] font-bold tabular-nums',
            meta.bandText,
          )}
        >
          {position === undefined ? <Icon className="size-4" aria-hidden /> : formatPadded(position, 2)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <Link
              to={`/challan/${challan.challanId}`}
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold break-all hover:underline"
            >
              {challan.challanNumber}
              <ExternalLink className="size-3 shrink-0" aria-hidden />
            </Link>
            <span className="rounded-full bg-primary-foreground/20 px-1.5 py-px text-[10px] font-semibold tabular-nums">
              {t('delivery.slWith', { sl: format.number(challan.slNumber) })}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full bg-primary-foreground px-2 py-px text-[11px] font-semibold',
                meta.bandText,
              )}
              title={meta.description}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden />
              {meta.label}
            </span>
            {returned > 0 && challan.completionMethod !== 'Returned' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground px-2 py-px text-[11px] font-semibold text-band-rose">
                <Undo2 className="size-3" aria-hidden />
                {t('delivery.dispatch.cameBackCount', { returned: format.number(returned) })}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-[15px] leading-tight font-bold" title={challan.customerName}>
            {challan.customerName}
          </p>
        </div>

        <div className="shrink-0 border-l border-primary-foreground/25 ps-3 text-right">
          <p className="text-2xl leading-none font-bold tabular-nums">{format.number(challan.totalQty)}</p>
          <p className="text-[11px] text-primary-foreground/85">{t('nouns.pc', { count: challan.totalQty })}</p>
          {returned > 0 && (
            <p className="text-[11px] font-semibold whitespace-nowrap">
              {t('delivery.hero.deliveredCount', { n: format.number(Math.max(0, challan.totalQty - returned)) })}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}

/**
 * One product line: the name, the model in a soft pill — plain type at nearly
 * body size, because a code like WSI-DIAMOND-18M(FROST CLEAN) in 11px grey
 * monospace is something to squint at — what the trip did to it, and how many
 * came back, on the row they belong to.
 *
 * `aside` replaces the quantity on the right; the delivery page puts a stepper
 * there while returns are being recorded.
 */
export function ChallanCardLine({
  line,
  back,
  aside,
}: {
  line: TripLineRecord
  back: number
  aside?: ReactNode
}) {
  const t = useT()
  const format = useFormatters()

  return (
    <li
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1.5 py-1.5',
        back > 0 && '-mx-1.5 bg-tone-rose/5 px-1.5',
        line.change === 'added' && back === 0 && '-mx-1.5 bg-tone-amber/5 px-1.5',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="text-[13px] font-semibold">{line.productName}</span>
        <span className="rounded bg-muted px-1.5 py-px text-[12.5px] font-medium text-foreground/80 wrap-break-word">
          {line.model}
        </span>
        <LineChangeBadge change={line.change} detail={lineDetail(line, t)} />
        <ReturnedQtyBadge qty={back} />
      </div>
      {aside ?? (
        <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[13px] font-bold tabular-nums">
          × {format.number(line.qty)}
        </span>
      )}
    </li>
  )
}

/** What this trip left on the challan for a later one, when it split it. */
export function ChallanCardReserved({ challan }: { challan: TripChallanRecord }) {
  const t = useT()

  if (challan.reserved.length === 0) {
    return null
  }

  return (
    <p className="mx-3.5 mt-1.5 rounded-md bg-tone-cyan/10 px-2 py-1 text-[11px] text-tone-cyan">
      {t('delivery.completion.leftOnChallan')}{' '}
      {challan.reserved.map((line) => `${line.productName} ${line.model} × ${line.qty}`).join('; ')}
    </p>
  )
}

/**
 * How the delivery was finished — floor, carrying, the delivery note — or one
 * muted line saying none of it has been recorded, because "nothing yet" and
 * "the card failed to draw" should not look the same.
 */
export function ChallanCardExtras({ challan }: { challan: TripChallanRecord }) {
  const t = useT()

  const hasExtras = challan.floorNo !== null || challan.carrying.length > 0 || challan.deliveryNote !== ''

  return (
    <div className="flex flex-wrap items-center gap-1 px-3.5 py-2">
      {hasExtras ? (
        <>
          <DeliveryDetailChips challan={challan} compact />
          {challan.deliveryNote && <NoteLine text={challan.deliveryNote} className="basis-full" />}
        </>
      ) : (
        <span className="text-xs text-muted-foreground">{t('delivery.hero.extrasNone')}</span>
      )}
    </div>
  )
}
