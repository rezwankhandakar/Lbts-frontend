import { TriangleAlert } from 'lucide-react'
import { formatTaka } from '@/lib/format'
import type { LabourBillRecord } from '../types'

/**
 * The bill's figures in one strip: the amount first and largest, then what it
 * is made of.
 *
 * Rows nobody has priced are said out loud, because the total leaves them out —
 * a labour bill whose figure looks finished and is quietly missing four
 * deliveries is exactly what a month-end claim must not be. It is also the one
 * thing that stops the bill being finalized, so naming it here is naming the
 * next thing to do.
 */
export function LabourBillStats({ bill }: { bill: LabourBillRecord }) {
  const counts: [string, string][] = [
    ['Ven/Pulling/Labour', formatTaka(bill.labourTotal)],
    ['Floor', formatTaka(bill.floorTotal)],
    ['Rows', bill.lineCount.toLocaleString()],
    ['Challans', bill.challanCount.toLocaleString()],
  ]

  return (
    <div className="relative grid border-t bg-card/60 sm:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
      <div className="border-b px-5 py-4 sm:border-r sm:border-b-0 sm:px-6">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Labour bill total
        </p>
        <p className="mt-0.5 text-3xl font-semibold tracking-tight tabular-nums">
          {formatTaka(bill.totalAmount)}
        </p>
        {bill.unpricedLines > 0 && (
          <p className="mt-1 inline-flex items-start gap-1 text-xs font-medium text-tone-amber">
            <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
            <span className="text-pretty">
              {bill.unpricedLines} {bill.unpricedLines === 1 ? 'row has' : 'rows have'} no amount yet
              and {bill.unpricedLines === 1 ? 'adds' : 'add'} nothing
            </span>
          </p>
        )}
      </div>

      <dl className="col-span-4 grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
        {counts.map(([label, value]) => (
          <div key={label} className="flex flex-col justify-center px-3 py-4 text-center sm:px-4">
            <dt className="text-[10.5px] font-medium tracking-wide text-muted-foreground uppercase">
              {label}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
