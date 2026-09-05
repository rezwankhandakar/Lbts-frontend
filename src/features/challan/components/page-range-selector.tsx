import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formatRange } from '../lib/challan-meta'
import type { RangeProblem } from '../lib/page-ranges'
import type { ChallanEntry } from '../lib/challan-session'
import type { PageRange } from '../types'

interface PageRangeSelectorProps {
  entry: ChallanEntry
  entries: ChallanEntry[]
  sourcePageCount: number
  problem: RangeProblem | null
  onChange: (range: PageRange) => void
  /** Moves the viewer, so clicking a page in the strip also shows it. */
  onPreviewPage: (page: number) => void
  disabled?: boolean
}

type PageState = 'current' | 'filed' | 'other' | 'free'

const PAGE_STYLES: Record<PageState, string> = {
  current: 'bg-primary text-primary-foreground ring-primary shadow-sm',
  filed: 'bg-tone-emerald/15 text-tone-emerald ring-tone-emerald/30',
  other: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/30',
  free: 'bg-card text-muted-foreground ring-border hover:ring-primary/40 hover:text-foreground',
}

/**
 * Which challan this page belongs to.
 *
 * Order matters: the range being edited wins over everything, because that is
 * what the operator is looking at. A page inside a filed challan is shown as
 * taken and cannot be reached; a page inside another queued challan is shown
 * as spoken for but is still clickable, since the operator may be about to
 * redraw both.
 */
function stateOf(page: number, entry: ChallanEntry, entries: ChallanEntry[]): PageState {
  if (page >= entry.startPage && page <= entry.endPage) {
    return 'current'
  }

  for (const other of entries) {
    if (other.id === entry.id || page < other.startPage || page > other.endPage) {
      continue
    }
    return other.status === 'submitted' ? 'filed' : 'other'
  }

  return 'free'
}

/**
 * Where this challan starts and ends inside the source PDF.
 *
 * The page strip is the control that matters. A pair of number inputs alone
 * would work and would be miserable: an operator flicking through a 24-page
 * file needs to see at a glance which pages are already spoken for and which
 * are still loose, and typing "3" then "4" tells them nothing about page 5.
 * So every page of the file is a chip, coloured by what owns it, and the
 * numbers stay for the case where somebody already knows the answer.
 *
 * Clicking sets the start; clicking again sets the end. That is two clicks for
 * a two-page challan and two clicks for a nine-page one, which is the whole
 * reason it is not a drag — a drag across 24 chips on a laptop trackpad is
 * slower and easier to get wrong.
 */
export function PageRangeSelector({
  entry,
  entries,
  sourcePageCount,
  problem,
  onChange,
  onPreviewPage,
  disabled,
}: PageRangeSelectorProps) {
  /** Set after the first click, cleared by the second. */
  const [anchor, setAnchor] = useState<number | null>(null)

  const isFiled = entry.status === 'submitted'
  const locked = disabled || isFiled

  const pick = (page: number) => {
    onPreviewPage(page)

    if (locked) {
      return
    }

    if (anchor === null) {
      setAnchor(page)
      onChange({ startPage: page, endPage: page })
      return
    }

    onChange({ startPage: Math.min(anchor, page), endPage: Math.max(anchor, page) })
    setAnchor(null)
  }

  const setBound = (bound: 'startPage' | 'endPage', raw: string) => {
    const value = Number.parseInt(raw, 10)
    if (!Number.isInteger(value) || value < 1 || value > sourcePageCount) {
      return
    }

    // Typing a start past the end moves both, rather than producing a range
    // that momentarily runs backwards and lights up an error.
    const next =
      bound === 'startPage'
        ? { startPage: value, endPage: Math.max(value, entry.endPage) }
        : { startPage: Math.min(entry.startPage, value), endPage: value }

    onChange(next)
    setAnchor(null)
    onPreviewPage(next.startPage)
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="range-start" className="text-xs text-muted-foreground">
              First page
            </Label>
            <Input
              id="range-start"
              type="number"
              min={1}
              max={sourcePageCount}
              value={entry.startPage}
              disabled={locked}
              onChange={(event) => setBound('startPage', event.target.value)}
              className="h-8 w-20 text-center tabular-nums"
            />
          </div>

          <span className="pb-2 text-xs text-muted-foreground">to</span>

          <div className="space-y-1">
            <Label htmlFor="range-end" className="text-xs text-muted-foreground">
              Last page
            </Label>
            <Input
              id="range-end"
              type="number"
              min={1}
              max={sourcePageCount}
              value={entry.endPage}
              disabled={locked}
              onChange={(event) => setBound('endPage', event.target.value)}
              className="h-8 w-20 text-center tabular-nums"
            />
          </div>
        </div>

        <p className="pb-1 text-xs text-muted-foreground" aria-live="polite">
          {isFiled
            ? `Filed as ${entry.challanNumber}`
            : anchor !== null
              ? `Started at page ${anchor} — click the last page of this challan`
              : `This challan is ${formatRange(entry)}`}
        </p>
      </div>

      <div
        role="group"
        aria-label="Pages of the source PDF"
        className="flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-2"
      >
        {Array.from({ length: sourcePageCount }, (_, index) => index + 1).map((page) => {
          const state = stateOf(page, entry, entries)

          return (
            <button
              key={page}
              type="button"
              onClick={() => pick(page)}
              disabled={state === 'filed' && !locked ? true : undefined}
              aria-pressed={state === 'current'}
              title={
                state === 'filed'
                  ? 'Already filed as a challan'
                  : state === 'other'
                    ? 'Belongs to another challan in this queue'
                    : `Page ${page}`
              }
              className={cn(
                'h-7 min-w-7 rounded-md px-1.5 text-xs font-medium tabular-nums ring-1 transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70',
                PAGE_STYLES[state],
              )}
            >
              {page}
            </button>
          )
        })}
      </div>

      {problem && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-xs leading-snug text-destructive"
        >
          <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>{problem.message}</span>
        </p>
      )}

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <Legend className="bg-primary" label="This challan" />
        <Legend className="bg-tone-amber/60" label="Queued" />
        <Legend className="bg-tone-emerald/60" label="Filed" />
        <Legend className="bg-border" label="Unassigned" />
      </p>
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('size-2 rounded-sm', className)} aria-hidden />
      {label}
    </span>
  )
}
