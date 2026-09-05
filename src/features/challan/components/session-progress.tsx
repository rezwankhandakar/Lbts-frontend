import { CircleCheck, FileText, Layers, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRanges } from '../lib/challan-meta'
import type { SessionProgress } from '../lib/challan-session'

interface SessionProgressPanelProps {
  fileName: string
  pageCount: number
  progress: SessionProgress
  className?: string
}

/**
 * How far through the source PDF this session has got.
 *
 * The bar is drawn over **pages**, not over queued entries, because pages are
 * the only quantity that cannot be argued with: an operator who has drawn
 * fifteen ranges and filed two of them is two challans in, whatever the queue
 * looks like. It is also the definition the server uses for whether a batch is
 * finished, so the bar here and the batch status there can never disagree.
 *
 * The unassigned pages are named rather than merely counted. "Three pages
 * left" sends somebody hunting; "pages 12–14 are unassigned" tells them where
 * to look.
 */
export function SessionProgressPanel({
  fileName,
  pageCount,
  progress,
  className,
}: SessionProgressPanelProps) {
  return (
    <section
      aria-label="Batch progress"
      className={cn('rounded-xl border bg-card p-4 shadow-sm', className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-indigo/10 text-tone-indigo ring-1 ring-tone-indigo/20">
            <Layers className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold" title={fileName}>
              {fileName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {pageCount} {pageCount === 1 ? 'page' : 'pages'} · {progress.submitted} filed ·{' '}
              {progress.pending} in the queue
            </p>
          </div>
        </div>

        {progress.isComplete ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-tone-emerald/25 bg-tone-emerald/10 px-2 py-0.5 text-xs font-semibold text-tone-emerald">
            <CircleCheck className="size-3.5" aria-hidden />
            Complete
          </span>
        ) : (
          <span className="shrink-0 text-sm font-semibold tabular-nums">{progress.percent}%</span>
        )}
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
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

      <p className="mt-2 flex items-start gap-1.5 text-xs leading-snug text-muted-foreground">
        {progress.isComplete ? (
          <>
            <CircleCheck className="mt-px size-3.5 shrink-0 text-tone-emerald" aria-hidden />
            <span>
              Every page of this PDF belongs to a filed challan. The batch can be downloaded as one
              document.
            </span>
          </>
        ) : (
          <>
            <FileText className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>
              {progress.assignedPages} of {pageCount} pages filed. Still unassigned:{' '}
              <span className="font-medium text-foreground">
                {formatRanges(progress.unassigned)}
              </span>
              .
            </span>
          </>
        )}
      </p>

      {/* The one thing an operator has to be told before they close the tab:
          a queued challan is not a saved one. */}
      {progress.pending > 0 && (
        <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-tone-amber/25 bg-tone-amber/5 px-2.5 py-2 text-xs leading-snug">
          <TriangleAlert className="mt-px size-3.5 shrink-0 text-tone-amber" aria-hidden />
          <span className="text-muted-foreground">
            {progress.pending} {progress.pending === 1 ? 'challan is' : 'challans are'} still only
            in this browser. Nothing is saved until you file each one, and closing this page loses
            what has not been filed.
          </span>
        </p>
      )}
    </section>
  )
}
