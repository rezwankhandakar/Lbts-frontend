import { CircleCheck, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SessionProgress } from '../lib/challan-session'

interface SessionProgressPanelProps {
  pageCount: number
  progress: SessionProgress
  className?: string
}

/**
 * How far through the source PDF this session has got — a bar, and nothing
 * else that can be done without.
 *
 * The bar is drawn over **pages**, not over queued entries, because pages are
 * the only quantity that cannot be argued with: an operator who has drawn
 * fifteen ranges and filed two of them is two challans in, whatever the queue
 * looks like. It is also the definition the server uses for whether a batch is
 * finished, so the bar here and the batch status there can never disagree.
 *
 * It used to be a card carrying the file name, the counts, the unassigned
 * ranges and a boxed warning, and it sat above a split whose whole purpose is
 * showing a challan page and its form at once — so every line it took came off
 * the page somebody was reading. The file name is in the PDF panel's own
 * header, the unassigned pages are coloured in the page strip under the
 * viewer, and the counts are the queue. All of it was said twice.
 *
 * What survives is the bar, the page count beside it, and the one thing
 * nothing else on screen says: that a queued challan is not a saved one.
 */
export function SessionProgressPanel({
  pageCount,
  progress,
  className,
}: SessionProgressPanelProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <div
        className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Pages filed as challans"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300',
            progress.isComplete ? 'bg-tone-emerald' : 'bg-primary',
          )}
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      {progress.isComplete ? (
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-tone-emerald">
          <CircleCheck className="size-3.5" aria-hidden />
          Complete
        </span>
      ) : (
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {progress.assignedPages}/{pageCount} pages
        </span>
      )}

      {/* The one thing an operator has to be told before they close the tab:
          a queued challan is not a saved one. Short enough to sit in the same
          row as the bar, and the whole sentence is still on it. */}
      {progress.pending > 0 && (
        <span
          className="flex shrink-0 items-center gap-1 text-xs text-tone-amber"
          title={`${progress.pending} ${
            progress.pending === 1 ? 'challan is' : 'challans are'
          } still only in this browser. Nothing is saved until you file each one, and closing this page loses what has not been filed.`}
        >
          <TriangleAlert className="size-3.5" aria-hidden />
          {progress.pending} not filed
        </span>
      )}
    </div>
  )
}
