import { useParams } from 'react-router-dom'
import { LabourBillFormDialog } from '@/features/labour-bill/components/labour-bill-form-dialog'
import { LabourBillHero } from '@/features/labour-bill/components/labour-bill-hero'
import { LabourDriftBanner } from '@/features/labour-bill/components/labour-drift-banner'
import { LabourScanBar } from '@/features/labour-bill/components/labour-scan-bar'
import { LabourSheetPanel } from '@/features/labour-bill/components/labour-sheet-panel'
import { LabourSignedCopyProvider } from '@/features/labour-bill/components/labour-signed-copies-provider'
import { SignedCopiesDialog } from '@/features/labour-bill/components/signed-copies-dialog'
import {
  DeleteLabourBillDialog,
  FinalizeLabourBillDialog,
  RemoveLabourLinesDialog,
  ReopenLabourBillDialog,
} from '@/features/labour-bill/components/labour-bill-confirm-dialogs'
import {
  LabourBillDetailsError,
  LabourBillDetailsSkeleton,
} from '@/features/labour-bill/components/labour-bill-details-states'
import { useLabourBillPage } from '@/features/labour-bill/hooks/use-labour-bill-page'
import { canReviewLabourBill, canWriteLabourBill } from '@/features/labour-bill/types'
import { useBarcodeWedge } from '@/hooks/use-barcode-wedge'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * One labour bill: its month, its figures, and the sheet itself — laid out
 * exactly as the Excel file is, so what somebody checks on screen is what they
 * download.
 *
 * A draft is built from here by scanning challans and typing what their
 * handling cost; a finalized one is read and downloaded, with every cell
 * read-only rather than merely discouraged.
 */
export function LabourBillDetailsPage() {
  const { id = '' } = useParams()
  const role = useCurrentRole()
  const canWrite = canWriteLabourBill(role)
  const canReview = canReviewLabourBill(role)
  const page = useLabourBillPage(id)
  const { query } = page

  const isDraft = query.data?.bill.status === 'Draft'
  const canEdit = Boolean(isDraft && canWrite)

  /**
   * The page-wide scanner. Armed only while this bill can actually take a
   * challan — a scan against a finalized bill, or from an account that may not
   * write, would be a beep followed by a refusal. `useBarcodeWedge` stands down
   * on its own whenever a field has focus or a dialog is open, which is what
   * keeps a scan out of the middle of a labour amount.
   */
  useBarcodeWedge(page.scanner.scan, canEdit && !page.scanner.pending)

  if (query.isPending) {
    return <LabourBillDetailsSkeleton />
  }
  if (query.isError) {
    return (
      <LabourBillDetailsError
        message={query.error.message}
        isRetrying={query.isFetching}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const { bill, groups, drift, pendingLines } = query.data
  const closeUnlessPending = (pending: boolean) => () => !pending && page.closeDialog()

  return (
    <LabourSignedCopyProvider id={bill.id}>
      <div className="mx-auto w-full max-w-[1600px]">
        <LabourBillHero
          bill={bill}
          canWrite={canWrite}
          canReview={canReview}
          isExporting={page.exporter.isExporting}
          isRefreshing={page.pending.refresh}
          onExport={() => page.exporter.download(bill.id)}
          onRefresh={page.refresh}
          onOpen={page.openDialog}
        />

        {canEdit && <LabourScanBar onScan={page.scanner.scan} pending={page.scanner.pending} />}

        <LabourDriftBanner
          drift={drift}
          isDraft={bill.status === 'Draft'}
          canRefresh={canWrite}
          isRefreshing={page.pending.refresh}
          onRefresh={page.refresh}
        />

        <LabourSheetPanel
          bill={bill}
          groups={groups}
          canEdit={canEdit}
          tab={page.tab}
          onTabChange={page.setTab}
          onSave={page.saveCell}
          onRemove={page.askRemove}
        />

        <LabourBillFormDialog
          open={page.dialog === 'edit'}
          onOpenChange={(open) => !open && page.closeDialog()}
          bill={bill}
        />
        <FinalizeLabourBillDialog
          bill={bill}
          pendingLines={pendingLines}
          sections={groups.filter((group) => !group.isPending).length}
          open={page.dialog === 'finalize'}
          isPending={page.pending.finalize}
          onCancel={closeUnlessPending(page.pending.finalize)}
          onConfirm={page.confirmFinalize}
        />
        <ReopenLabourBillDialog
          bill={bill}
          open={page.dialog === 'reopen'}
          isPending={page.pending.reopen}
          onCancel={closeUnlessPending(page.pending.reopen)}
          onConfirm={page.confirmReopen}
        />
        <DeleteLabourBillDialog
          bill={bill}
          open={page.dialog === 'delete'}
          isPending={page.pending.delete}
          onCancel={closeUnlessPending(page.pending.delete)}
          onConfirm={page.confirmDelete}
        />
        <RemoveLabourLinesDialog
          target={page.removing}
          isPending={page.pending.remove}
          onCancel={page.cancelRemove}
          onConfirm={page.confirmRemove}
        />
        <SignedCopiesDialog
          bill={bill}
          open={page.dialog === 'copies'}
          onOpenChange={(open) => !open && page.closeDialog()}
        />
      </div>
    </LabourSignedCopyProvider>
  )
}
