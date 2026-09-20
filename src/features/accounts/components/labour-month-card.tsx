import { ChevronRight, CircleDashed, TriangleAlert, Warehouse } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { taka } from '../lib/accounts-meta'
import type { LabourReceivableRecord } from '../types'
import { ProgressBar, SettlementBadge } from './account-atoms'

/**
 * One month of labour, as one claim: what every CSD in it came to, and how much
 * has arrived.
 *
 * The card is a **link rather than a form**. A month is not paid for as a
 * month — each CSD is settled separately — so this level exists to be opened,
 * and the payment button lives on the CSD card inside it. Showing one here
 * would be offering to pay a figure nobody is billed.
 */
export function LabourMonthCard({ month }: { month: LabourReceivableRecord }) {
  const csds = month.csds.filter((csd) => csd.canReceive)
  const settled = csds.filter((csd) => csd.paymentStatus === 'Settled').length

  return (
    <Link
      to={`/accounts/labour-bills/${month.id}`}
      className="group flex flex-col rounded-xl border bg-card shadow-xs transition outline-none hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <header className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] text-muted-foreground">{month.billNumber}</p>
          <h3 className="text-base font-semibold tracking-tight group-hover:text-primary">
            {month.periodLabel}
          </h3>
          {month.company && (
            <p className="truncate text-xs text-muted-foreground">{month.company}</p>
          )}
        </div>
        <SettlementBadge status={month.paymentStatus} receiving />
        <ChevronRight
          className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </header>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 px-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Received</dt>
          <dd className="tabular-nums">{taka(month.receivedAmount)}</dd>
        </div>
        <div className="text-right">
          <dt className="text-xs text-muted-foreground">Billed</dt>
          <dd className="text-lg leading-tight font-semibold tabular-nums">
            {taka(month.billedAmount)}
          </dd>
        </div>
      </dl>

      <div className="grid gap-1.5 px-4 pt-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {settled} of {csds.length} {csds.length === 1 ? 'CSD' : 'CSDs'} settled
          </span>
          <span>{month.outstanding > 0 ? `${taka(month.outstanding)} left` : 'Fully received'}</span>
        </div>
        <ProgressBar
          value={month.receivedAmount}
          max={month.billedAmount}
          tone={month.outstanding > 0 ? 'amber' : 'emerald'}
        />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 p-4 pt-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Warehouse className="size-3" aria-hidden />
          {csds.length} {csds.length === 1 ? 'CSD' : 'CSDs'}
        </span>
        <span
          className={cn(
            'rounded-md border px-1.5 py-px font-medium',
            month.status === 'Finalized'
              ? 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald'
              : 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
          )}
        >
          {month.status}
        </span>
        {month.pendingAmount > 0 && (
          <span className="inline-flex items-center gap-1 text-tone-amber">
            <CircleDashed className="size-3" aria-hidden />
            {taka(month.pendingAmount)} awaiting a Trip DO
          </span>
        )}
        {month.unpricedLines > 0 && (
          <span className="inline-flex items-center gap-1 text-tone-amber">
            <TriangleAlert className="size-3" aria-hidden />
            {month.unpricedLines} unpriced
          </span>
        )}
      </div>
    </Link>
  )
}
