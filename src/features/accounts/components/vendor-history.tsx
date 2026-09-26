import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { comparePeriods, signedTaka, taka } from '../lib/accounts-meta'
import type { Period, VendorMonthFigures, VendorMonthHistory } from '../types'
import { Panel, VendorBillBadge } from './account-atoms'

interface VendorHistoryProps {
  history: VendorMonthHistory[]
  allTime: VendorMonthFigures
  period: Period
  onSelect: (period: Period) => void
}

/** Every month this vendor has worked, and the running position across all of them. */
export function VendorHistory({ history, allTime, period, onSelect }: VendorHistoryProps) {
  const t = useT()

  return (
    <Panel
      title={t('accounts.vendorBill.monthByMonth')}
      description={t('accounts.vendorBill.allTime', {
        billed: taka(allTime.totalBill),
        settled: taka(allTime.advance + allTime.paid),
        due: signedTaka(allTime.due),
      })}
    >
      {history.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t('accounts.vendorBill.noMonthYet')}</p>
      ) : (
        <ul className="max-h-[26rem] divide-y overflow-y-auto">
          {history.map((month) => {
            const active = comparePeriods(month, period) === 0
            return (
              <li key={`${month.year}-${month.month}`}>
                <button
                  type="button"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => onSelect({ year: month.year, month: month.month })}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left transition outline-none hover:bg-muted/40 focus-visible:bg-muted/40',
                    active && 'bg-primary/5',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-[13px] font-medium', active && 'text-primary')}>{month.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {month.tripCount} trips · bill {taka(month.totalBill)}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[13px] font-semibold tabular-nums">{signedTaka(month.due)}</span>
                    <VendorBillBadge status={month.status} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
