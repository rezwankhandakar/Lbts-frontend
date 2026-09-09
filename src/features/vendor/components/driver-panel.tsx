import { useCallback, useState } from 'react'
import { Users } from 'lucide-react'
import { ListPagination } from '@/components/shared/list-pagination'
import {
  useChangeDriverStatus,
  useCreateDriver,
  useDeleteDriver,
  useDriver,
  useDriverAssignments,
  useDriverDocuments,
  useDriverPhoto,
  useDrivers,
  useUpdateDriver,
} from '../hooks/use-fleet'
import { useDriverListParams } from '../hooks/use-list-params'
import { driverStatusMeta } from '../lib/vendor-meta'
import type { DriverFormValues } from '../schemas/vendor-schemas'
import { DRIVER_STATUSES } from '../types'
import type { DriverFilterPatch, DriverRecord, DriverStatus, VendorRecord } from '../types'
import { ConfirmDialog } from './confirm-dialog'
import { DriverCards } from './driver-cards'
import { DriverDetailSheet } from './driver-detail-sheet'
import { DriverFilters } from './driver-filters'
import { DriverFormDialog } from './driver-form-dialog'
import { DriverTable } from './driver-table'
import { Panel, PanelEmpty, PanelError, PanelSkeleton } from './panel-states'
import { StatusChangeDialog } from './status-change-dialog'

type Overlay = 'form' | 'status' | 'delete' | 'detail'

interface DriverPanelProps {
  vendor: VendorRecord
  canManage: boolean
  /**
   * A filter handed over by an alert on the overview, carrying a token so the
   * same alert pressed twice still applies.
   */
  filterRequest: { token: number; filter: DriverFilterPatch } | null
  onAssign: (driver: DriverRecord) => void
  onDocuments: (driver: DriverRecord) => void
}

/**
 * The drivers tab.
 *
 * The one thing here that is not symmetrical with the vehicles tab: a driver's
 * NID and address are not on the list shape, so both the detail sheet and the
 * edit form need the record fetched on its own. That is deliberate rather than
 * awkward — it is what keeps personal data off a table of eighteen rows — and it
 * costs one request at the moment somebody opens a driver.
 */
