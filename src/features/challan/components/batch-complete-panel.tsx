import { CircleCheck, Download, Loader2, Printer, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useBatchDownload, useBatchPrint } from '../hooks/use-challan-actions'
import { useBatchPrinted } from '../hooks/use-challan-mutations'
import { useChallanBatch } from '../hooks/use-challans'
import { BatchPrintStatus } from './batch-print-status'

interface BatchCompletePanelProps {
  /** Known only once one challan has been filed: a batch exists from then. */
  batchId: string
  /** False for a viewer who may read and print but not write — CEO. */
  canChange: boolean
}

/**
 * The end of a source file, in the workspace.
 *
 * An operator who has just filed the last challan out of a WhatsApp PDF is
 * holding the one thing the whole session was for: a set of challans that now
 * have to be printed and handed over. Making them leave for the batch page to
 * do it would be a navigation away from a workspace still holding the source
 * PDF in memory — so the two actions the batch page offers are offered here,
 * at the moment they are wanted.
 *
 * It reads the batch from the server rather than trusting the session's own
 * progress. The session knows what *it* filed; only the collection knows about
 * a challan filed out of this same file yesterday, before a crash. Whether the
 * batch can be printed as one document is the server's answer, and asking it
 * is what stops this panel from offering a button that would be refused.
 */
export function BatchCompletePanel({ batchId, canChange }: BatchCompletePanelProps) {
  const query = useChallanBatch(batchId)
  const batch = query.data ?? null

  const print = useBatchPrint()
  const download = useBatchDownload()
  const printed = useBatchPrinted()

  if (query.isPending) {
    return <Skeleton className="h-28 rounded-xl" />
  }

  // A batch that cannot be read is not worth an error here: the challans are
  // filed and safe, and the batch page says so properly.
  if (!batch) {
    return null
  }

  const busy = print.isPrinting || download.isDownloading

  return (
    <section aria-label="Batch actions" className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${
              batch.isComplete
                ? 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20'
                : 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20'
            }`}
          >
            {batch.isComplete ? (
              <CircleCheck className="size-4" aria-hidden />
            ) : (
              <TriangleAlert className="size-4" aria-hidden />
            )}
          </span>

          <div className="min-w-0">
            <p className="text-[13px] font-semibold">
              {batch.isComplete
                ? `All ${batch.challanCount} ${batch.challanCount === 1 ? 'challan' : 'challans'} from this PDF are filed`
                : 'This PDF is not finished yet'}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              {batch.isComplete ? (
                <>
                  They can be printed as one document — each challan's pages followed by its LBTS
                  back page, in the order the source file had them.
                </>
              ) : (
                <>
                  {batch.unassignedPages} {batch.unassignedPages === 1 ? 'page is' : 'pages are'}{' '}
                  neither filed nor marked blank, so the set cannot be printed as one document yet.
                </>
              )}{' '}
              <Link
                to={`/challan/batch/${batch.id}`}
                className="font-medium text-foreground underline underline-offset-2"
              >
                Open the batch
              </Link>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => print.print(batch.id)}
            disabled={!batch.isComplete || busy}
          >
            {print.isPrinting ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : (
              <Printer data-icon="inline-start" aria-hidden />
            )}
            {print.isPrinting ? 'Assembling…' : 'Print all challans'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => download.download(batch.id)}
            disabled={!batch.isComplete || busy}
          >
            {download.isDownloading ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : (
              <Download data-icon="inline-start" aria-hidden />
            )}
            Download
          </Button>
        </div>
      </div>

      {batch.challanCount > 0 && (
        <BatchPrintStatus
          className="mt-3"
          challanCount={batch.challanCount}
          printedChallanCount={batch.printedChallanCount}
          isPrinted={batch.isPrinted}
          canChange={canChange}
          isSaving={printed.isPending}
          onClear={() => printed.mutate({ batchId: batch.id, printed: false })}
        />
      )}
    </section>
  )
}
