import { useCallback, useState } from 'react'
import { Truck } from 'lucide-react'
import { ListPagination } from '@/components/shared/list-pagination'
import {
  useChangeVehicleStatus,
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
  useVehicleAssignments,
  useVehicleDocuments,
  useVehicles,
} from '../hooks/use-fleet'
import { useVehicleListParams } from '../hooks/use-list-params'
import { vehicleStatusMeta } from '../lib/vendor-meta'
import type { VehicleFormValues } from '../schemas/vendor-schemas'
import { VEHICLE_STATUSES } from '../types'
import type { VehicleFilterPatch, VehicleRecord, VehicleStatus, VendorRecord } from '../types'
import { ConfirmDialog } from './confirm-dialog'
import { Panel, PanelEmpty, PanelError, PanelSkeleton } from './panel-states'
import { StatusChangeDialog } from './status-change-dialog'
import { VehicleCards } from './vehicle-cards'
import { VehicleDetailSheet } from './vehicle-detail-sheet'
import { VehicleFilters } from './vehicle-filters'
import { VehicleFormDialog } from './vehicle-form-dialog'
import { VehicleTable } from './vehicle-table'

type Overlay = 'form' | 'status' | 'delete' | 'detail'

interface VehiclePanelProps {
  vendor: VendorRecord
  canManage: boolean
  /**
   * A filter handed over by an alert on the overview, carrying a token so the
   * same alert pressed twice still applies — an equality check on the filter
   * would decide nothing had changed.
   */
  filterRequest: { token: number; filter: VehicleFilterPatch } | null
  /** Opens the assign-driver dialog on the assignments tab for this vehicle. */
  onAssign: (vehicle: VehicleRecord) => void
  /** Opens the documents tab, already narrowed to this vehicle. */
  onDocuments: (vehicle: VehicleRecord) => void
}

/**
 * The vehicles tab.
 *
 * Composition rather than logic: the toolbar, one of the four list states, the
 * pagination, and the overlays. What lives here instead of in the page is which
 * overlay is open for which vehicle, so the page stays a layout and the tab
 * stays under the size CLAUDE.md asks for.
 */
export function VehiclePanel({
  vendor,
  canManage,
  filterRequest,
  onAssign,
  onDocuments,
}: VehiclePanelProps) {
  const { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset } =
    useVehicleListParams()

  const [target, setTarget] = useState<VehicleRecord | null>(null)
  const [overlay, setOverlay] = useState<Overlay | null>(null)

  const query = useVehicles(vendor.id, applied)
  const create = useCreateVehicle(vendor.id)
  const update = useUpdateVehicle()
  const status = useChangeVehicleStatus()
  const remove = useDeleteVehicle()

  // Only fetched once a vehicle is actually open, so a fleet table costs one
  // request rather than one per row for panels nobody looked at.
  const detailOpen = overlay === 'detail' && target !== null
  const assignments = useVehicleAssignments(detailOpen ? target.id : undefined)
  const documents = useVehicleDocuments(detailOpen ? target.id : undefined)

  /**
   * An alert on the overview lands here with a filter already chosen.
   *
   * Adjusted during render against the request's token rather than in an effect:
   * this is derived state catching up with a prop, which is the case React asks
   * not to use an effect for — and the token is what lets the *same* alert be
   * pressed twice, where an equality check on the filter would decide nothing
   * had changed.
   */
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
    (next: Overlay) => (vehicle: VehicleRecord) => {
      setTarget(vehicle)
      setOverlay(next)
    },
    [],
  )

  const submitForm = useCallback(
    (values: VehicleFormValues) => {
      if (target && overlay === 'form') {
        update.mutate({ id: target.id, ...values }, { onSuccess: close })
        return
      }
      create.mutate(values, { onSuccess: close })
    },
    [target, overlay, create, update, close],
  )

  const isPending =
    create.isPending || update.isPending || status.isPending || remove.isPending

  return (
    <>
      <Panel label="Vehicles">
        <VehicleFilters
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
              ? `${meta.total} ${meta.total === 1 ? 'vehicle' : 'vehicles'}${
                  isFiltered ? ' match these filters' : ' in this fleet'
                }`
              : undefined
          }
        />

        {query.isPending ? (
          <PanelSkeleton />
        ) : query.isError ? (
          <PanelError
            title="Could not load the fleet"
            message={query.error?.message ?? 'Something went wrong.'}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : records.length === 0 ? (
          <PanelEmpty
            icon={Truck}
            title="No vehicles added yet"
            description={`Every vehicle belongs to exactly one vendor. Add ${vendor.name}'s first vehicle, then assign a driver to it.`}
            isFiltered={isFiltered}
            onReset={reset}
            action={
              canManage
                ? {
                    label: 'Add vehicle',
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
                <VehicleTable records={records} actions={actions} />
                <VehicleCards records={records} actions={actions} />
              </>
            )
          })()
        )}

        {meta && !query.isError && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={query.isFetching}
            noun={['vehicle', 'vehicles']}
          />
        )}
      </Panel>

      <VehicleFormDialog
        record={overlay === 'form' ? target : null}
        vendorName={vendor.name}
        open={overlay === 'form'}
        isPending={isPending}
        onOpenChange={(open) => !open && close()}
        onSubmit={submitForm}
      />

      {target && (
        <StatusChangeDialog<VehicleStatus>
          open={overlay === 'status'}
          isPending={isPending}
          subject={target.registrationNo}
          noun="vehicle"
          current={target.status}
          options={VEHICLE_STATUSES}
          meta={vehicleStatusMeta}
          consequence={(next) =>
            next === 'Active'
              ? 'It can be given a driver again.'
              : 'Any assignment it currently has is left exactly as it is — a vehicle off the road on Tuesday still had a driver on Monday. It simply cannot take a new driver until it is active.'
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
          title={`Remove ${target.registrationNo}?`}
          description={
            <>
              The vehicle, its documents and its <strong>whole assignment history</strong> are
              deleted. An assignment whose vehicle is gone is a sentence with its subject removed,
              so those rows cannot be kept. If the vehicle has simply left the fleet, marking it
              inactive keeps the history instead.
            </>
          }
          confirmLabel="Remove"
          pendingLabel="Removing…"
          cancelLabel="Keep it"
          onOpenChange={(open) => !open && close()}
          onConfirm={() =>
            remove.mutate(
              { id: target.id, label: target.registrationNo },
              { onSuccess: close },
            )
          }
        />
      )}

      <VehicleDetailSheet
        vehicle={target}
        vendorName={vendor.name}
        assignments={assignments.data}
        documents={documents.data}
        isLoading={assignments.isPending || documents.isPending}
        open={overlay === 'detail'}
        onOpenChange={(open) => !open && close()}
      />
    </>
  )
}
