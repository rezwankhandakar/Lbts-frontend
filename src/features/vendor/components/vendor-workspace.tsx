import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useVendorActions } from '../hooks/use-vendor-actions'
import { useVendorPhoto, useVendorSummary } from '../hooks/use-vendors'
import { vendorStatusMeta } from '../lib/vendor-meta'
import { VENDOR_STATUSES, isVendorTab } from '../types'
import type {
  DocumentOwnerType,
  DriverRecord,
  VehicleRecord,
  VendorRecord,
  VendorStatus,
  VendorTab,
} from '../types'
import { ActivityPanel } from './activity-panel'
import { AssignmentPanel } from './assignment-panel'
import { ConfirmDialog } from './confirm-dialog'
import { DocumentPanel } from './document-panel'
import { DriverPanel } from './driver-panel'
import { StatusChangeDialog } from './status-change-dialog'
import { VehiclePanel } from './vehicle-panel'
import { VendorFormDialog } from './vendor-form-dialog'
import { VendorHeader } from './vendor-header'
import { VendorOverview } from './vendor-overview'
import { VendorTabs } from './vendor-tabs'

interface VendorWorkspaceProps {
  vendor: VendorRecord
  canManage: boolean
  /** False on `/my-vendor`, where there is no directory to go back to. */
  showBackLink: boolean
  /** Where to go once a vendor has been deleted. */
  onDeleted: () => void
}

/**
 * One vendor, across six tabs.
 *
 * The tab lives in the URL as `?tab=`, which is the one piece of list state in
 * this module that does. Filters stay in component state, as they do everywhere
 * else in this app — but a link to somebody's fleet is worth sharing, and the
 * browser's back button should step between tabs rather than leaving the page
 * entirely. Stepping `replace`s rather than pushes only where a tab was opened
 * *by an alert*, so Back returns to where the reader came from rather than
 * walking every tab they were sent through.
 *
 * The cross-tab jumps are what make the module feel like one thing rather than
 * six: an alert on the overview opens the documents tab already filtered, and
 * "Assign driver" from a vehicle row opens the assignments tab with that vehicle
 * chosen. Both are carried in state rather than in the URL, because they are one
 * gesture rather than a destination.
 */
