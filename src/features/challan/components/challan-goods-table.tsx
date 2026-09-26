import { Layers } from 'lucide-react'
import { rateDescription, rateLabel } from '@/features/product-rate/lib/rate-format'
import { BLANK, formatAmount, formatNumber } from '@/lib/format'
import type { ChallanRecord } from '../types'
import { useT } from '@/lib/i18n'

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
  const t = useT()

  const isPriced = record.totalAmount !== null

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className={`${HEAD} text-left`}>{t('challan.goods.product')}</th>
              <th className={`${HEAD} text-left`}>{t('challan.goods.model')}</th>
              <th className={`${HEAD} hidden text-left sm:table-cell`}>
                {t('challan.goods.capacity')}
              </th>
              <th className={`${HEAD} text-right`}>{t('challan.goods.qty')}</th>
              <th className={`${HEAD} text-right`}>{t('challan.goods.rate')}</th>
              <th className={`${HEAD} text-right`}>{t('challan.goods.amount')}</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {record.items.map((item, index) => (
              <tr key={`${item.model}-${index}`}>
                <td className="py-2 pr-3 wrap-break-word">{item.productName}</td>
                <td className="py-2 pr-3 wrap-break-word">{item.model}</td>
                <td className="hidden py-2 pr-3 text-xs text-muted-foreground sm:table-cell">
                  {item.capacity || BLANK}
                </td>
                <td className="py-2 text-right tabular-nums">{formatNumber(item.qty)}</td>

                <td
                  className="py-2 pl-3 text-right whitespace-nowrap tabular-nums"
                  title={item.rate ? rateDescription(item.rate.rate, t) : t('productRate.rate.none')}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {item.rate?.rate.kind === 'tiered' && (
                      <Layers className="size-3 shrink-0 text-tone-amber" aria-hidden />
                    )}
                    {item.rate ? rateLabel(item.rate.rate) : BLANK}
                  </span>
                </td>

                <td className="py-2 pl-3 text-right tabular-nums">
                  {item.rate ? formatAmount(item.rate.amount) : BLANK}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t">
              <td colSpan={3} className={`${HEAD} pt-2 text-left`}>
                {t('challan.goods.total')}
              </td>
              <td className="pt-2 text-right font-semibold tabular-nums">
                {formatNumber(record.totalQty)}
              </td>
              <td />
              <td className="pt-2 pl-3 text-right font-semibold tabular-nums">
                {isPriced ? formatAmount(record.totalAmount) : BLANK}
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
  const t = useT()

  if (record.unpricedItems === 0) {
    return null
  }

  if (record.totalAmount === null) {
    return (
      <p className="text-xs leading-snug text-muted-foreground">
        {record.locationStatus === 'Pending'
          ? t('challan.goods.noLocationYet')
          : t('challan.goods.notOnCard')}
      </p>
    )
  }

  return (
    <p className="text-xs leading-snug text-muted-foreground">
      {t('challan.goods.partialTotal', {
        priced: formatNumber(record.items.length - record.unpricedItems),
        total: formatNumber(record.items.length),
        unpriced: t('challan.goods.unpricedProducts', {
          count: record.unpricedItems,
          n: formatNumber(record.unpricedItems),
        }),
      })}
    </p>
  )
}
