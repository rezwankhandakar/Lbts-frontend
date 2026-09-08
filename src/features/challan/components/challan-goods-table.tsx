import { Layers } from 'lucide-react'
import { rateDescription, rateLabel } from '@/features/product-rate/lib/rate-format'
import { formatAmount } from '@/lib/format'
import type { ChallanRecord } from '../types'

interface ChallanGoodsTableProps {
  record: ChallanRecord
}

const HEAD = 'pb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase'

/**
 * What a challan carries, and what it was charged.
 *
 * A table rather than labelled rows, because several products are lines to be
 * compared — somebody checking a delivery reads down the quantity column, and
 * that only works if the quantities are in a column. The same shape the
 * generated back page prints, plus the two columns the back page deliberately
 * does not: the rate and the line amount.
 *
 * The charge columns are drawn even when nothing is priced, rather than
 * disappearing. An absent column reads as "this challan has no charges"; an
 * empty one with a sentence under it reads as "nobody has costed this yet",
 * which is the true and actionable version — and the fix is usually one click
 * away on the location editor.
 */
export function ChallanGoodsTable({ record }: ChallanGoodsTableProps) {
  const isPriced = record.totalAmount !== null

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className={`${HEAD} text-left`}>Product</th>
              <th className={`${HEAD} text-left`}>Model</th>
              <th className={`${HEAD} hidden text-left sm:table-cell`}>Capacity</th>
              <th className={`${HEAD} text-right`}>Qty</th>
              <th className={`${HEAD} text-right`}>Rate</th>
              <th className={`${HEAD} text-right`}>Amount</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {record.items.map((item, index) => (
              <tr key={`${item.model}-${index}`}>
                <td className="py-2 pr-3 wrap-break-word">{item.productName}</td>
                <td className="py-2 pr-3 wrap-break-word">{item.model}</td>
                <td className="hidden py-2 pr-3 text-xs text-muted-foreground sm:table-cell">
                  {item.capacity || '—'}
                </td>
                <td className="py-2 text-right tabular-nums">{item.qty}</td>

                <td
                  className="py-2 pl-3 text-right whitespace-nowrap tabular-nums"
                  title={item.rate ? rateDescription(item.rate.rate) : 'No rate applied.'}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {item.rate?.rate.kind === 'tiered' && (
                      <Layers className="size-3 shrink-0 text-tone-amber" aria-hidden />
                    )}
                    {item.rate ? rateLabel(item.rate.rate) : '—'}
                  </span>
                </td>

                <td className="py-2 pl-3 text-right tabular-nums">
                  {item.rate ? formatAmount(item.rate.amount) : '—'}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t">
              <td colSpan={3} className={`${HEAD} pt-2 text-left`}>
                Total
              </td>
              <td className="pt-2 text-right font-semibold tabular-nums">{record.totalQty}</td>
              <td />
              <td className="pt-2 pl-3 text-right font-semibold tabular-nums">
                {isPriced ? formatAmount(record.totalAmount) : '—'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <ChargeNote record={record} />
    </div>
  )
}

/**
 * Why the amount column looks the way it does.
 *
 * Three cases and they are genuinely different. Nothing priced and no location
 * is a challan waiting on a classification, which is a thing somebody can go
 * and fix. Nothing priced *with* a location means the products are not on the
 * rate card, which is a different fix in a different place. And a partial
 * total is the dangerous one — a figure that looks complete and is not — so it
 * says how many lines it leaves out.
 */
function ChargeNote({ record }: { record: ChallanRecord }) {
  if (record.unpricedItems === 0) {
    return null
  }

  if (record.totalAmount === null) {
    return (
      <p className="text-xs leading-snug text-muted-foreground">
        {record.locationStatus === 'Pending'
          ? 'Nothing is charged yet: the rate depends on where this went, and the location has not been set. Setting it prices every line automatically.'
          : 'Nothing is charged: none of these products is on the rate card for this location. Adding them to Product Rates and correcting the challan prices it.'}
      </p>
    )
  }

  return (
    <p className="text-xs leading-snug text-muted-foreground">
      This total covers {record.items.length - record.unpricedItems} of {record.items.length} lines.{' '}
      {record.unpricedItems === 1 ? 'One product is' : `${record.unpricedItems} products are`} not on
      the rate card for this location.
    </p>
  )
}
