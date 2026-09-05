import { ArrowLeft, Info, TriangleAlert } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChallanDetailsSkeleton } from '@/features/challan/components/challan-details-skeleton'
import { ChallanDocumentViewer } from '@/features/challan/components/challan-document-viewer'
import { ChallanEntryForm } from '@/features/challan/components/challan-entry-form'
import { ChallanStatusBadge } from '@/features/challan/components/challan-status-badge'
import { useChallanDocument } from '@/features/challan/hooks/use-challan-document'
import { useUpdateChallan } from '@/features/challan/hooks/use-challan-mutations'
import { useChallan } from '@/features/challan/hooks/use-challans'
import { toFormValues } from '@/features/challan/schemas/challan-schemas'
import { formatRange } from '@/features/challan/lib/challan-meta'
import { printDocument } from '@/lib/print-document'

/**
 * Correcting a filed challan.
 *
 * Not the entry workspace: there is no source PDF here and there never can be
 * — the WhatsApp file was temporary and is long gone by the time somebody
 * spots a wrong district. What there is instead is the *stored* document, on
 * the right, which holds the original challan pages. That is what a correction
 * is checked against.
 *
 * The page range is not editable, for the same reason. It records which pages
 * of a file that no longer exists these were, and changing the number would
 * not change the pages. A challan filed against the wrong range is deleted and
 * filed again from the source.
 *
 * Saving regenerates the barcode back page and rewrites the stored PDF, which
 * the form says out loud before anything is saved — an operator who does not
 * know that will not know to reprint.
 */
export function ChallanEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const query = useChallan(id)
  const record = query.data ?? null
  const update = useUpdateChallan()
  const document = useChallanDocument(record?.id ?? null)

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
        <p className="mt-1.5 text-sm text-muted-foreground">
          {query.error?.message ?? 'It may have been deleted, or you may not have access to it.'}
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={() => navigate('/challan')}>
          Back to challans
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[100rem]">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 text-muted-foreground"
            onClick={() => navigate(`/challan/${record.id}`)}
          >
            <ArrowLeft data-icon="inline-start" aria-hidden />
            Back to the challan
          </Button>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Correct challan</h1>
            <ChallanStatusBadge status={record.status} />
          </div>

          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
            {record.challanNumber} · SL {record.slNumber} · check every field against the pages
            beside it.
          </p>

          <p className="mt-2 flex max-w-2xl items-start gap-2 rounded-lg border border-tone-amber/25 bg-tone-amber/5 px-3 py-2 text-xs leading-relaxed">
            <Info className="mt-0.5 size-3.5 shrink-0 text-tone-amber" aria-hidden />
            <span>
              <span className="font-semibold">Saving regenerates the document.</span> The back page
              is redrawn from what you save, and the stored PDF is replaced — the SL number,
              challan number and barcode stay the same. Any copy printed before now shows the old
              details, so reprint it if it is already in circulation. The page range (
              {formatRange({
                startPage: record.sourcePageStart,
                endPage: record.sourcePageEnd,
              })}{' '}
              of {record.sourceFileName}) cannot be changed here — the source PDF was never stored.
            </span>
          </p>
        </div>
      </header>

      <div className="grid min-h-0 gap-4 lg:grid-cols-2 lg:items-start xl:gap-6">
        <section
          aria-label="Challan details"
          className="overflow-hidden rounded-xl border bg-card shadow-sm"
        >
          <ChallanEntryForm
            defaultValues={toFormValues(record)}
            isBusy={update.isPending}
            submitLabel="Save and regenerate"
            secondaryAction={{
              label: 'Cancel',
              onClick: () => navigate(`/challan/${record.id}`),
            }}
            onSubmit={(values) =>
              update.mutate(
                { id: record.id, values },
                { onSuccess: () => navigate(`/challan/${record.id}`) },
              )
            }
          />
        </section>

        <section
          aria-label="Stored challan document"
          className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm lg:sticky lg:top-0"
        >
          <header className="border-b bg-muted/30 px-4 py-3">
            <h2 className="text-[13px] font-semibold tracking-tight">The stored document</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The original challan pages. Check the values against these.
            </p>
          </header>

          <ChallanDocumentViewer
            url={document.url}
            isLoading={document.isLoading}
            error={document.error}
            onRetry={document.retry}
            onDownload={() => undefined}
            onPrint={() =>
              document.url ? printDocument(document.url, 'application/pdf') : undefined
            }
            pageCount={record.document.pageCount}
          />
        </section>
      </div>
    </div>
  )
}
