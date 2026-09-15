import { Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useBills } from '../hooks/use-bills'
import { periodLabel } from '../lib/bill-meta'

interface SameSlotNoticeProps {
  month: number
  year: number
  unit: string
}

/**
 * Says so when the unit already has a bill for the month being opened. A
 * question rather than a refusal — a part bill for the same month is ordinary —
 * but opening a second one by accident is how a Trip DO ends up looked for on
 * the wrong bill.
 */
export function SameSlotNotice({ month, year, unit }: SameSlotNoticeProps) {
  const settled = useDebouncedValue(unit, 400)
  const query = useBills(
    { page: 1, limit: 5, search: '', year, month, unit: settled, status: 'all' },
    settled.length > 0,
  )
  const existing = query.data?.records ?? []

  if (!settled || existing.length === 0) {
    return null
  }

  return (
    <div className="flex gap-2.5 rounded-lg border border-tone-amber/30 bg-tone-amber/5 p-3 text-xs">
      <Info className="mt-px size-4 shrink-0 text-tone-amber" aria-hidden />
      <div className="min-w-0">
        <p className="font-medium text-foreground">
          {settled} already has {existing.length === 1 ? 'a bill' : `${existing.length} bills`} for{' '}
          {periodLabel(month, year)}
        </p>
        <p className="mt-1 text-muted-foreground">
          You can still open another — a part bill, say.{' '}
          {existing.map((bill, index) => (
            <span key={bill.id}>
              {index > 0 && ', '}
              <Link
                to={`/bills/${bill.id}`}
                className="font-mono text-foreground underline-offset-2 hover:underline"
              >
                {bill.billNumber}
              </Link>
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
