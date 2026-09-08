import { ArrowLeft, FileStack, FileUp, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import { formatRanges } from '../lib/challan-meta'
import type { ChallanBatchDetail } from '../types'

interface ResumeBatchPanelProps {
  batch: ChallanBatchDetail
  /** Set when the batch loaded but cannot be continued. */
  problem: string | null
  onStartNew: () => void
}

/**
 * The unfinished source PDF this workspace has been sent back to.
 *
 * It is a set of instructions rather than a summary, because the operator is
 * about to be asked for something the app cannot do for them: find the same
 * file again. The PDF was never stored, so nothing here can reopen it — what
 * this panel can do is say exactly which file is wanted, how many pages it
 * had, and which of them are still nobody's.
 *
 * The pages left are named rather than counted, for the same reason the
 * session panel names them: "pages 1–10 and 12–53" tells somebody where to
 * look, "52 pages" sends them hunting.
 */
export function ResumeBatchPanel({ batch, problem, onStartNew }: ResumeBatchPanelProps) {
  return (
    <section
      aria-label="Batch being continued"
      className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-tone-indigo/10 text-tone-indigo ring-1 ring-tone-indigo/20">
          <FileStack className="size-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Continuing a batch
          </p>
          <h2 className="mt-0.5 truncate text-base font-semibold" title={batch.sourceFileName}>
            {batch.sourceFileName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {batch.challanCount === 1 ? '1 challan' : `${batch.challanCount} challans`} filed ·{' '}
            {batch.assignedPages} of {batch.sourcePageCount} pages accounted for
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Started {formatDateTime(batch.createdAt)}
            {batch.createdBy ? ` by ${batch.createdBy.name}` : ''}
          </p>
        </div>
      </div>

      {problem ? (
        <div className="border-t border-tone-amber/25 bg-tone-amber/5 px-4 py-3.5 sm:px-5">
          <p className="flex items-start gap-2 text-sm leading-snug">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-tone-amber" aria-hidden />
            <span className="text-muted-foreground">{problem}</span>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" render={<Link to={`/challan/batch/${batch.id}`} />}>
              <ArrowLeft data-icon="inline-start" aria-hidden />
              Back to the batch
            </Button>
            <Button variant="outline" size="sm" onClick={onStartNew}>
              <FileUp data-icon="inline-start" aria-hidden />
              Open a different PDF instead
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t bg-muted/30 px-4 py-3.5 sm:px-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">
              Open the same PDF again to carry on.
            </span>{' '}
            It was never stored, so this is the only way back to it — and the challans you file from
            it join this batch rather than starting a new one.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Still to be filed:{' '}
            <span className="font-medium text-foreground">
              {formatRanges(batch.unassignedRanges)}
            </span>
            . Pages already filed are marked in the queue and cannot be claimed twice.
          </p>

          <Button variant="ghost" size="xs" className="mt-2 -ml-2" onClick={onStartNew}>
            Not this file? Start a new batch
          </Button>
        </div>
      )}
    </section>
  )
}

/**
 * The batch named in the URL could not be opened at all.
 *
 * Deleting the last challan out of a file deletes its batch, so a link kept
 * open in a tab from yesterday genuinely can point at nothing.
 */
export function ResumeBatchUnavailable({
  message,
  onStartNew,
}: {
  message: string
  onStartNew: () => void
}) {
  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-md flex-col items-center justify-center text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <TriangleAlert className="size-5" aria-hidden />
      </div>
      <h1 className="mt-4 text-lg font-semibold tracking-tight">That batch could not be opened</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" render={<Link to="/challan" />}>
          <ArrowLeft data-icon="inline-start" aria-hidden />
          All challans
        </Button>
        <Button size="sm" onClick={onStartNew}>
          <FileUp data-icon="inline-start" aria-hidden />
          Open a PDF
        </Button>
      </div>
    </div>
  )
}
