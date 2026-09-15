import { TriangleAlert } from 'lucide-react'
import { formatTaka } from '@/lib/format'
import type { BillRecord } from '../types'

/**
 * The bill's figures in one strip: the amount first and largest, then the
 * counts. Unpriced rows are said out loud, because the amount leaves them out
 * and a total that silently omits rows is a figure somebody would invoice on.
 */
export function BillStats({ bill }: { bill: BillRecord }) {
  const counts: [string, number][] = [
    ['Trip DO', bill.tripDoCount],
    ['Rows', bill.lineCount],
    ['Pieces', bill.totalQty],
    ['Challans', bill.challanCount],
  ]

  return (
    <div className="relative grid border-t bg-card/60 sm:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
      <div className="border-b px-5 py-4 sm:border-r sm:border-b-0 sm:px-6">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Bill amount</p>
        <p className="mt-0.5 text-3xl font-semibold tracking-tight tabular-nums">{formatTaka(bill.totalAmount)}</p>
        {bill.unpricedLines > 0 && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-tone-amber">
            <TriangleAlert className="size-3.5" aria-hidden />
            {bill.unpricedLines} {bill.unpricedLines === 1 ? 'row has' : 'rows have'} no rate and add nothing
          </p>
        )}
      </div>

      <dl className="col-span-4 grid grid-cols-4 divide-x">
        {counts.map(([label, value]) => (
          <div key={label} className="flex flex-col justify-center px-3 py-4 text-center sm:px-4">
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums">{value.toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
