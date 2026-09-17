import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { signedTaka, taka } from '../lib/accounts-meta'
import type { ProfitLossReport } from '../types'
import { Panel } from './account-atoms'

function Empty({ text }: { text: string }) {
  return <p className="px-4 py-8 text-center text-sm text-muted-foreground">{text}</p>
}

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  return (
    <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
      <span className={cn('block h-full rounded-full', className)} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
    </span>
  )
}

/**
 * Where the income came from and where the cost went: by unit, against what
 * the Excel bills asked; by expense name; and by vendor, largest first.
 */
export function PlBreakdowns({ report, fromParam }: { report: ProfitLossReport; fromParam: string }) {
  const topUnit = Math.max(0, ...report.incomeByUnit.map((row) => row.finalAmount))
  const topVendor = Math.max(0, ...report.costByVendor.map((row) => row.total))

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel title="Income by unit" description="Final bill, and what the audit changed">
        {report.incomeByUnit.length === 0 ? (
          <Empty text="No final bill in this period." />
        ) : (
          <ul className="grid gap-3 p-4">
            {report.incomeByUnit.map((row) => (
              <li key={row.unit} className="grid gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-[13px]">
                  <span className="font-mono font-medium">{row.unit}</span>
                  <span className="tabular-nums">{taka(row.finalAmount)}</span>
                </div>
                <Bar value={row.finalAmount} max={topUnit} className="bg-viz-1" />
                <p className="flex justify-between text-[11px] text-muted-foreground">
                  <span>
                    {row.months} {row.months === 1 ? 'month' : 'months'} · asked {taka(row.submittedAmount)}
                  </span>
                  <span className={cn('tabular-nums', row.difference < 0 && 'text-tone-rose')}>
                    {row.difference === 0 ? 'no change' : signedTaka(row.difference)}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Office expenses" description="By expense name">
        {report.expenseByName.length === 0 ? (
          <Empty text="No office expense in this period." />
        ) : (
          <ul className="grid gap-3 p-4">
            {report.expenseByName.map((row) => (
              <li key={row.name} className="grid gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-[13px]">
                  <span className="truncate font-medium">{row.name}</span>
                  <span className="shrink-0 tabular-nums">
                    {taka(row.amount)} <span className="text-xs text-muted-foreground">{row.share}%</span>
                  </span>
                </div>
                <Bar value={row.share} max={100} className="bg-viz-2" />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Trip cost by vendor" description="Rent and labour bill">
        {report.costByVendor.length === 0 ? (
          <Empty text="No trip in this period." />
        ) : (
          <ul className="grid gap-3 p-4">
            {report.costByVendor.slice(0, 10).map((row) => (
              <li key={row.vendorId} className="grid gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-[13px]">
                  <Link to={`/accounts/vendor-bills/${row.vendorId}?month=${fromParam}`} className="truncate font-medium hover:text-primary">
                    {row.name}
                  </Link>
                  <span className="shrink-0 tabular-nums">{taka(row.total)}</span>
                </div>
                <Bar value={row.total} max={topVendor} className="bg-viz-2" />
                <p className="text-[11px] text-muted-foreground">
                  {row.tripCount} trips · rent {taka(row.tripRent)} · labour {taka(row.labourBill)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
