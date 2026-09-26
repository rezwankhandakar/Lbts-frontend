import { useMemo } from 'react'
import { Lock } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/empty-state'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { Button } from '@/components/ui/button'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useAuthStore } from '@/stores/use-auth-store'
import { useDriver } from '@/features/vendor/hooks/use-fleet'
import { DeliveryPageHeader } from '@/features/delivery/components/delivery-page-header'
import { DeliveryWorkspace } from '@/features/delivery/components/delivery-workspace'
import { tripStatusMeta } from '@/features/delivery/lib/delivery-meta'
import { TripLoadError } from '@/features/delivery/components/trip-load-error'
import { useTrip } from '@/features/delivery/hooks/use-deliveries'
import { shortTripNumber } from '@/features/delivery/lib/delivery-meta'
import { useChallanCandidatesByIds, useTripVehicle } from '@/features/delivery/hooks/use-trip-lookups'
import { driverChoiceFrom, useTripWorkspace } from '@/features/delivery/hooks/use-trip-workspace'
import type { TripDriverChoice } from '@/features/delivery/hooks/use-trip-workspace'
import { fromTrip } from '@/features/delivery/lib/cart'
import { canChangeTrip, tripIsEditable } from '@/features/delivery/types'
import type { ChallanCandidate, TripRecord, TripVehicleOption } from '@/features/delivery/types'
import { useT } from '@/lib/i18n'

/**
 * Correcting a trip that has not left the gate.
 *
 * Four reads before the workspace can open — the trip, its vehicle as the
 * search would show it, its driver's live record, and the live allocation of
 * every challan on it with this trip's own quantities left out — because the
 * workspace edits against today's figures, not the ones from when the trip was
 * confirmed.
 */
export function DeliveryEditPage() {
  const t = useT()

  const { id } = useParams<{ id: string }>()
  const role = useCurrentRole()
  const userId = useAuthStore((state) => state.profile?.id ?? null)

  const tripQuery = useTrip(id)
  const trip = tripQuery.data
  const ids = useMemo(() => trip?.challans?.map((challan) => challan.challanId) ?? [], [trip])

  const vehicleQuery = useTripVehicle(trip?.vehicle.id)
  const driverQuery = useDriver(trip?.driver.id)
  const candidatesQuery = useChallanCandidatesByIds(ids, trip?.id)

  if (tripQuery.isError) {
    return <TripLoadError error={tripQuery.error} onRetry={() => void tripQuery.refetch()} />
  }

  // A disabled query stays "pending" forever, so each wait is only for a read
  // that is actually running.
  if (
    !trip ||
    vehicleQuery.isPending ||
    driverQuery.isPending ||
    (ids.length > 0 && candidatesQuery.isPending)
  ) {
    return <PageSkeleton />
  }

  if (!canChangeTrip(role, userId, trip) || !tripIsEditable(trip.status)) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <EmptyState
          icon={Lock}
          title={t('delivery.workspace.cannotEdit', {
            trip: shortTripNumber(trip.tripNumber),
          })}
          description={
            tripIsEditable(trip.status)
              ? t('delivery.workspace.notYours')
              : t('delivery.workspace.leftTheGate', {
                  status: tripStatusMeta(trip.status, t).label,
                })
          }
          action={
            <Button render={<Link to={`/delivery/${trip.id}`} />}>{t('delivery.workspace.backToTrip')}</Button>
          }
        />
      </div>
    )
  }

  return (
    <EditWorkspace
      trip={trip}
      vehicle={vehicleQuery.data ?? null}
      driver={driverQuery.data ? driverChoiceFrom(driverQuery.data) : snapshotDriver(trip)}
      candidates={candidatesQuery.data ?? []}
    />
  )
}

/** The driver as the trip recorded them, when their live record is gone. */
function snapshotDriver(trip: TripRecord): TripDriverChoice {
  return {
    id: trip.driver.id,
    driverCode: trip.driver.driverCode,
    name: trip.driver.name,
    mobile: trip.driver.mobile,
    photoUrl: null,
    licenseNumber: trip.driver.licenseNumber,
    licenseExpiry: trip.driver.licenseExpiry,
    licenceStatus: null,
    licencePhrase: null,
    status: 'Inactive',
  }
}

interface EditWorkspaceProps {
  trip: TripRecord
  vehicle: TripVehicleOption | null
  driver: TripDriverChoice
  candidates: ChallanCandidate[]
}

/** Mounted once everything has loaded, so the workspace is seeded exactly once. */
function EditWorkspace({ trip, vehicle, driver, candidates }: EditWorkspaceProps) {
  const t = useT()

  const workspace = useTripWorkspace({
    trip,
    vehicle,
    driver,
    cart: fromTrip(trip.challans ?? [], candidates),
  })

  return (
    <div className="mx-auto w-full max-w-7xl">
      <DeliveryPageHeader
        title={t('delivery.workspace.editTitle', { trip: shortTripNumber(trip.tripNumber) })}
        description={t('delivery.workspace.editDescription')}
        back={{ to: `/delivery/${trip.id}`, label: shortTripNumber(trip.tripNumber) }}
      />
      <DeliveryWorkspace workspace={workspace} />
    </div>
  )
}
