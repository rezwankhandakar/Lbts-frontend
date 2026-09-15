import { DeliveryPageHeader } from '@/features/delivery/components/delivery-page-header'
import { DeliveryWorkspace } from '@/features/delivery/components/delivery-workspace'
import { useTripWorkspace } from '@/features/delivery/hooks/use-trip-workspace'

/**
 * Building a new trip.
 *
 * Nothing is written until Confirm: the vehicle, the driver and the cart live
 * in this page, exactly as a challan session lives in its workspace, and a
 * reload is warned about rather than silently discarding a stack of scanned
 * challans. The trip number is allocated by the server at confirmation.
 */
export function DeliveryNewPage() {
  const workspace = useTripWorkspace()

  return (
    <div className="mx-auto w-full max-w-7xl">
      <DeliveryPageHeader
        title="New delivery"
        description="Choose the vehicle, confirm who drives it, then put the challans on the lorry. The trip is numbered under the vehicle's vendor when you confirm."
        back={{ to: '/delivery', label: 'Deliveries' }}
      />
      <DeliveryWorkspace workspace={workspace} />
    </div>
  )
}
