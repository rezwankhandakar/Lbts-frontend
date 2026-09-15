import { Boxes, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tallyProducts } from '../lib/cart'

interface ChallanQuantitySummaryProps {
  /** Every product line on the trip, across all its challans. */
  lines: readonly { productName: string; model: string; qty: number }[]
  /** What went out on this trip and came back, if anything has. */
  returned?: readonly { productName: string; model: string; qty: number }[]
  className?: string
}

/**
 * What is on the lorry, by product.
 *
 * This is what replaced the three tiles that used to head a trip — challans,
 * pieces, lines changed. Those counted paperwork; an operator standing at a
 * tailgate is counting refrigerators, and the only summary that helps is the
 * one written in the same units: **six refrigerators, two air conditioners,
 * eight pieces in all**.
 *
 * Rolled up by product name across every challan, because nobody counts a
 * lorry one challan at a time — the arithmetic is `tallyProducts`, which is
 * pure and tested without a renderer. The models are shown under the name
 * rather than splitting it into a row each: two models of refrigerator are
 * still refrigerators to somebody counting them, and the model is what
 * distinguishes them once the count is right.
 *
 * When something has come back the delivered figure is shown beside the loaded
 * one, because at that point "what went out" and "what stayed" are two
 * different numbers and only one of them is the delivery.
 */
export function ChallanQuantitySummary({
  lines,
  returned = [],
  className,
}: ChallanQuantitySummaryProps) {
  const tally = tallyProducts(lines)
  const returnedQty = returned.reduce((sum, line) => sum + line.qty, 0)

  if (tally.rows.length === 0) {
    return null
  }

  const byProduct = new Map(
    tallyProducts(returned).rows.map((row) => [row.productName.toLowerCase(), row.qty]),
  )

  return (
    <section
      aria-label="Challan quantity"
      className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}
    >
      <header className="flex items-center gap-2.5 border-b bg-gradient-to-r from-primary/10 to-transparent px-4 py-2.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Boxes className="size-4" aria-hidden />
        </span>
        <h3 className="text-sm font-semibold tracking-tight">Challan quantity</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {tally.products} {tally.products === 1 ? 'product' : 'products'}
        </span>
      </header>

      <ul className="divide-y">
        {tally.rows.map((row) => {
          const back = byProduct.get(row.productName.toLowerCase()) ?? 0

          return (
            <li key={row.productName} className="flex items-baseline gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{row.productName}</p>
                {row.models.length > 0 && (
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {row.models.join(' · ')}
                  </p>
                )}
              </div>

              {back > 0 && (
                <span
                  className="flex shrink-0 items-center gap-1 rounded-md border border-tone-rose/25 bg-tone-rose/10 px-1.5 py-0.5 text-[11px] text-tone-rose"
                  title={`${back} came back off the lorry`}
                >
                  <Undo2 className="size-3" aria-hidden />
                  {back}
                </span>
              )}

              <p className="shrink-0 text-sm font-semibold tabular-nums">
                {row.qty.toLocaleString()}{' '}
                <span className="text-xs font-normal text-muted-foreground">pcs</span>
              </p>
            </li>
          )
        })}
      </ul>

      <footer className="flex items-baseline gap-3 border-t bg-muted/30 px-4 py-2.5">
        <p className="flex-1 text-sm font-medium">Total product</p>
        {returnedQty > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-tone-rose tabular-nums">{returnedQty}</span> returned
            ·{' '}
            <span className="font-semibold text-foreground tabular-nums">
              {(tally.qty - returnedQty).toLocaleString()}
            </span>{' '}
            delivered
          </p>
        )}
        <p className="text-base font-semibold tabular-nums">
          {tally.qty.toLocaleString()}{' '}
          <span className="text-xs font-normal text-muted-foreground">pcs</span>
        </p>
      </footer>
    </section>
  )
}
