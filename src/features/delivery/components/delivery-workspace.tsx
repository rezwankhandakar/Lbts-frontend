import { useState } from 'react'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useBarcodeWedge } from '@/hooks/use-barcode-wedge'
import { useChallanScan } from '../hooks/use-challan-scan'
import type { TripWorkspace } from '../hooks/use-trip-workspace'
import { canWriteDeliveries } from '../types'
import { ChallanFinder } from './challan-finder'
import { ConfirmTripDialog } from './confirm-trip-dialog'
import { DeliveryCart } from './delivery-cart'
import { DeliverySummaryPanel } from './delivery-summary-panel'
import { MobileConfirmBar } from './mobile-confirm-bar'
import { OverageDialog } from './overage-dialog'
import { TripCreatedPanel } from './trip-created-panel'
import { TripParties } from './trip-parties'
import { WorkspaceStep } from './workspace-step'

/**
 * Building a trip: the vehicle and driver on one side, the challans on the
 * other, and the summary with Confirm beside both.
 *
 * The scanner listens across the whole page and is paused while any dialog is
 * open, so a barcode read while somebody is typing into a form can never add a
 * challan behind it. Confirmation goes through a review dialog, and the
 * server's over-allocation question, when it comes, through its own.
 */
export function DeliveryWorkspace({ workspace }: { workspace: TripWorkspace }) {
  const role = useCurrentRole()
  const [cartDialogOpen, setCartDialogOpen] = useState(false)
  const [reviewing, setReviewing] = useState(false)

  const { cart, editing, created, overages } = workspace
  const scanner = useChallanScan({ cart: cart.state, add: cart.add, excludeTripId: editing?.id })

  const listening = !cartDialogOpen && !reviewing && overages === null && created === null
  useBarcodeWedge((code) => void scanner.scan(code), listening)

  if (created) {
    return (
      <TripCreatedPanel
        trip={created}
        isNew={editing === null}
        onStartAnother={workspace.startAnother}
      />
    )
  }

  const confirm = () => {
    setReviewing(false)
    workspace.confirm(false)
  }

  return (
    <>
      <div className="grid gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_21rem] lg:pb-0 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="min-w-0 space-y-6">
          <WorkspaceStep
            step={1}
            title="Vehicle and driver"
            description="Find the lorry by its plate. Its vendor and assigned driver fill in; the driver can be changed for this trip alone."
            done={workspace.vehicle !== null && workspace.driver?.status === 'Active'}
          >
            <TripParties
              vehicle={workspace.vehicle}
              driver={workspace.driver}
              onSelectVehicle={workspace.selectVehicle}
              onSelectDriver={workspace.selectDriver}
              canAddDriver={canWriteDeliveries(role)}
              disabled={workspace.isSaving}
            />
          </WorkspaceStep>

          <WorkspaceStep
            step={2}
            title="Challans"
            description="Add the challans going on this lorry. Trim a quantity, replace a model, add a product or split a challan across trips."
            done={cart.summary.challans > 0}
          >
            <div className="space-y-5">
              <ChallanFinder
                cart={cart.state}
                onAdd={cart.add}
                onScan={(code) => void scanner.scan(code)}
                scanPending={scanner.pending}
                lastScan={scanner.last}
                listening={listening}
                excludeTripId={editing?.id}
              />
              <DeliveryCart cart={cart} onDialogChange={setCartDialogOpen} />
            </div>
          </WorkspaceStep>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <DeliverySummaryPanel workspace={workspace} onConfirm={() => setReviewing(true)} />
        </aside>
      </div>

      <MobileConfirmBar workspace={workspace} onConfirm={() => setReviewing(true)} />

      <ConfirmTripDialog
        workspace={workspace}
        open={reviewing}
        onOpenChange={setReviewing}
        onConfirm={confirm}
      />

      <OverageDialog
        overages={overages}
        isPending={workspace.isSaving}
        onCancel={workspace.dismissOverages}
        onConfirm={() => workspace.confirm(true)}
      />
    </>
  )
}
