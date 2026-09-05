import { useCallback, useEffect } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Download,
  Pencil,
  Printer,
  Trash2,
  TriangleAlert,
  Undo2,
} from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DeleteGatePassDialog } from '@/features/gate-pass/components/delete-gate-pass-dialog'
import { GatePassDetails } from '@/features/gate-pass/components/gate-pass-details'
import { GatePassDetailsSkeleton } from '@/features/gate-pass/components/gate-pass-details-skeleton'
import { GatePassDocumentViewer } from '@/features/gate-pass/components/gate-pass-document-viewer'
import { GatePassStatusBadge } from '@/features/gate-pass/components/gate-pass-status-badge'
import { ReviewDialog } from '@/features/gate-pass/components/review-dialog'
import { useGatePassActions } from '@/features/gate-pass/hooks/use-gate-pass-actions'
import { useGatePassDocument } from '@/features/gate-pass/hooks/use-gate-pass-document'
import { useGatePass } from '@/features/gate-pass/hooks/use-gate-passes'
import { printDocument } from '@/lib/print-document'
import { canChangeGatePass, canReviewGatePasses } from '@/features/gate-pass/types'
import { formatDateTime } from '@/lib/format'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useAuthStore } from '@/stores/use-auth-store'

/**
 * One gate pass, in full, beside the document it was taken from.
 *
 * The scan is given half the page rather than a thumbnail: the whole point of
 * this screen is checking the recorded values against the paper, and that is
 * not something a 200px preview supports.
 */
export function GatePassDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const role = useCurrentRole()
  const currentUserId = useAuthStore((state) => state.profile?.id ?? null)

  const query = useGatePass(id)
  const record = query.data ?? null
  /**
   * A deleted record cannot be shown, so this page leaves for the list rather
   * than sitting on a 404 the operator has to navigate out of themselves.
   */
  const actions = useGatePassActions({ onDeleted: () => navigate('/gate-pass') })

  // Not named `document`: that would shadow the global one this file needs.
  const scan = useGatePassDocument(record?.id ?? null, Boolean(record?.document))

  /**
   * Printing means printing the scan, and the scan is fetched through axios
   * because the endpoint is authenticated — so it is this page, holding the
   * blob for the viewer beside it, that can print. Nothing else needs a copy.
   */
  const print = useCallback(() => {
    if (!record?.document || !scan.url) {
      return
    }
    printDocument(scan.url, record.document.mimeType)
  }, [record, scan.url])

  /**
   * `?print=1` is how the records list asks this page to print, so there is
   * one print path rather than two. It has to wait for the scan rather than
   * for the record: the bytes are what gets printed. The flag is cleared as
   * soon as it is acted on, or a refresh would print again.
   */
  const wantsPrint = searchParams.get('print') === '1'
  const scanUrl = scan.url
  const scanError = scan.error

  useEffect(() => {
    if (!wantsPrint || !record) {
      return
    }

    const scanned = record.document

    if (!scanned) {
      setSearchParams({}, { replace: true })
      toast.error('This gate pass has no scanned document to print.')
      return
    }

    if (scanError) {
      setSearchParams({}, { replace: true })
      toast.error('The scan could not be loaded, so there is nothing to print.')
      return
    }

    // Still fetching. The effect runs again when the object URL arrives.
    if (!scanUrl) {
      return
    }

    setSearchParams({}, { replace: true })
    const timer = window.setTimeout(() => printDocument(scanUrl, scanned.mimeType), 50)
    return () => window.clearTimeout(timer)
  }, [wantsPrint, record, scanUrl, scanError, setSearchParams])

  if (query.isPending) {
    return <GatePassDetailsSkeleton />
  }

  if (query.isError || !record) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <TriangleAlert className="size-5" aria-hidden />
        </div>
        <h1 className="mt-4 text-lg font-semibold tracking-tight">Gate pass not found</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {query.error?.message ?? 'It may have been deleted, or you may not have access to it.'}
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            Try again
          </Button>
          <Button size="sm" onClick={() => navigate('/gate-pass')}>
            Back to gate passes
          </Button>
        </div>
      </div>
    )
  }

  const canReview = canReviewGatePasses(role)
  /**
   * Correcting and deleting run on one rule in every status — see
   * `canChangeGatePass`. A verified record can still be corrected; the
   * workspace says what that costs before anything is saved.
   */
  const canChange = canChangeGatePass(role, record, currentUserId)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 text-muted-foreground"
            onClick={() => navigate('/gate-pass')}
          >
            <ArrowLeft data-icon="inline-start" aria-hidden />
            All gate passes
          </Button>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {record.gatePassId}
            </h1>
            <GatePassStatusBadge status={record.status} />
          </div>

          <p className="mt-1.5 text-sm text-muted-foreground">
            {record.customerName} · created {formatDateTime(record.createdAt)}
            {record.createdBy ? ` by ${record.createdBy.name}` : ''}
          </p>

          {record.statusNote && (
            <p className="mt-2 max-w-2xl rounded-lg border border-tone-rose/25 bg-tone-rose/5 px-3 py-2 text-xs leading-relaxed text-pretty">
              <span className="font-semibold">Note from the reviewer:</span> {record.statusNote}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {record.document && (
            <>
              <Button variant="outline" size="sm" onClick={() => actions.download(record)}>
                <Download data-icon="inline-start" aria-hidden />
                Download
              </Button>
              {/* Disabled until the bytes are here: there is nothing to send
                  to a printer while the scan is still being fetched. */}
              <Button
                variant="outline"
                size="sm"
                onClick={print}
                disabled={!scan.url}
                title={scan.url ? undefined : 'Waiting for the scan'}
              >
                <Printer data-icon="inline-start" aria-hidden />
                Print
              </Button>
            </>
          )}

          {canChange && (
            <Button variant="outline" size="sm" onClick={() => actions.edit(record)}>
              <Pencil data-icon="inline-start" aria-hidden />
              Edit
            </Button>
          )}

          {canReview && record.status === 'Submitted' && (
            <>
              <Button size="sm" onClick={() => actions.openReview(record, 'Verified')}>
                <BadgeCheck data-icon="inline-start" aria-hidden />
                Verify
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => actions.openReview(record, 'Rejected')}
              >
                <Undo2 data-icon="inline-start" aria-hidden />
                Send back
              </Button>
            </>
          )}

          {canChange && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => actions.openDelete(record)}
            >
              <Trash2 data-icon="inline-start" aria-hidden />
              Delete
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-start">
        <GatePassDetails record={record} />

        <section
          aria-label="Scanned document"
          className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm lg:sticky lg:top-0"
        >
          <header className="border-b bg-muted/30 px-4 py-3">
            <h2 className="text-[13px] font-semibold tracking-tight">Scanned gate pass</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The original hard copy, as it was scanned.
            </p>
          </header>

          <GatePassDocumentViewer
            url={scan.url}
            mimeType={record.document?.mimeType ?? null}
            pageCount={record.document?.pageCount ?? null}
            isLoading={scan.isLoading}
            error={scan.error}
            onRetry={scan.retry}
            emptyMessage="This gate pass has no scanned document."
            emptyAction={
              canChange ? (
                <Button size="sm" onClick={() => actions.edit(record)}>
                  Scan it now
                </Button>
              ) : undefined
            }
            onDownload={() => actions.download(record)}
          />
        </section>
      </div>

      <ReviewDialog
        record={actions.target}
        decision={actions.decision}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmReview}
      />

      <DeleteGatePassDialog
        record={actions.target}
        open={actions.isConfirmingDelete}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmDelete}
      />
    </div>
  )
}
