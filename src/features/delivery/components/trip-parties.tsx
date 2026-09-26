import { useState } from 'react'
import { driverChoiceFrom } from '../hooks/use-trip-workspace'
import type { TripDriverChoice } from '../hooks/use-trip-workspace'
import type { TripVehicleOption } from '../types'
import { DriverPickerDialog } from './driver-picker-dialog'
import { QuickDriverDialog } from './quick-driver-dialog'
import { TripDriverCard } from './trip-driver-card'
import { TripVehicleCard } from './trip-vehicle-card'
import { TripVendorCard } from './trip-vendor-card'
import { VehicleSearch } from './vehicle-search'
import { useT } from '@/lib/i18n'

interface TripPartiesProps {
  vehicle: TripVehicleOption | null
  driver: TripDriverChoice | null
  onSelectVehicle: (option: TripVehicleOption | null) => void
  onSelectDriver: (driver: TripDriverChoice | null) => void
  /** Whether "Add new driver" is offered — the caller may write trips. */
  canAddDriver: boolean
  disabled?: boolean
}

/**
 * Step one of a trip: which lorry, who runs it, who drives it.
 *
 * Before a vehicle is chosen this is the plate search and nothing else. After,
 * it is three cards — the vehicle as a summary across the top, the vendor and
 * the driver side by side beneath — because the vendor is read off the vehicle
 * and the driver defaults from it, and laying them out that way says so.
 */
export function TripParties({
  vehicle,
  driver,
  onSelectVehicle,
  onSelectDriver,
  canAddDriver,
  disabled,
}: TripPartiesProps) {
  const t = useT()

  const [dialog, setDialog] = useState<'pick' | 'add' | null>(null)
  const [changing, setChanging] = useState(false)

  if (!vehicle || changing) {
    return (
      <div className="space-y-3">
        <VehicleSearch
          autoFocus={changing}
          onSelect={(option) => {
            onSelectVehicle(option)
            setChanging(false)
          }}
        />
        {changing && (
          <button
            type="button"
            onClick={() => setChanging(false)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {t('delivery.vehicle.keep', { plate: vehicle?.vehicle.registrationNo ?? '' })}
          </button>
        )}
      </div>
    )
  }

  const assigned = vehicle.currentDriver

  return (
    <div className="space-y-4">
      <TripVehicleCard option={vehicle} onChange={() => setChanging(true)} disabled={disabled} />

      <div className="grid gap-4 md:grid-cols-2">
        <TripVendorCard vendor={vehicle.vendor} />
        <TripDriverCard
          driver={driver}
          assigned={assigned}
          canAdd={canAddDriver}
          disabled={disabled}
          onChange={() => setDialog('pick')}
          onAdd={() => setDialog('add')}
          onUseAssigned={() => assigned && onSelectDriver(driverChoiceFrom(assigned))}
        />
      </div>

      <DriverPickerDialog
        open={dialog === 'pick'}
        vendorId={vehicle.vendor.id}
        vendorName={vehicle.vendor.name}
        selectedId={driver?.id ?? null}
        assignedId={assigned?.id ?? null}
        canAdd={canAddDriver}
        onOpenChange={(open) => setDialog(open ? 'pick' : null)}
        onPick={(record) => {
          onSelectDriver(driverChoiceFrom(record))
          setDialog(null)
        }}
        onAdd={() => setDialog('add')}
      />

      <QuickDriverDialog
        open={dialog === 'add'}
        vehicleId={vehicle.vehicle.id}
        vendorName={vehicle.vendor.name}
        onOpenChange={(open) => setDialog(open ? 'add' : null)}
        onCreated={(created) => {
          onSelectDriver(driverChoiceFrom(created))
          setDialog(null)
        }}
      />
    </div>
  )
}
