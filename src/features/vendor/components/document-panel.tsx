import { useCallback, useState } from 'react'
import { FileText, Plus, Search, X } from 'lucide-react'
import { ListPagination } from '@/components/shared/list-pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  useAssignableDrivers,
  useAssignableVehicles,
  useCreateDocument,
  useDeleteDocument,
  useDocuments,
  useUpdateDocument,
} from '../hooks/use-fleet'
import { useDocumentFile } from '../hooks/use-document-file'
import { useDocumentListParams } from '../hooks/use-list-params'
import { DOCUMENT_STATUS_META } from '../lib/vendor-meta'
import type { DocumentFormValues } from '../schemas/vendor-schemas'
import { DOCUMENT_STATUSES, DOCUMENT_TYPES } from '../types'
import type {
  DocumentFilterPatch,
  DocumentOwnerType,
  DocumentRecord,
  DocumentStatus,
  VendorDocumentType,
  VendorRecord,
} from '../types'
import { ConfirmDialog } from './confirm-dialog'
import { DocumentCards, DocumentTable } from './document-table'
import { DocumentFormDialog } from './document-form-dialog'
import { DocumentSubjectDialog } from './document-subject-dialog'
import type { DocumentSubject } from './document-subject-dialog'
import { DocumentViewerDialog } from './document-viewer-dialog'
import { Panel, PanelEmpty, PanelError, PanelSkeleton } from './panel-states'

type Overlay = 'form' | 'delete' | 'view'

interface DocumentPanelProps {
  vendor: VendorRecord
  canManage: boolean
  /**
   * A filter handed over by an alert on the overview, and a subject handed over
   * by a vehicle or driver row.
   *
   * Both carry a `token` rather than being cleared by a callback, which is what
   * lets the same request be made twice — pressing *Documents* on the same
   * vehicle again has to reopen the form, and a bare equality check on the
   * subject would decide nothing had changed. The token is also what makes this
   * a render-time adjustment rather than an effect: it is derived state
   * catching up with a prop, which is exactly the case React asks not to use an
   * effect for.
   */
  filterRequest: { token: number; filter: DocumentFilterPatch } | null
  ownerRequest: { token: number; type: DocumentOwnerType; id: string; label: string } | null
}

const TRIGGER = 'h-8 w-full sm:w-[10.5rem]'

/**
 * The vendor's documents, in one place.
 *
 * A centralised view rather than only per-vehicle and per-driver lists, because
 * the question this tab answers is "what is about to lapse anywhere in this
 * fleet" — and that is a question no per-subject list can answer. The per-subject
 * lists still exist on the detail sheets; this is the one an operations manager
 * works through on a Monday.
 *
 * Filing a new document needs a subject, so **Add** is only offered once one has
 * been chosen: a document belongs to a vehicle or a driver, and there is no such
 * thing as a document belonging to the vendor itself. Opening this tab from a
 * vehicle or driver row carries the subject with it, which is the ordinary path.
 */
