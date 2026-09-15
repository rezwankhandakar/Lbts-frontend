import { PackagePlus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AddTripDoSheet } from '@/features/bill/components/add-trip-do-sheet'
import {
  DeleteBillDialog,
  FinalizeBillDialog,
  RemoveLinesDialog,
  ReopenBillDialog,
} from '@/features/bill/components/bill-confirm-dialogs'
import {
  BillDetailsError,
  BillDetailsSkeleton,
  EmptyBillSheet,
} from '@/features/bill/components/bill-details-states'
import { BillDriftBanner } from '@/features/bill/components/bill-drift-banner'
import { BillFormDialog } from '@/features/bill/components/bill-form-dialog'
import { BillHero } from '@/features/bill/components/bill-hero'
import { BillSheet } from '@/features/bill/components/bill-sheet'
import { useBillPage } from '@/features/bill/hooks/use-bill-page'
import { canReviewBill, canWriteBill } from '@/features/bill/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * One bill: its month and unit, its figures, and the sheet itself — laid out
 * exactly as the Excel file is, so what somebody checks on screen is what they
 * download. A draft is built from here by searching Trip DOs; a finalized bill
 * is read and downloaded.
 */
export function BillDetailsPage() {
  const { id = '' } = useParams()
  const role = useCurrentRole()
  const canWrite = canWriteBill(role)
  const canReview = canReviewBill(role)
  const page = useBillPage(id)
  const { query } = page

  if (query.isPending) {
    return <BillDetailsSkeleton />
  }
  if (query.isError) {
    return (
      <BillDetailsError
        message={query.error.message}
        isRetrying={query.isFetching}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const { bill, lines, drift } = query.data
  const canPrepare = bill.status === 'Draft' && canWrite
  const closeUnlessPending = (pending: boolean) => () => !pending && page.closeDialog()

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <BillHero
        bill={bill}
        canWrite={canWrite}
        canReview={canReview}
        isExporting={page.exporter.isExporting}
        isRefreshing={page.pending.refresh}
        onAdd={() => page.setIsAdding(true)}
        onExport={() => page.exporter.download(bill.id)}
        onRefresh={page.refresh}
        onOpen={page.openDialog}
      />

      <BillDriftBanner
        drift={drift}
        isDraft={bill.status === 'Draft'}
        canRefresh={canWrite}
        isRefreshing={page.pending.refresh}
        onRefresh={page.refresh}
      />

      <section aria-label="Bill sheet" className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">Bill sheet</h2>
            <p className="text-xs text-muted-foreground">
              Exactly what the Excel file carries — one SL per Trip DO, returns and re-sends in Remarks.
            </p>
          </div>
          {lines.length > 0 && canPrepare && (
            <Button size="sm" variant="outline" onClick={() => page.setIsAdding(true)}>
              <PackagePlus data-icon="inline-start" aria-hidden />
              Add Trip DO
            </Button>
          )}
        </div>

        {lines.length === 0 ? (
          <EmptyBillSheet canAdd={canPrepare} onAdd={() => page.setIsAdding(true)} />
        ) : (
          <BillSheet bill={bill} lines={lines} canRemove={canPrepare} onRemove={page.askRemove} />
        )}
      </section>

      {canPrepare && <AddTripDoSheet bill={bill} open={page.isAdding} onOpenChange={page.setIsAdding} />}

      <BillFormDialog
        open={page.dialog === 'edit'}
        onOpenChange={(open) => !open && page.closeDialog()}
        bill={bill}
      />
      <FinalizeBillDialog
        bill={bill}
        open={page.dialog === 'finalize'}
        isPending={page.pending.finalize}
        onCancel={closeUnlessPending(page.pending.finalize)}
        onConfirm={page.confirmFinalize}
      />
      <ReopenBillDialog
        bill={bill}
        open={page.dialog === 'reopen'}
        isPending={page.pending.reopen}
        onCancel={closeUnlessPending(page.pending.reopen)}
        onConfirm={page.confirmReopen}
      />
      <DeleteBillDialog
        bill={bill}
        open={page.dialog === 'delete'}
        isPending={page.pending.delete}
        onCancel={closeUnlessPending(page.pending.delete)}
        onConfirm={page.confirmDelete}
      />
      <RemoveLinesDialog
        target={page.removing}
        isPending={page.pending.remove}
        onCancel={page.cancelRemove}
        onConfirm={page.confirmRemove}
      />
    </div>
  )
}
