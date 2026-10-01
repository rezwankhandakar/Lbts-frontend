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
import { AssignmentPanel } from './assignment-panel'
import { SentenceWith } from '@/components/shared/sentence-with'
import { ConfirmDialog } from './confirm-dialog'
import { DocumentPanel } from './document-panel'
import { DriverPanel } from './driver-panel'
import { StatusChangeDialog } from './status-change-dialog'
import { VehiclePanel } from './vehicle-panel'
import { VendorFormDialog } from './vendor-form-dialog'
import { VendorHeader } from './vendor-header'
import { VendorOverview } from './vendor-overview'
import { VendorTabs } from './vendor-tabs'
import { VendorTripPanel } from './vendor-trip-panel'
import { useT } from '@/lib/i18n'

interface VendorWorkspaceProps {
  vendor: VendorRecord
  canManage: boolean
  /** False on `/my-vendor`, where there is no directory to go back to. */
  showBackLink: boolean
  /** Where to go once a vendor has been deleted. */
  onDeleted: () => void
}

/**
 * One vendor, across seven tabs.
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
 * seven: an alert on the overview opens the documents tab already filtered, and
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
  const t = useT()

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

  /** The tab in the URL, with no opinion about what is being handed over. */
  const showTab = useCallback(
    (next: VendorTab, replace: boolean) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          params.set('tab', next)
          return params
        },
        // A tab opened *by an alert* replaces rather than pushes, so Back
        // returns the reader to where they came from rather than walking them
        // through every tab they were sent to.
        { replace },
      )
    },
    [setSearchParams],
  )

  /**
   * **Every path to a tab states which handover it carries, and clears the
   * other two.** That is the rule, and it is worth the three lines it costs.
   *
   * A panel is unmounted while its tab is not showing, so the "already seen
   * this request" marker inside it dies with it — a handover the workspace is
   * still holding therefore fires again the next time that panel mounts. That
   * is how pressing the *Documents* tab came to reopen the renew form for
   * whichever vehicle had last been sent there, long after the operator had
   * closed it.
   *
   * So a handover lives exactly as long as the navigation that carried it. A
   * tab reached by pressing the tab bar carries none, which is the honest
   * reading of a plain click: it means "show me this tab", never "do that thing
   * again".
   */
  const goToTab = useCallback(
    (next: VendorTab, filter?: Record<string, string>) => {
      setHandoff(filter ? { token: Date.now(), filter } : null)
      setPendingAssign(null)
      setOwnerRequest(null)
      showTab(next, filter !== undefined)
    },
    [showTab],
  )

  const openAssign = useCallback(
    (subject: { vehicleId?: string; driverId?: string }) => {
      setHandoff(null)
      setOwnerRequest(null)
      setPendingAssign(subject)
      showTab('assignments', false)
    },
    [showTab],
  )

  const openDocuments = useCallback(
    (owner: { type: DocumentOwnerType; id: string; label: string }) => {
      setHandoff(null)
      setPendingAssign(null)
      setOwnerRequest({ token: Date.now(), ...owner })
      showTab('documents', false)
    },
    [showTab],
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
            errorMessage={summary.error?.message ?? t('vendor.somethingWrong')}
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
            onOwnerHandled={() => setOwnerRequest(null)}
          />
        )}

        {tab === 'trips' && <VendorTripPanel vendor={vendor} />}
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
        noun={t('vendor.statusDialog.nounVendor')}
        current={vendor.status}
        options={VENDOR_STATUSES}
        meta={vendorStatusMeta}
        consequence={(status) =>
          status === 'Active'
            ? t('vendor.directory.activeConsequence')
            : t('vendor.directory.inactiveConsequence')
        }
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmStatus}
      />

      <ConfirmDialog
        open={actions.view === 'delete'}
        isPending={actions.isPending}
        title={t('vendor.remove.vendorTitle', { name: vendor.name })}
        description={
          <SentenceWith text={t('vendor.directory.removeDescription')} placeholder="{kept}">
            <strong>{t('vendor.directory.deactivatedAndKept')}</strong>
          </SentenceWith>
        }
        confirmLabel={t('vendor.remove.confirm')}
        pendingLabel={t('vendor.remove.removing')}
        cancelLabel={t('vendor.remove.keepIt')}
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={() => actions.confirmDelete(onDeleted)}
      />
    </>
  )
}
