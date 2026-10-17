import { Boxes } from 'lucide-react'
import { countOf, useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { tallyProducts } from '../lib/cart'
import type { TripChallanRecord } from '../types'

/**
 * What is on the lorry, by product, as one row of chips.
 *
 * "6 refrigerators, 2 air conditioners, 8 pieces" is the sentence somebody
 * checks against a tailgate, so the rollup is `tallyProducts` — by product
 * name across every challan, largest first — and a chip is the name and the
 * count, nothing else. Models are on the challan cards below; here they turned
 * a row of counts into a row of part numbers nobody was checking.
 *
 * What came back is said once, beside the total, as returned and delivered —
 * the product it belongs to is marked on that challan's own row. The
 * exceptions a trip made to its paper — a split, changed lines, edited
 * details — follow the products only when there are any; a row of zeros is a
 * row of things to read that say nothing.
 */
export function TripProductChips({ challans }: { challans: TripChallanRecord[] }) {
  const t = useT()
  const format = useFormatters()

  const tally = tallyProducts(challans.flatMap((challan) => challan.lines))
  const returnedQty = challans.reduce((sum, challan) => sum + challan.returnedQty, 0)

  const exceptions = [
    {
      label: t('delivery.summary.split'),
      value: challans.filter((challan) => challan.reserved.length > 0).length,
      tone: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    },
    {
      label: t('delivery.summary.linesChanged'),
      value: challans.reduce((sum, challan) => sum + challan.changedLines, 0),
      tone: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    },
    {
      label: t('delivery.summary.detailsEdited'),
      value: challans.filter((challan) => challan.edited.length > 0).length,
      tone: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    },
  ].filter((exception) => exception.value > 0)

  if (tally.rows.length === 0) {
    return null
  }

  return (
    <section
      aria-label={t('delivery.dispatch.challanQuantityAria')}
      className="flex flex-wrap items-center gap-x-3 gap-y-2"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
          <Boxes className="size-4" aria-hidden />
        </span>
        <h2 className="text-sm font-semibold tracking-tight whitespace-nowrap">
          {t('delivery.dispatch.productSummary')}
        </h2>
      </div>

      <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {tally.rows.map((row) => (
          <li
            key={row.productName}
            className="flex max-w-full items-center gap-2 rounded-lg border bg-muted/30 py-0.5 ps-2.5 pe-0.5"
          >
            <span className="min-w-0 truncate text-[13px] font-medium">{row.productName}</span>
            <span className="flex min-w-7 shrink-0 items-center justify-center rounded-md bg-primary px-1.5 py-0.5 text-[13px] font-bold text-primary-foreground tabular-nums">
              {format.number(row.qty)}
            </span>
          </li>
        ))}

        {exceptions.map((exception) => (
          <li
            key={exception.label}
            className={cn(
              'flex items-center gap-1.5 self-center rounded-full border px-2.5 py-1 text-[11px] font-semibold',
              exception.tone,
            )}
          >
            {exception.label}
            <span className="tabular-nums">{format.number(exception.value)}</span>
          </li>
        ))}
      </ul>

      <p className="flex shrink-0 flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
        <span>{countOf(tally.products, 'nouns.product', t)}</span>
        {returnedQty > 0 && (
          <span>
            {t('delivery.hero.returnedDelivered', {
              returned: format.number(returnedQty),
              delivered: format.number(tally.qty - returnedQty),
            })}
          </span>
        )}
        <span className="text-base font-bold text-foreground tabular-nums">{countOf(tally.qty, 'nouns.pc', t)}</span>
      </p>
    </section>
  )
}
