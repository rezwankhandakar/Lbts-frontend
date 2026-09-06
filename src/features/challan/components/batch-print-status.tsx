import { Printer, PrinterCheck, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BatchPrintStatusProps {
  challanCount: number
  printedChallanCount: number
  /** True once every challan in the batch is marked. */
  isPrinted: boolean
  /** False for a viewer who may read and print but not write — CEO. */
  canChange: boolean
  isSaving: boolean
  onClear: () => void
  className?: string
}

/**
 * How much of a source file has been printed.
 *
 * The count is the whole point: a batch of fifteen challans printed as one
 * document is fifteen sheets that either did or did not come out, and "12 of
 * 15" is the only sentence that distinguishes an interrupted print run from a
 * finished one. Without it an operator's only way to check is to count the
 * paper.
 *
 * Clearing it is offered wherever the mark is shown, because the mark is a
 * claim rather than a measurement — the browser hands a document to a print
 * dialog and never learns what the printer did with it. Somebody who cancelled
 * the dialog, or whose printer jammed on page three, has to be able to say so.
 */
export function BatchPrintStatus({
  challanCount,
  printedChallanCount,
  isPrinted,
  canChange,
  isSaving,
  onClear,
  className,
}: BatchPrintStatusProps) {
  const none = printedChallanCount === 0

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border px-2.5 py-2',
        isPrinted ? 'border-tone-violet/25 bg-tone-violet/5' : 'bg-muted/30',
        className,
      )}
    >
      {isPrinted ? (
        <PrinterCheck className="size-3.5 shrink-0 text-tone-violet" aria-hidden />
      ) : (
        <Printer className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      )}

      <p className="text-[11px] text-muted-foreground">
        {none ? (
          <>
            <span className="font-medium text-foreground">Not printed yet.</span> Printing the batch
            sends every challan to the printer as one document and marks them here.
          </>
        ) : isPrinted ? (
          <>
            <span className="font-medium text-foreground">
              All {challanCount} {challanCount === 1 ? 'challan is' : 'challans are'} marked as
              printed.
            </span>{' '}
            Printing again is never refused — reprint whenever a copy is needed.
          </>
        ) : (
          <>
            <span className="font-medium text-foreground">
              {printedChallanCount} of {challanCount} printed.
            </span>{' '}
            The rest are still only on file.
          </>
        )}
      </p>

      {canChange && !none && (
        <Button
          variant="ghost"
          size="xs"
          className="ml-auto text-muted-foreground"
          disabled={isSaving}
          onClick={onClear}
        >
          <Undo2 data-icon="inline-start" aria-hidden />
          Clear
        </Button>
      )}
    </div>
  )
}