export function DocumentPanel({
  vendor,
  canManage,
  filterRequest,
  ownerRequest,
}: DocumentPanelProps) {
  const { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset } =
    useDocumentListParams()

  const [target, setTarget] = useState<DocumentRecord | null>(null)
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [owner, setOwner] = useState<DocumentSubject | null>(null)

  const query = useDocuments(vendor.id, applied)
  const create = useCreateDocument()
  const update = useUpdateDocument()
  const remove = useDeleteDocument()
  const file = useDocumentFile()

  // Only fetched once somebody is actually choosing a subject to file against.
  const isChoosingOwner = overlay === 'form' && target === null
  const vehicles = useAssignableVehicles(vendor.id, isChoosingOwner)
  const drivers = useAssignableDrivers(vendor.id, isChoosingOwner)

  /** An alert on the overview arrives with its filter already chosen. */
  const [seenFilter, setSeenFilter] = useState<number | null>(null)
  if (filterRequest && filterRequest.token !== seenFilter) {
    setSeenFilter(filterRequest.token)
    applyFilters(filterRequest.filter)
  }

  /** Arriving from a vehicle or driver row opens the form on that subject. */
  const [seenOwner, setSeenOwner] = useState<number | null>(null)
  if (ownerRequest && ownerRequest.token !== seenOwner) {
    setSeenOwner(ownerRequest.token)
    setOwner({ type: ownerRequest.type, id: ownerRequest.id, label: ownerRequest.label })
    setTarget(null)
    setOverlay('form')
  }

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  if (meta && params.page > meta.totalPages) {
    clampToPages(meta.totalPages)
  }

  const close = useCallback(() => {
    setOverlay(null)
    file.close()
  }, [file])

  const submitForm = useCallback(
    (values: DocumentFormValues, chosen: File | null) => {
      const payload = {
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        issueDate: values.issueDate || null,
        expiryDate: values.expiryDate || null,
        note: values.note,
        file: chosen,
      }

      if (target) {
        update.mutate({ id: target.id, ...payload }, { onSuccess: close })
        return
      }

      if (!owner) {
        return
      }

      create.mutate(
        { ownerType: owner.type, ownerId: owner.id, input: payload },
        { onSuccess: close },
      )
    },
    [target, owner, create, update, close],
  )

  const isPending = create.isPending || update.isPending || remove.isPending

  /** The subjects a new document may be filed against. */
  const vehicleSubjects: DocumentSubject[] = (vehicles.data ?? []).map((vehicle) => ({
    type: 'Vehicle',
    id: vehicle.id,
    label: vehicle.registrationNo,
  }))

  const driverSubjects: DocumentSubject[] = (drivers.data ?? []).map((driver) => ({
    type: 'Driver',
    id: driver.id,
    label: driver.name,
  }))

  return (
    <>
      <Panel label="Documents">
        <div className="border-b">
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1 lg:max-w-xs">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  value={params.search}
                  onChange={(event) => applyFilters({ search: event.target.value })}
                  placeholder="Document number"
                  aria-label="Search documents"
                  className="pl-8.5"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Select
                  value={params.status}
                  onValueChange={(value) =>
                    applyFilters({ status: value as DocumentStatus | 'all' })
                  }
                >
                  <SelectTrigger className={TRIGGER} aria-label="Filter by document status">
                    <SelectValue>
                      {(value) =>
                        value && value !== 'all'
                          ? DOCUMENT_STATUS_META[value as DocumentStatus].label
                          : 'Any status'
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Any status</SelectItem>
                      {DOCUMENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          <span
                            className={cn(
                              'size-1.5 shrink-0 rounded-full',
                              DOCUMENT_STATUS_META[status].dot,
                            )}
                            aria-hidden
                          />
                          {DOCUMENT_STATUS_META[status].label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  value={params.ownerType}
                  onValueChange={(value) =>
                    applyFilters({ ownerType: value as DocumentOwnerType | 'all' })
                  }
                >
                  <SelectTrigger className={TRIGGER} aria-label="Filter by what it belongs to">
                    <SelectValue>
                      {(value) =>
                        value === 'Vehicle'
                          ? 'Vehicle documents'
                          : value === 'Driver'
                            ? 'Driver documents'
                            : 'All documents'
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All documents</SelectItem>
                      <SelectItem value="Vehicle">Vehicle documents</SelectItem>
                      <SelectItem value="Driver">Driver documents</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  value={params.documentType}
                  onValueChange={(value) =>
                    applyFilters({ documentType: value as VendorDocumentType | 'all' })
                  }
                >
                  <SelectTrigger className={TRIGGER} aria-label="Filter by document type">
                    <SelectValue>
                      {(value) => (value && value !== 'all' ? String(value) : 'Any type')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Any type</SelectItem>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {isFiltered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="text-muted-foreground"
                  >
                    <X data-icon="inline-start" aria-hidden />
                    Clear
                  </Button>
                )}

                {canManage && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setTarget(null)
                      setOwner(null)
                      setOverlay('form')
                    }}
                  >
                    <Plus data-icon="inline-start" aria-hidden />
                    File document
                  </Button>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground" aria-live="polite">
              {meta && !query.isPending
                ? `${meta.total} ${meta.total === 1 ? 'document' : 'documents'}${
                    isFiltered ? ' match these filters' : ' on file'
                  } · soonest expiry first`
                : undefined}
            </p>
          </div>
        </div>

        {query.isPending ? (
          <PanelSkeleton />
        ) : query.isError ? (
          <PanelError
            title="Could not load the documents"
            message={query.error?.message ?? 'Something went wrong.'}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : records.length === 0 ? (
          <PanelEmpty
            icon={FileText}
            title="No documents filed yet"
            description="A document belongs to a vehicle or a driver. Its status is worked out from the expiry date, so filing one is what puts it into this vendor's compliance counts."
            isFiltered={isFiltered}
            onReset={reset}
            action={
              canManage
                ? {
                    label: 'File document',
                    onClick: () => {
                      setTarget(null)
                      setOwner(null)
                      setOverlay('form')
                    },
                  }
                : undefined
            }
          />
        ) : (
          (() => {
            const actions = {
              canManage,
              onView: (document: DocumentRecord) => {
                setTarget(document)
                setOverlay('view')
                void file.open(document)
              },
              onDownload: (document: DocumentRecord) => void file.download(document),
              onEdit: (document: DocumentRecord) => {
                setTarget(document)
                setOwner(null)
                setOverlay('form')
              },
              onDelete: (document: DocumentRecord) => {
                setTarget(document)
                setOverlay('delete')
              },
            }

            return (
              <>
                <DocumentTable records={records} actions={actions} />
                <DocumentCards records={records} actions={actions} />
              </>
            )
          })()
        )}

        {meta && !query.isError && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={query.isFetching}
            noun={['document', 'documents']}
          />
        )}
      </Panel>

      {/* Choosing what a new document is about. Skipped when the tab was opened
          from a vehicle or driver row, which is where the subject usually comes
          from. */}
      <DocumentSubjectDialog
        open={overlay === 'form' && target === null && owner === null}
        isLoading={vehicles.isPending || drivers.isPending}
        vehicles={vehicleSubjects}
        drivers={driverSubjects}
        onOpenChange={(open) => !open && close()}
        onChoose={setOwner}
      />

      <DocumentFormDialog
        record={overlay === 'form' ? target : null}
        owner={owner}
        open={overlay === 'form' && (target !== null || owner !== null)}
        isPending={isPending}
        onOpenChange={(open) => !open && close()}
        onSubmit={submitForm}
      />

      {target && (
        <ConfirmDialog
          open={overlay === 'delete'}
          isPending={isPending}
          title={`Remove this ${target.documentType.toLowerCase()}?`}
          description={
            <>
              The row and its attached file are deleted, and it stops counting toward{' '}
              {vendor.name}&apos;s compliance. If the document has simply been renewed, updating
              this one with the new dates keeps the count honest instead.
            </>
          }
          confirmLabel="Remove"
          pendingLabel="Removing…"
          cancelLabel="Keep it"
          onOpenChange={(open) => !open && setOverlay(null)}
          onConfirm={() =>
            remove.mutate(
              { id: target.id, label: target.documentType },
              { onSuccess: () => setOverlay(null) },
            )
          }
        />
      )}

      <DocumentViewerDialog
        document={overlay === 'view' ? target : null}
        url={file.url}
        mimeType={file.mimeType}
        isLoading={file.isLoading}
        error={file.error}
        open={overlay === 'view'}
        onOpenChange={(open) => !open && close()}
        onDownload={() => target && void file.download(target)}
      />
    </>
  )
}
