import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { signedTaka, taka } from '../lib/accounts-meta'
import type { ProfitLossMonth, ProfitLossReport } from '../types'

const profitTone = (profit: number) => (profit < 0 ? 'text-tone-rose' : 'text-tone-emerald')

/**
 * Every month of the report on one row each, totalled at the foot — a table
 * from md up, a card per month below it. Eight money columns cannot be read on
 * a phone at any scroll offset, so the card leads with the three figures a
 * month is asked about and puts the cost split under them.
 */
export function PlMonthTable({ report }: { report: ProfitLossReport }) {
  const t = useT()

  const { summary } = report
  const months = [...report.months].reverse()

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[48rem] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">{t('accounts.profit.month')}</th>
              <th className="px-2 py-2.5 text-right font-medium">{t('accounts.finalBill.finalBill')}</th>
              <th className="px-2 py-2.5 text-right font-medium">{t('accounts.profit.tripRent')}</th>
              <th className="px-2 py-2.5 text-right font-medium">{t('accounts.profit.labour')}</th>
              <th className="px-2 py-2.5 text-right font-medium">{t('accounts.profit.office')}</th>
              <th className="px-2 py-2.5 text-right font-medium">{t('accounts.profit.totalCost')}</th>
              <th className="px-2 py-2.5 text-right font-medium">{t('accounts.profit.profit')}</th>
              <th className="px-4 py-2.5 text-right font-medium">{t('accounts.profit.margin')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {months.map((month) => (
              <tr key={`${month.year}-${month.month}`} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-2.5">
                  <p className="font-medium">{month.label}</p>
                  {month.pendingUnits.length > 0 && (
                    <p className="text-[11px] text-tone-amber">Awaiting final bill: {month.pendingUnits.join(', ')}</p>
                  )}
                </td>
                <td className="px-2 py-2.5 text-right font-medium tabular-nums">{month.finalBillCount + month.labourBillCount > 0 ? taka(month.income) : '—'}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{taka(month.tripRent)}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{taka(month.labourBill)}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{taka(month.officeExpense)}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{taka(month.totalCost)}</td>
                <td className={cn('px-2 py-2.5 text-right font-semibold tabular-nums', profitTone(month.profit))}>
                  {signedTaka(month.profit)}
                </td>
                <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{month.margin === null ? '—' : `${month.margin}%`}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/30 font-semibold">
              <td className="px-4 py-2.5">{t('accounts.profit.total')}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{taka(summary.income)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{taka(summary.tripRent)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{taka(summary.labourBill)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{taka(summary.officeExpense)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{taka(summary.totalCost)}</td>
              <td className={cn('px-2 py-2.5 text-right tabular-nums', profitTone(summary.profit))}>
                {signedTaka(summary.profit)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">{summary.margin === null ? '—' : `${summary.margin}%`}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <ul className="divide-y md:hidden">
        {months.map((month) => (
          <MonthCard key={`${month.year}-${month.month}`} month={month} />
        ))}
        <li className="grid gap-1.5 bg-muted/30 px-4 py-3">
          <div className="flex items-baseline justify-between gap-2 text-sm font-semibold">
            <span>{t('accounts.profit.total')}</span>
            <span className={cn('tabular-nums', profitTone(summary.profit))}>{signedTaka(summary.profit)}</span>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            {taka(summary.income)} income · {taka(summary.totalCost)} cost
            {summary.margin !== null && ` · ${summary.margin}% margin`}
          </p>
        </li>
      </ul>
    </>
  )
}

/** One month on a phone: what came in, what it cost, and what that left. */
function MonthCard({ month }: { month: ProfitLossMonth }) {
  const t = useT()

  const costs = [
    { label: t('accounts.profit.tripRent'), value: month.tripRent },
    { label: t('accounts.profit.labour'), value: month.labourBill },
    { label: t('accounts.profit.office'), value: month.officeExpense },
  ]

  return (
    <li className="grid gap-2 px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{month.label}</span>
        <span className={cn('text-sm font-semibold tabular-nums', profitTone(month.profit))}>{signedTaka(month.profit)}</span>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">{t('accounts.finalBill.finalBill')}</dt>
          <dd className="font-semibold tabular-nums">{month.finalBillCount + month.labourBillCount > 0 ? taka(month.income) : '—'}</dd>
        </div>
        <div className="text-right">
          <dt className="text-muted-foreground">{t('accounts.profit.totalCost')}</dt>
          <dd className="font-semibold tabular-nums">{taka(month.totalCost)}</dd>
        </div>
      </dl>

      <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground tabular-nums">
        {costs.map((cost) => (
          <span key={cost.label}>
            {cost.label} {taka(cost.value)}
          </span>
        ))}
        {month.margin !== null && <span>{month.margin}% margin</span>}
      </p>

      {month.pendingUnits.length > 0 && (
        <p className="text-[11px] text-tone-amber">Awaiting final bill: {month.pendingUnits.join(', ')}</p>
      )}
    </li>
  )
}
