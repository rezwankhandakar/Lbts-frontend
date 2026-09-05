import {
  CircleCheck,
  Download,
  FileStack,
  FileX2,
  Loader2,
  TriangleAlert,
  Undo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { formatBytes, formatRange, formatRanges } from '../lib/challan-meta'
import type { ChallanBatchDetail, PageRange } from '../types'
import { ChallanBatchStatusBadge } from './challan-status-badge'

interface BatchSummaryProps {
  batch: ChallanBatchDetail
  isDownloading: boolean
  onDownload: () => void
  /** False for a viewer who may not change this batch — CEO, or a colleague. */
  canChange: boolean
  isSaving: boolean
  onMarkBlank: (range: PageRange) => void
  onClearBlank: () => void
}

/**
 * One source PDF, and how much of it has been turned into challans.
 *
 * The figure that decides everything on this page is the page count, not the
 * challan count: a batch is finished when every page of the file is accounted
 * for, and until then the assembled batch document would be missing whatever
 * nobody got round to. So the download is refused rather than offered with a
 * caveat — a "complete batch" PDF with two challans missing is worse than
 * none, because somebody would print it, file it, and never learn what was not
 * in it.
 *
 * "Accounted for" is deliberately wider than "filed". A WhatsApp file
 * occasionally carries a blank sheet or a cover page, and there is no honest
 * challan to make out of one — so those pages are *marked* rather than filed,
 * and the batch can finish without a junk record carrying a serial and a
 * barcode for a blank page. The marking is listed and reversible, because it
 * is a decision about the source file rather than a way of hiding pages.
 *
 * The source PDF itself is not here to download. It was never stored; what
 * exists is what came out of it.
 */
export function BatchSummary({
  batch,
  isDownloading,
  onDownload,
  canChange,
  isSaving,
  onMarkBlank,
  onClearBlank,
}: BatchSummaryProps) {
  return (
    <section
      aria-label="Batch summary"
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
              batch.isComplete
                ? 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20'
                : 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
            )}
          >
            {batch.isComplete ? (
              <CircleCheck className="size-5" aria-hidden />
            ) : (
              <FileStack className="size-5" aria-hidden />
            )}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-tight" title={batch.sourceFileName}>
                {batch.sourceFileName}
              </h1>
              <ChallanBatchStatusBadge status={batch.status} />
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {batch.sourcePageCount} {batch.sourcePageCount === 1 ? 'page' : 'pages'} ·{' '}
              {batch.challanCount} {batch.challanCount === 1 ? 'challan' : 'challans'} filed
              {batch.sourceFileSize ? ` · ${formatBytes(batch.sourceFileSize)}` : ''}
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Started {formatDateTime(batch.createdAt)}
              {batch.createdBy ? ` by ${batch.createdBy.name}` : ''}
              {batch.completedAt ? ` · completed ${formatDateTime(batch.completedAt)}` : ''}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={onDownload} disabled={!batch.isComplete || isDownloading}>
            {isDownloading ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : (
              <Download data-icon="inline-start" aria-hidden />
            )}
            {isDownloading ? 'Assembling…' : 'Download batch PDF'}
          </Button>
        </div>
      </div>

      <div className="border-t px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">
            {batch.assignedPages} of {batch.sourcePageCount} pages accounted for
          </span>
          <span className="font-semibold tabular-nums">{batch.percent}%</span>
        </div>

        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={batch.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Pages filed as challans"
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-300',
              batch.isComplete ? 'bg-tone-emerald' : 'bg-primary',
            )}
            style={{ width: `${batch.percent}%` }}
          />
        </div>

        {batch.isComplete ? (
          <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-snug text-muted-foreground">
            <CircleCheck className="mt-px size-3.5 shrink-0 text-tone-emerald" aria-hidden />
            <span>
              Every page of this PDF is accounted for. The batch document is each challan's pages
              followed by its LBTS back page, in the order the source file had them.
            </span>
          </p>
        ) : (
          <div className="mt-2.5 rounded-lg border border-tone-amber/25 bg-tone-amber/5 px-2.5 py-2">
            <p className="flex items-start gap-1.5 text-xs leading-snug">
              <TriangleAlert className="mt-px size-3.5 shrink-0 text-tone-amber" aria-hidden />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {batch.unassignedPages} {batch.unassignedPages === 1 ? 'page is' : 'pages are'}{' '}
                  not accounted for
                </span>{' '}
                — {formatRanges(batch.unassignedRanges)}. The batch cannot be downloaded as one
                document until every page is either filed as a challan or marked as blank, because
                the file would be missing them without saying so. The source PDF was never stored,
                so filing them means opening it again in the workspace.
              </span>
            </p>

            {/* The way out for a page that is not a challan and never will be:
                a blank sheet, a cover page, a duplicate. Without it the batch
                could never be completed, and the operator's only option would
                be to file a junk challan — a permanent record with a serial
                and a barcode for a blank page. */}
            {canChange && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-tone-amber/20 pt-2.5">
                <p className="text-[11px] text-muted-foreground">Not challans at all?</p>
                {batch.unassignedRanges.map((range) => (
                  <Button
                    key={`${range.startPage}-${range.endPage}`}
                    variant="outline"
                    size="xs"
                    disabled={isSaving}
                    onClick={() => onMarkBlank(range)}
                  >
                    <FileX2 data-icon="inline-start" aria-hidden />
                    Mark {formatRange(range)} blank
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Always visible once anything is marked, complete or not: a page
            declared blank is a decision somebody made about the source file,
            and it has to be reviewable and undoable rather than invisible. */}
        {batch.skippedPages.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-2">
            <p className="text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">Marked blank:</span>{' '}
              {formatRanges(batch.skippedRanges)} — not filed as challans, and not in the batch
              document.
            </p>
            {canChange && (
              <Button
                variant="ghost"
                size="xs"
                className="ml-auto text-muted-foreground"
                disabled={isSaving}
                onClick={onClearBlank}
              >
                <Undo2 data-icon="inline-start" aria-hidden />
                Undo
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
