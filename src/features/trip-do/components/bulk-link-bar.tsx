import { Link2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RowSelection } from '../hooks/use-row-selection'
import { bulkLinkProblem } from '../lib/link-target'

interface BulkLinkBarProps {
  selection: RowSelection
  onLink: () => void
}

/**
 * The ticked rows, floating over the bottom of the page.
 *
 * One gate pass line of five refrigerators spread over three challans is the
 * ordinary case, and ticking the three and setting one Trip DO is the way to
 * do it without opening the picker three times. The bar says what is ticked —
 * including rows on another page — and why a mixture of models cannot share
 * one Trip DO, before anybody presses anything.
 */
export function BulkLinkBar({ selection, onLink }: BulkLinkBarProps) {
  if (selection.count === 0) {
    return null
  }

  const problem = bulkLinkProblem(selection.selected)
  const models = [...new Set(selection.selected.map((row) => row.model || row.productName))]

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div
        role="region"
        aria-label="Ticked rows"
        className="pointer-events-auto flex max-w-full animate-in flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border bg-popover px-4 py-2.5 text-popover-foreground shadow-xl ring-1 ring-foreground/5 duration-200 fade-in-0 slide-in-from-bottom-3"
      >
        <span className="flex items-center gap-2 text-[13px]">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">
            {selection.count}
          </span>
          <span>
            <span className="font-semibold">{selection.count === 1 ? 'row' : 'rows'}</span>
            <span className="text-muted-foreground"> · {selection.qty} pcs</span>
          </span>
        </span>

        <span
          className="max-w-[16rem] truncate font-mono text-xs text-muted-foreground"
          title={models.join(', ')}
        >
          {models.join(', ')}
        </span>

        {problem && <span className="max-w-xs text-xs text-tone-amber">{problem}</span>}

        <span className="flex items-center gap-1.5">
          <Button size="sm" onClick={onLink} disabled={Boolean(problem)}>
            <Link2 data-icon="inline-start" aria-hidden />
            Set Trip DO
          </Button>
          <Button variant="ghost" size="sm" onClick={selection.clear}>
            <X data-icon="inline-start" aria-hidden />
            Clear
          </Button>
        </span>
      </div>
    </div>
  )
}
