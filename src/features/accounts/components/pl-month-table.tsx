import { cn } from '@/lib/utils'
import { signedTaka, taka } from '../lib/accounts-meta'
import type { ProfitLossReport } from '../types'

/** Every month of the report on one row each, totalled at the foot. */
export function PlMonthTable({ report }: { report: ProfitLossReport }) {
  const { summary } = report

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[48rem] text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Month</th>
            <th className="px-2 py-2.5 text-right font-medium">Final bill</th>
            <th className="px-2 py-2.5 text-right font-medium">Trip rent</th>
            <th className="px-2 py-2.5 text-right font-medium">Labour</th>
            <th className="px-2 py-2.5 text-right font-medium">Office</th>
            <th className="px-2 py-2.5 text-right font-medium">Total cost</th>
            <th className="px-2 py-2.5 text-right font-medium">Profit</th>
            <th className="px-4 py-2.5 text-right font-medium">Margin</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {[...report.months].reverse().map((month) => (
            <tr key={`${month.year}-${month.month}`} className="transition-colors hover:bg-muted/30">
              <td className="px-4 py-2.5">
                <p className="font-medium">{month.label}</p>
                {month.pendingUnits.length > 0 && (
                  <p className="text-[11px] text-tone-amber">Awaiting final bill: {month.pendingUnits.join(', ')}</p>
                )}
              </td>
              <td className="px-2 py-2.5 text-right font-medium tabular-nums">{month.finalBillCount > 0 ? taka(month.income) : '—'}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{taka(month.tripRent)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{taka(month.labourBill)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{taka(month.officeExpense)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{taka(month.totalCost)}</td>
              <td className={cn('px-2 py-2.5 text-right font-semibold tabular-nums', month.profit < 0 ? 'text-tone-rose' : 'text-tone-emerald')}>
                {signedTaka(month.profit)}
              </td>
              <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{month.margin === null ? '—' : `${month.margin}%`}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t bg-muted/30 font-semibold">
            <td className="px-4 py-2.5">Total</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{taka(summary.income)}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{taka(summary.tripRent)}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{taka(summary.labourBill)}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{taka(summary.officeExpense)}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{taka(summary.totalCost)}</td>
            <td className={cn('px-2 py-2.5 text-right tabular-nums', summary.profit < 0 ? 'text-tone-rose' : 'text-tone-emerald')}>
              {signedTaka(summary.profit)}
            </td>
            <td className="px-4 py-2.5 text-right tabular-nums">{summary.margin === null ? '—' : `${summary.margin}%`}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
