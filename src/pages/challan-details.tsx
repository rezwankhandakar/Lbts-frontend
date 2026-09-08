import { useCallback, useEffect } from 'react'
import { ArrowLeft, Download, Layers, Pencil, Printer, Trash2, TriangleAlert } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ChallanDetails } from '@/features/challan/components/challan-details'
import { ChallanDetailsSkeleton } from '@/features/challan/components/challan-details-skeleton'
import { ChallanDocumentViewer } from '@/features/challan/components/challan-document-viewer'
import { ChallanPrintMark } from '@/features/challan/components/challan-print-mark'
import { ChallanStatusBadge } from '@/features/challan/components/challan-status-badge'
import { DeleteChallanDialog } from '@/features/challan/components/delete-challan-dialog'
import { useChallanActions } from '@/features/challan/hooks/use-challan-actions'
import { useChallanDocument } from '@/features/challan/hooks/use-challan-document'
import { useChallan } from '@/features/challan/hooks/use-challans'
import { canChangeChallan } from '@/features/challan/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { formatDateTime } from '@/lib/format'
import { printDocument } from '@/lib/print-document'
import { useAuthStore } from '@/stores/use-auth-store'

/**
 * One challan, in full, beside the document that was generated for it.
 *
 * The document is given half the page rather than a thumbnail: the point of
 * this screen is checking the recorded values against the pages and the
 * barcode page that carries them, and that is not something a 200px preview
 * supports.
 */
export function ChallanDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const role = useCurrentRole()
  const currentUserId = useAuthStore((state) => state.profile?.id ?? null)

  const query = useChallan(id)
  const record = query.data ?? null

  /**
   * A deleted record cannot be shown, so this page leaves for the list rather
   * than sitting on a 404 the operator has to navigate out of themselves.
   */
  const actions = useChallanActions({ onDeleted: () => navigate('/challan') })

  const document = useChallanDocument(record?.id ?? null)


  /** Stable, so the `?print=1` effect below does not re-run and cancel itself. */
  const { setPrinted } = actions

  /**
   * Printing means printing the stored document, and it is fetched through
   * axios because the endpoint is authenticated — so it is this page, already
   * holding the blob for the viewer beside it, that can print.
   */
  const print = useCallback(() => {
    if (!document.url || !record) {
      return
    }

    printDocument(document.url, 'application/pdf')
    /**
     * Marked once the document has reached the print dialog, which is the last
     * honest moment: no browser reports whether the paper came out. So this is
     * a claim rather than a measurement, and the row menu can take it back.
     */
    setPrinted(record, true)
  }, [document.url, record, setPrinted])

  /**
   * `?print=1` is how the records list asks this page to print, so there is
   * one print path rather than two. It waits for the *document* rather than
   * for the record: the bytes are what gets printed. The flag is cleared as
   * soon as it is acted on, or a refresh would print again.
   */
  const wantsPrint = searchParams.get('print') === '1'
  const documentUrl = document.url
  const documentError = document.error

  useEffect(() => {
    if (!wantsPrint || !record) {
      return
    }

    if (documentError) {
      setSearchParams({}, { replace: true })
      toast.error('The challan document could not be loaded, so there is nothing to print.')
      return
    }

    // Still fetching. The effect runs again when the object URL arrives.
    if (!documentUrl) {
      return
    }

    setSearchParams({}, { replace: true })
    const timer = window.setTimeout(() => {
      printDocument(documentUrl, 'application/pdf')
      setPrinted(record, true)
    }, 50)
    return () => window.clearTimeout(timer)
  }, [wantsPrint, record, documentUrl, documentError, setSearchParams, setPrinted])

  if (query.isPending) {
    return <ChallanDetailsSkeleton />
  }

  if (query.isError || !record) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <TriangleAlert className="size-5" aria-hidden />
        </div>
        <h1 className="mt-4 text-lg font-semibold tracking-tight">Challan not found</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {query.error?.message ?? 'It may have been deleted, or you may not have access to it.'}
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            Try again
          </Button>
          <Button size="sm" onClick={() => navigate('/challan')}>
            Back to challans
          </Button>
        </div>
      </div>
    )
  }

  const canChange = canChangeChallan(role, record, currentUserId)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="mb-1 -ml-2 text-muted-foreground"
            onClick={() => navigate('/challan')}
          >
            <ArrowLeft data-icon="inline-start" aria-hidden />
            All challans
          </Button>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {record.challanNumber}
            </h1>
            <ChallanStatusBadge status={record.status} />
            <ChallanPrintMark record={record} />
          </div>

          <p className="mt-1.5 text-sm text-muted-foreground">
            SL {record.slNumber} · {record.customerName} · filed{' '}
            {formatDateTime(record.submittedAt)}
            {record.submittedBy ? ` by ${record.submittedBy.name}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => actions.download(record)}>
            <Download data-icon="inline-start" aria-hidden />
            Download
          </Button>

          {/* Disabled until the bytes are here: there is nothing to send to a
              printer while the document is still being fetched. */}
          <Button
            variant="outline"
            size="sm"
            onClick={print}
            disabled={!document.url}
            title={document.url ? undefined : 'Waiting for the document'}
          >
            <Printer data-icon="inline-start" aria-hidden />
            Print
          </Button>

          <Button variant="outline" size="sm" onClick={() => actions.openBatch(record)}>
            <Layers data-icon="inline-start" aria-hidden />
            Batch
          </Button>

          {canChange && (
            <>
              <Button variant="outline" size="sm" onClick={() => actions.edit(record)}>
                <Pencil data-icon="inline-start" aria-hidden />
                Correct
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => actions.openDelete(record)}
              >
                <Trash2 data-icon="inline-start" aria-hidden />
                Delete
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-start">
        {/* The picker is offered to whoever may correct this challan — the
            same rule as every other change here. A viewer who may not still
            sees what the location is, without a button that would only be
            refused. */}
        <ChallanDetails
          record={record}
          onSetLocation={
            canChange
              ? () =>
                  navigate(`/challan/${record.id}/location`, {
                    state: { queue: [record.id], returnTo: `/challan/${record.id}` },
                  })
              : undefined
          }
        />

        <section
          aria-label="Challan document"
          className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm lg:sticky lg:top-0"
        >
          <header className="border-b bg-muted/30 px-4 py-3">
            <h2 className="text-[13px] font-semibold tracking-tight">Generated challan document</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The original challan pages, then the LBTS back page with the barcode.
            </p>
          </header>

          <ChallanDocumentViewer
            url={document.url}
            isLoading={document.isLoading}
            error={document.error}
            onRetry={document.retry}
            onDownload={() => actions.download(record)}
            onPrint={print}
            pageCount={record.document.pageCount}
          />
        </section>
      </div>

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
