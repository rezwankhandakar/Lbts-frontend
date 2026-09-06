import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BatchSummary } from '@/features/challan/components/batch-summary'
import { ChallanDirectory } from '@/features/challan/components/challan-directory'
import { DeleteChallanDialog } from '@/features/challan/components/delete-challan-dialog'
import {
  useBatchDownload,
  useBatchPrint,
  useChallanActions,
} from '@/features/challan/hooks/use-challan-actions'
import {
  useBatchPrinted,
  useBatchSkippedPages,
} from '@/features/challan/hooks/use-challan-mutations'
import { useChallanBatch } from '@/features/challan/hooks/use-challans'
import { canManageAnyChallan, canWriteChallans } from '@/features/challan/types'
import type { PageRange } from '@/features/challan/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/use-auth-store'

/**
 * One source PDF, and the challans cut out of it.
 *
 * This page exists because the source file does not survive the session. An
 * operator who filed eight of fifteen challans and closed the tab has no other
 * way to find out which file still has pages outstanding, or to assemble the
 * ones they did file — the batch record is the durable trace of a document
 * that was deliberately never stored.
 *
 * The challans are listed in the order the source PDF had them rather than by
 * when they were filed, because that is the order somebody assembling the
 * printouts is working in.
 *
 * It is also where a page that is not a challan gets dealt with. A WhatsApp
 * file occasionally carries a blank sheet, and marking it here is what lets
 * the batch finish — the alternative would be filing a junk challan, with a
 * serial and a barcode, for a blank page.
 */

/** Every page number a range covers, which is what the API stores. */
function pagesIn(range: PageRange): number[] {
  return Array.from(
    { length: range.endPage - range.startPage + 1 },
    (_, index) => range.startPage + index,
  )
}

export function ChallanBatchPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()

  const role = useCurrentRole()
  const currentUserId = useAuthStore((state) => state.profile?.id ?? null)

  const query = useChallanBatch(batchId)
  const batch = query.data ?? null
  const actions = useChallanActions()
  const download = useBatchDownload()
  const print = useBatchPrint()
  const skipped = useBatchSkippedPages()
  const printed = useBatchPrinted()

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-4" aria-busy="true">
        <span className="sr-only">Loading batch</span>
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (query.isError || !batch) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <TriangleAlert className="size-5" aria-hidden />
        </div>
        <h1 className="mt-4 text-lg font-semibold tracking-tight">Batch not found</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {query.error?.message ??
            'It may have been removed when its last challan was deleted, or you may not have access to it.'}
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={() => navigate('/challan')}>
          Back to challans
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-3 -ml-2 text-muted-foreground"
        onClick={() => navigate('/challan')}
      >
        <ArrowLeft data-icon="inline-start" aria-hidden />
        All challans
      </Button>

      <BatchSummary
        batch={batch}
        isDownloading={download.isDownloading}
        onDownload={() => download.download(batch.id)}
        /**
         * Printing assembles the same document Download hands over and sends
         * it to the printer, then marks the batch — because the reason
         * fifteen challans were filed out of one file is that fifteen sheets
         * have to end up on the counter, and doing that a record at a time is
         * fifteen dialogs with nothing afterwards to say which was missed.
         */
        isPrinting={print.isPrinting}
        onPrint={() => print.print(batch.id)}
        /**
         * The same rule the API applies: the operator who worked through this
         * file, and the two roles that manage anybody's work. A statement that
         * page 7 is blank is about a file only one person ever had, so
         * somebody else declaring it would be guessing.
         */
        canChange={
          canWriteChallans(role) &&
          (canManageAnyChallan(role) || batch.createdBy?.id === currentUserId)
        }
        isSaving={skipped.isPending || printed.isPending}
        onMarkBlank={(range) =>
          skipped.mutate({
            batchId: batch.id,
            // The whole list every time, so the server has one shape to apply
            // and undo is the same call with a page removed.
            pages: [...batch.skippedPages, ...pagesIn(range)],
          })
        }
        onClearBlank={() => skipped.mutate({ batchId: batch.id, pages: [] })}
        /**
         * A print mark is a claim about what came out of a printer, not a
         * measurement — the browser never learns whether the dialog ended in
         * Print or Cancel. Somebody whose printer jammed on the third challan
         * has to be able to say so.
         */
        onClearPrinted={() => printed.mutate({ batchId: batch.id, printed: false })}
      />

      <section
        aria-label="Challans in this batch"
        className="mt-4 overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <header className="border-b bg-muted/30 px-4 py-3">
          <h2 className="text-[13px] font-semibold tracking-tight">
            Challans from this PDF
            <span className="ml-2 font-normal text-muted-foreground">{batch.challanCount}</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            In the order the source file had them, not the order they were filed.
          </p>
        </header>

        <ChallanDirectory
          records={batch.challans}
          isLoading={false}
          isFetching={query.isFetching}
          isError={false}
          errorMessage=""
          isFiltered={false}
          onRetry={() => void query.refetch()}
          onReset={() => undefined}
          onOpen={actions.open}
          actions={{
            role,
            currentUserId,
            onOpen: actions.open,
            onEdit: actions.edit,
            onDownload: actions.download,
            onPrint: actions.print,
            onSetPrinted: actions.setPrinted,
            canMarkPrinted: actions.canMarkPrinted,
            onOpenBatch: actions.openBatch,
            onDelete: actions.openDelete,
          }}
        />
      </section>

      <DeleteChallanDialog
        record={actions.target}
        open={actions.isConfirmingDelete}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmDelete}
      />
    </div>
  )
}
