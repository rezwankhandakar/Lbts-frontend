import { DeliveryPageHeader } from '@/features/delivery/components/delivery-page-header'
import { DeliveryWorkspace } from '@/features/delivery/components/delivery-workspace'
import { useTripWorkspace } from '@/features/delivery/hooks/use-trip-workspace'
import { useT } from '@/lib/i18n'

/**
 * Building a new trip.
 *
 * Nothing is written until Confirm: the vehicle, the driver and the cart live
 * in this page, exactly as a challan session lives in its workspace, and a
 * reload is warned about rather than silently discarding a stack of scanned
 * challans. The trip number is allocated by the server at confirmation.
 */
export function DeliveryNewPage() {
  const t = useT()

  const workspace = useTripWorkspace()

  return (
    <div className="mx-auto w-full max-w-7xl">
      <DeliveryPageHeader
        title={t('delivery.workspace.newTitle')}
        description={t('delivery.workspace.newDescription')}
        back={{ to: '/delivery', label: t('delivery.deliveries') }}
      />
      <DeliveryWorkspace workspace={workspace} />
    </div>
  )
}
