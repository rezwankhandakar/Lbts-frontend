import { TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatRelative, formatTaka } from '@/lib/format'
import { cn } from '@/lib/utils'
import { billStatusMeta, shortMonth } from '../lib/bill-meta'
import type { BillRecord } from '../types'
import { BillStatusBadge } from './bill-badges'

/**
 * One bill in the list: the month as a calendar tile, the amount large, and the
 * three counts somebody checks a bill by before opening it.
 */
export function BillCard({ bill }: { bill: BillRecord }) {
  const status = billStatusMeta(bill.status)
  const counts: [string, number][] = [
    ['Trip DO', bill.tripDoCount],
    ['Rows', bill.lineCount],
    ['Pcs', bill.totalQty],
  ]

  return (
    <Link
      to={`/bills/${bill.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition outline-none hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className={cn('absolute inset-x-0 top-0 h-1', status.dot)} aria-hidden />

      <div className="flex items-start gap-3 p-4 pb-3">
        <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <span className="text-[12px] leading-none font-bold tracking-wider uppercase">
            {shortMonth(bill.month)}
          </span>
          <span className="mt-1 text-[11px] leading-none tabular-nums opacity-80">{bill.year}</span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="truncate font-mono text-[12.5px] font-semibold group-hover:text-primary">
              {bill.billNumber}
            </span>
            <BillStatusBadge status={bill.status} />
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[13px] font-medium">
            Unit
            <span className="rounded-md border bg-background px-1.5 py-px font-mono text-xs">{bill.unit}</span>
            <span className="text-muted-foreground">· {bill.periodLabel}</span>
          </span>
          {bill.note && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground" title={bill.note}>
              {bill.note}
            </span>
          )}
        </span>
      </div>

      <div className="px-4">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Bill amount</span>
        <span className="block text-2xl font-semibold tracking-tight tabular-nums">
          {formatTaka(bill.totalAmount)}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-3 divide-x border-y bg-muted/30 text-center">
        {counts.map(([label, value]) => (
          <div key={label} className="px-2 py-2">
            <dt className="text-[10.5px] font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
            <dd className="text-sm font-semibold tabular-nums">{value.toLocaleString()}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-between gap-2 px-4 py-2.5 text-[11.5px] text-muted-foreground">
        <span className="truncate">
          {bill.createdBy ? `${bill.createdBy.name} · ` : ''}updated {formatRelative(bill.updatedAt)}
        </span>
        {bill.unpricedLines > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1 font-medium text-tone-amber">
            <TriangleAlert className="size-3" aria-hidden />
            {bill.unpricedLines} unpriced
          </span>
        )}
      </div>
    </Link>
  )
}
