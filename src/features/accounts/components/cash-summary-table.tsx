import { CalendarRange } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signedTaka, taka } from '../lib/accounts-meta'
import type { CashFigures, CashSummaryRow } from '../types'

const IN_COLUMNS: { key: keyof CashFigures; label: string }[] = [
  { key: 'deposits', label: 'Deposit' },
  { key: 'transfersIn', label: 'Transfer in' },
]

const OUT_COLUMNS: { key: keyof CashFigures; label: string }[] = [
  { key: 'vendorPayments', label: 'Vendor payment' },
  { key: 'tripAdvances', label: 'Trip advance' },
  { key: 'advancesNet', label: 'Advance (after return)' },
  { key: 'expenses', label: 'Expense' },
  { key: 'transfersOut', label: 'Transfer out' },
]

function amount(value: number) {
  return value === 0 ? <span className="text-muted-foreground/60">—</span> : taka(value)
}

/**
 * Cash in and out for each month or year of the range, newest first: what came
 * in and how, what went out and on what, and the difference. A table from md
 * up, a card per period below it.
 */
export function CashSummaryTable({ rows, totals }: { rows: CashSummaryRow[]; totals: CashFigures }) {
  const largestIn = Math.max(1, ...rows.map((row) => row.moneyIn))
  // Transfers only move money into or out of a bank or bKash wallet on entries
  // written before that was closed off, so their columns appear only when the
  // range holds one.
  const inColumns = IN_COLUMNS.filter((column) => column.key !== 'transfersIn' || totals.transfersIn > 0)
  const outColumns = OUT_COLUMNS.filter((column) => column.key !== 'transfersOut' || totals.transfersOut > 0)

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
        <CalendarRange className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">Choose a range to see cash in and out.</p>
      </div>
    )
  }

  const cells = (figures: CashFigures, strong = false) => (
    <>
      {inColumns.map((column) => (
        <td key={column.key} className="px-2 py-2.5 text-right tabular-nums">
          {amount(figures[column.key])}
        </td>
      ))}
      <td className={cn('border-x bg-tone-emerald/5 px-3 py-2.5 text-right font-semibold text-tone-emerald tabular-nums', strong && 'text-base')}>
        {taka(figures.moneyIn)}
      </td>
      {outColumns.map((column) => (
        <td key={column.key} className="px-2 py-2.5 text-right tabular-nums">
          {amount(figures[column.key])}
        </td>
      ))}
      <td className={cn('border-x bg-tone-rose/5 px-3 py-2.5 text-right font-semibold text-tone-rose tabular-nums', strong && 'text-base')}>
        {taka(figures.moneyOut)}
      </td>
      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{signedTaka(figures.net)}</td>
    </>
  )

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[68rem] text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th rowSpan={2} className="sticky left-0 bg-card px-4 py-2 text-left font-medium">
                Period
              </th>
              <th colSpan={inColumns.length + 1} className="border-x px-2 pt-2 text-center font-medium text-tone-emerald">
                Cash in
              </th>
              <th colSpan={outColumns.length + 1} className="border-x px-2 pt-2 text-center font-medium text-tone-rose">
                Cash out
              </th>
              <th rowSpan={2} className="px-4 py-2 text-right font-medium">
                Net
              </th>
            </tr>
            <tr className="border-b text-[11px] text-muted-foreground">
              {inColumns.map((column) => (
                <th key={column.key} className="px-2 py-1.5 text-right font-normal">
                  {column.label}
                </th>
              ))}
              <th className="border-x px-3 py-1.5 text-right font-medium">Total in</th>
              {outColumns.map((column) => (
                <th key={column.key} className="px-2 py-1.5 text-right font-normal">
                  {column.label}
                </th>
              ))}
              <th className="border-x px-3 py-1.5 text-right font-medium">Total out</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.key} className="transition-colors hover:bg-muted/30">
                <th scope="row" className="sticky left-0 bg-card px-4 py-2.5 text-left font-medium whitespace-nowrap">
                  {row.label}
                </th>
                {cells(row)}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 bg-muted/30">
              <th scope="row" className="sticky left-0 bg-muted px-4 py-3 text-left font-semibold">
                Range total
              </th>
              {cells(totals, true)}
            </tr>
          </tfoot>
        </table>
      </div>

      <ul className="divide-y md:hidden">
        {rows.map((row) => (
          <li key={row.key} className="grid gap-2 px-4 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium">{row.label}</span>
              <span className="text-sm font-semibold tabular-nums">{signedTaka(row.net)}</span>
            </div>
            <span className="h-1.5 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-viz-1" style={{ width: `${(row.moneyIn / largestIn) * 100}%` }} />
            </span>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-muted-foreground">Cash in</dt>
                <dd className="font-semibold text-tone-emerald tabular-nums">{taka(row.moneyIn)}</dd>
                <dd className="text-[11px] text-muted-foreground">Deposit {taka(row.deposits)}</dd>
              </div>
              <div className="text-right">
                <dt className="text-muted-foreground">Cash out</dt>
                <dd className="font-semibold text-tone-rose tabular-nums">{taka(row.moneyOut)}</dd>
                <dd className="text-[11px] text-muted-foreground">Vendor {taka(row.vendorPayments + row.tripAdvances)}</dd>
              </div>
            </dl>
          </li>
        ))}
        <li className="flex items-center justify-between bg-muted/30 px-4 py-3 text-sm font-semibold">
          <span>Range total</span>
          <span className="text-right tabular-nums">
            <span className="text-tone-emerald">{taka(totals.moneyIn)}</span> ·{' '}
            <span className="text-tone-rose">{taka(totals.moneyOut)}</span>
          </span>
        </li>
      </ul>
    </>
  )
}
