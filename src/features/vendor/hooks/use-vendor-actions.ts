import { useCallback, useState } from 'react'
import type { VendorFormValues } from '../schemas/vendor-schemas'
import type { VendorRecord, VendorStatus } from '../types'
import {
  useChangeVendorStatus,
  useCreateVendor,
  useDeleteVendor,
  useUpdateVendor,
} from './use-vendors'

type OverlayView = 'form' | 'status' | 'delete'

export interface VendorActionsController {
  target: VendorRecord | null
  view: OverlayView | null
  isPending: boolean
  openAdd: () => void
  openEdit: (vendor: VendorRecord) => void
  openStatus: (vendor: VendorRecord) => void
  openDelete: (vendor: VendorRecord) => void
  close: () => void
  submitForm: (values: VendorFormValues) => void
  confirmStatus: (status: VendorStatus, note: string) => void
  /**
   * `onRemoved` runs only once the write has actually succeeded, which is what
   * the details page navigates away on. Leaving the page as soon as the button
   * was pressed would abandon a failed delete silently — and a vendor with
   * records behind it is *deactivated* rather than deleted, so there is a real
   * outcome to wait for either way.
   */
  confirmDelete: (onRemoved?: () => void) => void
}

/**
 * Owns which overlay is open, for which vendor, and runs the mutation behind it.
 *
 * Keeping this in one place is what stops the page growing a tangle of booleans
 * — and it guarantees an overlay only closes once its write actually succeeded,
 * so a refused duplicate name leaves somebody looking at the form and the error
 * rather than at a list that silently did nothing. The same arrangement
 * `use-location-actions.ts` uses.
 */
export function useVendorActions(): VendorActionsController {
  const [target, setTarget] = useState<VendorRecord | null>(null)
  const [view, setView] = useState<OverlayView | null>(null)

  const create = useCreateVendor()
  const update = useUpdateVendor()
  const status = useChangeVendorStatus()
  const remove = useDeleteVendor()

  const close = useCallback(() => setView(null), [])

  const openAdd = useCallback(() => {
    setTarget(null)
    setView('form')
  }, [])

  const openFor = useCallback(
    (next: OverlayView) => (vendor: VendorRecord) => {
      setTarget(vendor)
      setView(next)
    },
    [],
  )

  const submitForm = useCallback(
    (values: VendorFormValues) => {
      if (target) {
        update.mutate({ id: target.id, ...values }, { onSuccess: close })
        return
      }
      create.mutate(values, { onSuccess: close })
    },
    [target, create, update, close],
  )

  const confirmStatus = useCallback(
    (next: VendorStatus, note: string) => {
      if (!target) {
        return
      }
      status.mutate(
        { id: target.id, status: next, note: note || undefined },
        { onSuccess: close },
      )
    },
    [target, status, close],
  )

  const confirmDelete = useCallback(
    (onRemoved?: () => void) => {
      if (!target) {
        return
      }
      remove.mutate(
        { id: target.id, label: target.name },
        {
          onSuccess: () => {
            close()
            onRemoved?.()
          },
        },
      )
    },
    [target, remove, close],
  )

  return {
    target,
    view,
    isPending: create.isPending || update.isPending || status.isPending || remove.isPending,
    openAdd,
    openEdit: openFor('form'),
    openStatus: openFor('status'),
    openDelete: openFor('delete'),
    close,
    submitForm,
    confirmStatus,
    confirmDelete,
  }
}
