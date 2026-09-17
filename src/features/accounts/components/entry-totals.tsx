import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { signedTaka, taka } from '../lib/accounts-meta'
import type { EntryListTotals } from '../types'

/**
 * What the filtered entries add up to. When the list is one wallet's whole
 * statement, it also opens and closes with that wallet's balance — the shape
 * of a cash book somebody reconciles against the box or the bank.
 */
export function EntryTotals({ totals }: { totals: EntryListTotals | undefined }) {
  if (!totals) {
    return <Skeleton className="h-10 w-full rounded-lg" />
  }

  const figures = [
    ...(totals.openingBalance !== null ? [{ label: 'Opening', value: signedTaka(totals.openingBalance), className: '' }] : []),
    { label: 'Money in', value: taka(totals.moneyIn), className: 'text-tone-emerald' },
    { label: 'Money out', value: taka(totals.moneyOut), className: 'text-tone-rose' },
    totals.closingBalance !== null
      ? { label: 'Closing', value: signedTaka(totals.closingBalance), className: 'font-semibold' }
      : { label: 'Net', value: signedTaka(totals.moneyIn - totals.moneyOut), className: 'font-semibold' },
  ]

  return (
    <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <div className="text-xs text-muted-foreground">
        {totals.total.toLocaleString()} {totals.total === 1 ? 'entry' : 'entries'}
      </div>
      {figures.map((figure) => (
        <div key={figure.label} className="flex items-baseline gap-1.5">
          <dt className="text-xs text-muted-foreground">{figure.label}</dt>
          <dd className={cn('tabular-nums', figure.className)}>{figure.value}</dd>
        </div>
      ))}
    </dl>
  )
}
