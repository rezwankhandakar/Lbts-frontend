import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { t } from '@/lib/i18n'
import type { ApiError } from '@/lib/axios'
import { DriverFormDialog } from '@/features/vendor/components/driver-form-dialog'
import type { DriverFormValues } from '@/features/vendor/schemas/vendor-schemas'
import type { DriverDetail } from '@/features/vendor/types'
import { createTripDriver, uploadTripDriverPhoto } from '../api/delivery-api'
import { reportDeliveryError } from '../hooks/use-deliveries'
import { DriverPhotoField } from './driver-photo-field'

interface QuickDriverDialogProps {
  open: boolean
  vehicleId: string
  vendorName: string
  onOpenChange: (open: boolean) => void
  /** The new driver, who is put on this trip straight away. */
  onCreated: (driver: DriverDetail) => void
}

/**
 * Adding a driver without leaving the trip.
 *
 * The form is the Vendor module's own `DriverFormDialog` — the same fields and
 * the same validation as the fleet tab, so the two can never disagree about
 * what a driver needs — with a photo underneath. The request names the vehicle
 * and nothing about a vendor; the server reads the vendor off the vehicle, runs
 * the duplicate checks (mobile, NID, licence), files the licence as a document
 * and journals the addition, exactly as the fleet tab would.
 *
 * The driver is created `Active` and put on this trip on success, so the
 * operator never has to go and find the record they just made.
 */
export function QuickDriverDialog({
  open,
  vehicleId,
  vendorName,
  onOpenChange,
  onCreated,
}: QuickDriverDialogProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const client = useQueryClient()

  const mutation = useMutation<DriverDetail, ApiError, DriverFormValues>({
    mutationFn: async (values) => {
      const driver = await createTripDriver({
        vehicleId,
        name: values.name,
        mobile: values.mobile,
        nidNumber: values.nidNumber,
        address: values.address,
        licenseNumber: values.licenseNumber,
        licenseExpiry: values.licenseExpiry || null,
      })

      if (!photo) {
        return driver
      }

      // The driver exists either way; a failed photo is a warning, not a
      // reason to lose the record that was just made.
      try {
        return await uploadTripDriverPhoto(driver.id, photo)
      } catch (error) {
        toast.warning(t('delivery.driver.photoFailed', { name: driver.name }), {
          description: (error as ApiError).message,
        })
        return driver
      }
    },
    onSuccess: (driver) => {
      toast.success(t('delivery.driver.added', { name: driver.name, code: driver.driverCode }), {
        description: t('delivery.driver.addedNote'),
      })
      setPhoto(null)
      // The vendor's driver lists and counts now include them.
      void client.invalidateQueries({ queryKey: ['vendors'] })
      onCreated(driver)
    },
    onError: reportDeliveryError,
  })

  return (
    <DriverFormDialog
      record={null}
      vendorName={vendorName}
      open={open}
      isPending={mutation.isPending}
      onOpenChange={(next) => {
        if (!next) {
          setPhoto(null)
        }
        onOpenChange(next)
      }}
      onSubmit={(values) => mutation.mutate(values)}
      description={t('delivery.driver.addedFor', { vendor: vendorName })}
      extra={<DriverPhotoField file={photo} onChange={setPhoto} disabled={mutation.isPending} />}
    />
  )
}
