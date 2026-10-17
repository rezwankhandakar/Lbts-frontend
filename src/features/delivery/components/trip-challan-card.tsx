import { ArrowRight, ExternalLink, PackageCheck, StickyNote, Undo2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatPadded, useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { storedReturns } from '../lib/completion-payload'
import { completionMeta, lineDetail } from '../lib/delivery-meta'
import type { TripChallanRecord } from '../types'
import { ChallanDocumentButtons } from './challan-document-buttons'
import { ChallanPartyDetails } from './challan-party-details'
import { LineChangeBadge, ReturnedQtyBadge } from './delivery-badges'
import { DeliveryDetailChips } from './delivery-detail-chips'

interface TripChallanCardProps {
  challan: TripChallanRecord
  /** Its place on the trip, numbered the way its stop at the head of the page is. */
  position: number
  /** Where this challan's delivery page lives, when the viewer may open it. */
  completionHref?: string
  /** Briefly true after its stop was pressed, so the eye lands on the right card. */
  highlighted?: boolean
}

/**
 * One challan on the lorry: which it is, who takes it and where, every product
 * line and what the trip did to it, how the delivery was finished, and the way
 * through to finishing it.
 *
 * **Sized so a laptop screen holds two rows of cards.** That is the budget
 * every line here is spent against: the header is two lines — the identifiers
 * and status, then the customer — the thana, district and receiver share one
 * line under the address, a product is one line with its model beside its
 * name, and the actions are the small buttons. Text stays at body size; it is
 * the padding and the stacking that were cut, not the legibility.
 *
 * The header is drawn in the delivery's own colour — a band token, because it
 * carries white text in both themes — so the ones still waiting for a signed
 * copy are found down a page without reading a word.
 *
 * A product that came back says so **on its own row**: "2 came back" on a
 * challan of two air conditioners is a question, "Returned 2" against the 48D
 * is the answer. `storedReturns` matches each return to its line, the same
 * matching the delivery page records them by. Below the goods sits how the
 * delivery was finished — floor, carrying, the delivery note — the same chips
 * this challan's stop carries at the head of the page.
 */
export function TripChallanCard({ challan, position, completionHref, highlighted = false }: TripChallanCardProps) {
  const t = useT()
  const format = useFormatters()

  const meta = completionMeta(challan, t)
  const complete = challan.outcome === 'Complete'
  const returns = storedReturns(challan)
  const hasExtras = challan.floorNo !== null || challan.carrying.length > 0 || challan.deliveryNote !== ''

  return (
    <article
      id={`trip-challan-${challan.challanId}`}
      className={cn(
        'flex h-full scroll-mt-24 flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md',
        highlighted && 'ring-3 ring-primary/40',
      )}
    >
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
            {formatPadded(position, 2)}
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
              {challan.returnedQty > 0 && challan.completionMethod !== 'Returned' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground px-2 py-px text-[11px] font-semibold text-band-rose">
                  <Undo2 className="size-3" aria-hidden />
                  {t('delivery.dispatch.cameBackCount', { returned: format.number(challan.returnedQty) })}
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
            {challan.returnedQty > 0 && (
              <p className="text-[11px] font-semibold whitespace-nowrap">
                {t('delivery.hero.deliveredCount', { n: format.number(challan.deliveredQty) })}
              </p>
            )}
          </div>
        </div>
      </header>

      <ChallanPartyDetails challan={challan} variant="card" className="px-3.5 pt-2.5" />

      {challan.reserved.length > 0 && (
        <p className="mx-3.5 mt-1.5 rounded-md bg-tone-cyan/10 px-2 py-1 text-[11px] text-tone-cyan">
          {t('delivery.completion.leftOnChallan')}{' '}
          {challan.reserved.map((line) => `${line.productName} ${line.model} × ${line.qty}`).join('; ')}
        </p>
      )}

      <ul aria-label={t('delivery.hero.products')} className="mx-3.5 mt-2 divide-y border-y">
        {challan.lines.map((line, index) => {
          const back = returns[index] ?? 0

          return (
            <li
              key={index}
              className={cn(
                'flex items-center gap-2 py-1.5',
                back > 0 && '-mx-1.5 bg-tone-rose/5 px-1.5',
                line.change === 'added' && back === 0 && '-mx-1.5 bg-tone-amber/5 px-1.5',
              )}
            >
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-[13px] font-semibold">{line.productName}</span>
                <span className="font-mono text-[11px] text-muted-foreground wrap-break-word">{line.model}</span>
                <LineChangeBadge change={line.change} detail={lineDetail(line, t)} />
                <ReturnedQtyBadge qty={back} />
              </div>
              <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[13px] font-bold tabular-nums">
                × {format.number(line.qty)}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-1 px-3.5 py-2">
        {hasExtras ? (
          <>
            <DeliveryDetailChips challan={challan} compact />
            {challan.deliveryNote && (
              <span
                className="flex min-w-0 basis-full items-start gap-1 text-xs text-muted-foreground italic"
                title={challan.deliveryNote}
              >
                <StickyNote className="mt-px size-3.5 shrink-0 not-italic" aria-hidden />
                <span className="line-clamp-2 wrap-break-word">{challan.deliveryNote}</span>
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground/80">{t('delivery.hero.extrasNone')}</span>
        )}
      </div>

      <footer className="mt-auto flex flex-wrap items-center gap-1.5 border-t bg-muted/30 px-3.5 py-2">
        <ChallanDocumentButtons challan={challan} />
        {completionHref && (
          <Button
            size="sm"
            className={cn('ms-auto text-primary-foreground', meta.bandButton)}
            render={<Link to={completionHref} />}
          >
            <PackageCheck data-icon="inline-start" aria-hidden />
            {complete ? t('delivery.completion.openDelivery') : t('delivery.completion.completeDelivery')}
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
        )}
      </footer>
    </article>
  )
}
