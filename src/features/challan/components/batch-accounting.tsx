import { CircleCheck, FileX2, TriangleAlert, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRange, formatRanges } from '../lib/challan-meta'
import type { ChallanBatchDetail, PageRange } from '../types'

interface BatchAccountingProps {
  batch: ChallanBatchDetail
  /** False for a viewer who may not change this batch — CEO, or a colleague. */
  canChange: boolean
  isSaving: boolean
  onMarkBlank: (range: PageRange) => void
  onClearBlank: () => void
}

/**
 * Whether every page of the source PDF has been dealt with, and what to do
 * about the ones that have not.
 *
 * The figure that decides everything here is the page count, not the challan
 * count: a batch is finished when every page of the file is accounted for, and
 * until then an assembled batch document would be missing whatever nobody got
 * round to. So the batch cannot be printed or downloaded as one file — a
 * "complete batch" PDF with two challans missing is worse than none, because
 * somebody would print it, file it, and never learn what was not in it.
 *
 * "Accounted for" is deliberately wider than "filed". A WhatsApp file
 * occasionally carries a blank sheet or a cover page, and there is no honest
 * challan to make out of one — so those pages are *marked* rather than filed,
 * and the batch can finish without a junk record carrying a serial and a
 * barcode for a blank page. The marking is listed and reversible, because it
 * is a decision about the source file rather than a way of hiding pages.
 */
export function BatchAccounting({
  batch,
  canChange,
  isSaving,
  onMarkBlank,
  onClearBlank,
}: BatchAccountingProps) {
  return (
    <>
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
                {batch.unassignedPages} {batch.unassignedPages === 1 ? 'page is' : 'pages are'} not
                accounted for
              </span>{' '}
              — {formatRanges(batch.unassignedRanges)}. The batch cannot be printed or downloaded as
              one document until every page is either filed as a challan or marked as blank, because
              the file would be missing them without saying so. The source PDF was never stored, so
              filing them means opening it again in the workspace.
            </span>
          </p>

          {/* The way out for a page that is not a challan and never will be:
              a blank sheet, a cover page, a duplicate. Without it the batch
              could never be completed, and the operator's only option would
              be to file a junk challan, with a serial and a barcode, for a
              blank page. */}
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
    </>
  )
}