export function DriverPanel({
  vendor,
  canManage,
  filterRequest,
  onAssign,
  onDocuments,
}: DriverPanelProps) {
  const { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset } =
    useDriverListParams()

  const [target, setTarget] = useState<DriverRecord | null>(null)
  const [overlay, setOverlay] = useState<Overlay | null>(null)

  const query = useDrivers(vendor.id, applied)
  const create = useCreateDriver(vendor.id)
  const update = useUpdateDriver()
  const status = useChangeDriverStatus()
  const remove = useDeleteDriver()
  const photo = useDriverPhoto()

  /**
   * The full record, fetched only once a driver is actually open. Both the
   * detail sheet and the edit form read from it, because the list shape
   * deliberately carries neither the NID nor the address.
   */
  const needsDetail = (overlay === 'detail' || overlay === 'form') && target !== null
  const detail = useDriver(needsDetail ? target.id : undefined)
  const assignments = useDriverAssignments(overlay === 'detail' && target ? target.id : undefined)
  const documents = useDriverDocuments(overlay === 'detail' && target ? target.id : undefined)

  /** An alert on the overview lands here with a filter already chosen. */
  const [seenFilter, setSeenFilter] = useState<number | null>(null)
  if (filterRequest && filterRequest.token !== seenFilter) {
    setSeenFilter(filterRequest.token)
    applyFilters(filterRequest.filter)
  }

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  if (meta && params.page > meta.totalPages) {
    clampToPages(meta.totalPages)
  }

  const close = useCallback(() => setOverlay(null), [])

  const openFor = useCallback(
    (next: Overlay) => (driver: DriverRecord) => {
      setTarget(driver)
      setOverlay(next)
    },
    [],
  )

  const submitForm = useCallback(
    (values: DriverFormValues) => {
      const payload = { ...values, licenseExpiry: values.licenseExpiry || null }

      if (target && overlay === 'form') {
        update.mutate({ id: target.id, ...payload }, { onSuccess: close })
        return
      }
      create.mutate(payload, { onSuccess: close })
    },
    [target, overlay, create, update, close],
  )

  const isPending =
    create.isPending || update.isPending || status.isPending || remove.isPending

  return (
    <>
      <Panel label="Drivers">
        <DriverFilters
          params={params}
          onChange={applyFilters}
          onReset={reset}
          onAdd={() => {
            setTarget(null)
            setOverlay('form')
          }}
          canManage={canManage}
          summary={
            meta && !query.isPending
              ? `${meta.total} ${meta.total === 1 ? 'driver' : 'drivers'}${
                  isFiltered ? ' match these filters' : ' on the books'
                }`
              : undefined
          }
        />

        {query.isPending ? (
          <PanelSkeleton />
        ) : query.isError ? (
          <PanelError
            title="Could not load the drivers"
            message={query.error?.message ?? 'Something went wrong.'}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : records.length === 0 ? (
          <PanelEmpty
            icon={Users}
            title="No drivers added yet"
            description={`Every driver belongs to exactly one vendor, and can only be assigned to ${vendor.name}'s own vehicles.`}
            isFiltered={isFiltered}
            onReset={reset}
            action={
              canManage
                ? {
                    label: 'Add driver',
                    onClick: () => {
                      setTarget(null)
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
              onOpen: openFor('detail'),
              onEdit: openFor('form'),
              onStatus: openFor('status'),
              onDelete: openFor('delete'),
              onAssign,
              onDocuments,
            }

            return (
              <>
                <DriverTable records={records} actions={actions} />
                <DriverCards records={records} actions={actions} />
              </>
            )
          })()
        )}

        {meta && !query.isError && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={query.isFetching}
            noun={['driver', 'drivers']}
          />
        )}
      </Panel>

      {/* An edit waits for the full record. The list shape carries neither the
          NID nor the address — deliberately, so a table of eighteen drivers
          does not — and opening the form on a row would produce two fields that
          looked empty and saved as blank. Adding a driver needs no fetch, so it
          opens immediately. */}
      <DriverFormDialog
        record={overlay === 'form' ? (detail.data ?? null) : null}
        vendorName={vendor.name}
        open={overlay === 'form' && (target === null || detail.data !== undefined)}
        isPending={isPending}
        onOpenChange={(open) => !open && close()}
        onSubmit={submitForm}
      />

      {target && (
        <StatusChangeDialog<DriverStatus>
          open={overlay === 'status'}
          isPending={isPending}
          subject={target.name}
          noun="driver"
          current={target.status}
          options={DRIVER_STATUSES}
          meta={driverStatusMeta}
          consequence={(next) =>
            next === 'Active'
              ? 'They can be given a vehicle again.'
              : 'Any assignment they currently hold is left exactly as it is — a driver on leave from Tuesday was still driving on Monday. They simply cannot take a new assignment until they are active.'
          }
          onOpenChange={(open) => !open && close()}
          onConfirm={(next, note) =>
            status.mutate(
              { id: target.id, status: next, note: note || undefined },
              { onSuccess: close },
            )
          }
        />
      )}

      {target && (
        <ConfirmDialog
          open={overlay === 'delete'}
          isPending={isPending}
          title={`Remove ${target.name}?`}
          description={
            <>
              The driver, their documents and their <strong>whole assignment history</strong> are
              deleted. If they have simply left this vendor, marking them inactive keeps the record
              of which vehicles they drove and when.
            </>
          }
          confirmLabel="Remove"
          pendingLabel="Removing…"
          cancelLabel="Keep them"
          onOpenChange={(open) => !open && close()}
          onConfirm={() =>
            remove.mutate({ id: target.id, label: target.name }, { onSuccess: close })
          }
        />
      )}

      <DriverDetailSheet
        driver={overlay === 'detail' ? (detail.data ?? null) : null}
        vendorName={vendor.name}
        assignments={assignments.data}
        documents={documents.data}
        isLoading={detail.isPending || assignments.isPending || documents.isPending}
        canManage={canManage}
        isPhotoPending={photo.upload.isPending}
        open={overlay === 'detail'}
        onOpenChange={(open) => !open && close()}
        onPhotoChosen={(file) => target && photo.upload.mutate({ id: target.id, file })}
      />
    </>
  )
}
