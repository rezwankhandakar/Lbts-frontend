import { PieChart } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { taka } from '../lib/accounts-meta'
import type { ProfitLossReport } from '../types'

interface ExpenseBreakdownProps {
  report: ProfitLossReport | undefined
  /** The expense name the list is filtered to, or empty. */
  selectedName: string
  onSelect: (name: string) => void
}

/**
 * Where a month's office money went, by the name each expense was recorded
 * under, largest first. One measure, so one hue, with the names carrying
 * identity. Pressing a row filters the list beside it to that name; pressing
 * it again clears the filter.
 */
export function ExpenseBreakdown({ report, selectedName, onSelect }: ExpenseBreakdownProps) {
  const t = useT()

  if (!report) {
    return <Skeleton className="h-64 rounded-xl" />
  }

  const rows = report.expenseByName
  const largest = Math.max(1, ...rows.map((row) => row.amount))

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <PieChart className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{t('accounts.expense.noneThisMonth')}</p>
      </div>
    )
  }

  return (
    <ul className="grid gap-1 p-2 sm:p-3">
      {rows.map((row) => {
        const selected = Boolean(selectedName) && (row.name ?? '').toLowerCase() === selectedName.toLowerCase()
        return (
          <li key={row.name}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(selected ? '' : row.name)}
              className={cn(
                'grid w-full gap-1.5 rounded-lg px-2.5 py-2 text-left transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                selected ? 'bg-primary/10' : 'hover:bg-muted/60',
              )}
            >
              <span className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="truncate font-medium">{row.name}</span>
                <span className="shrink-0 tabular-nums">
                  {taka(row.amount)} <span className="text-xs text-muted-foreground">· {row.share}%</span>
                </span>
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-viz-1" style={{ width: `${(row.amount / largest) * 100}%` }} />
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