export function VendorWorkspace({
  vendor,
  canManage,
  showBackLink,
  onDeleted,
}: VendorWorkspaceProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const requested = searchParams.get('tab') ?? 'overview'
  const tab: VendorTab = isVendorTab(requested) ? requested : 'overview'

  /**
   * What one tab hands to another.
   *
   * Each carries a `token` rather than being cleared by a callback from the
   * child. That is what lets the *same* request be made twice — pressing the
   * same alert again, or opening documents for the same vehicle again — where a
   * bare equality check would decide nothing had changed and quietly do
   * nothing. It also keeps the receiving panel free of an effect: reacting to
   * one of these is derived state catching up with a prop.
   *
   * None of it is in the URL. A handoff is one gesture rather than a
   * destination, and a link that reproduced it would open somebody's page with
   * a dialog already up.
   */
  const [handoff, setHandoff] = useState<{
    token: number
    filter: Record<string, string>
  } | null>(null)
  const [pendingAssign, setPendingAssign] = useState<{
    vehicleId?: string
    driverId?: string
  } | null>(null)
  const [ownerRequest, setOwnerRequest] = useState<{
    token: number
    type: DocumentOwnerType
    id: string
    label: string
  } | null>(null)

  const summary = useVendorSummary(vendor.id)
  const actions = useVendorActions()
  const photo = useVendorPhoto()

  const goToTab = useCallback(
    (next: VendorTab, filter?: Record<string, string>) => {
      setHandoff(filter ? { token: Date.now(), filter } : null)
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          params.set('tab', next)
          return params
        },
        // A tab opened *by an alert* replaces rather than pushes, so Back
        // returns the reader to where they came from rather than walking them
        // through every tab they were sent to.
        { replace: filter !== undefined },
      )
    },
    [setSearchParams],
  )

  const openAssign = useCallback(
    (subject: { vehicleId?: string; driverId?: string }) => {
      setPendingAssign(subject)
      goToTab('assignments')
    },
    [goToTab],
  )

  const openDocuments = useCallback(
    (owner: { type: DocumentOwnerType; id: string; label: string }) => {
      setOwnerRequest({ token: Date.now(), ...owner })
      goToTab('documents')
    },
    [goToTab],
  )

  const counts = {
    vehicles: summary.data?.vehicles.total,
    drivers: summary.data?.drivers.total,
    documents: summary.data?.documents.total,
  }

  const alerting = {
    documents: (summary.data?.documents.expired ?? 0) > 0,
    vehicles: (summary.data?.vehicles.expired ?? 0) > 0,
    drivers: (summary.data?.drivers.suspended ?? 0) > 0,
  }

  return (
    <>
      <VendorHeader
        vendor={vendor}
        canManage={canManage}
        showBackLink={showBackLink}
        isPhotoPending={photo.upload.isPending || photo.remove.isPending}
        onEdit={() => actions.openEdit(vendor)}
        onChangeStatus={() => actions.openStatus(vendor)}
        onDelete={() => actions.openDelete(vendor)}
        onPhotoChosen={(file) => photo.upload.mutate({ id: vendor.id, file })}
        onPhotoRemoved={() => photo.remove.mutate(vendor.id)}
      />

      <VendorTabs value={tab} onChange={(next) => goToTab(next)} counts={counts} alerting={alerting} />

      <div id={`vendor-panel-${tab}`} role="tabpanel">
        {tab === 'overview' && (
          <VendorOverview
            summary={summary.data}
            isLoading={summary.isPending}
            isError={summary.isError}
            errorMessage={summary.error?.message ?? 'Something went wrong.'}
            isFetching={summary.isFetching}
            onRetry={() => void summary.refetch()}
            onOpenTab={goToTab}
          />
        )}

        {tab === 'vehicles' && (
          <VehiclePanel
            vendor={vendor}
            canManage={canManage}
            filterRequest={handoff}
            onAssign={(vehicle: VehicleRecord) => openAssign({ vehicleId: vehicle.id })}
            onDocuments={(vehicle: VehicleRecord) =>
              openDocuments({
                type: 'Vehicle',
                id: vehicle.id,
                label: vehicle.registrationNo,
              })
            }
          />
        )}

        {tab === 'drivers' && (
          <DriverPanel
            vendor={vendor}
            canManage={canManage}
            filterRequest={handoff}
            onAssign={(driver: DriverRecord) => openAssign({ driverId: driver.id })}
            onDocuments={(driver: DriverRecord) =>
              openDocuments({ type: 'Driver', id: driver.id, label: driver.name })
            }
          />
        )}

        {tab === 'assignments' && (
          <AssignmentPanel
            vendor={vendor}
            canManage={canManage}
            pendingAssign={pendingAssign}
            onAssignHandled={() => setPendingAssign(null)}
          />
        )}

        {tab === 'documents' && (
          <DocumentPanel
            vendor={vendor}
            canManage={canManage}
            filterRequest={handoff}
            ownerRequest={ownerRequest}
          />
        )}

        {tab === 'activity' && <ActivityPanel vendor={vendor} />}
      </div>

      <VendorFormDialog
        record={actions.view === 'form' ? vendor : null}
        open={actions.view === 'form'}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onSubmit={actions.submitForm}
      />

      <StatusChangeDialog<VendorStatus>
        open={actions.view === 'status'}
        isPending={actions.isPending}
        subject={vendor.name}
        noun="vendor"
        current={vendor.status}
        options={VENDOR_STATUSES}
        meta={vendorStatusMeta}
        consequence={(status) =>
          status === 'Active'
            ? 'Vehicles and drivers under this vendor can be assigned again.'
            : 'Existing vehicles, drivers, assignments and documents are all kept. Nothing new can be assigned under this vendor until it is active again.'
        }
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmStatus}
      />

      <ConfirmDialog
        open={actions.view === 'delete'}
        isPending={actions.isPending}
        title={`Remove ${vendor.name}?`}
        description={
          <>
            If no vehicle, driver, assignment or user account references this vendor it is deleted
            outright. If any do, it is <strong>deactivated and kept</strong> instead — a year of
            assignments has to be able to say who was driving, and deleting the vendor would leave
            them pointing at nothing.
          </>
        }
        confirmLabel="Remove"
        pendingLabel="Removing…"
        cancelLabel="Keep it"
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={() => actions.confirmDelete(onDeleted)}
      />
    </>
  )
}
