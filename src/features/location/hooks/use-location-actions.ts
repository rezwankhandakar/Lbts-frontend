import { useCallback, useState } from 'react'
import type { LocationFormValues } from '../components/location-form-dialog'
import type { LocationRecord } from '../types'
import { useCreateLocation, useDeleteLocation, useUpdateLocation } from './use-locations'

type OverlayView = 'form' | 'delete'

export interface LocationActionsController {
  target: LocationRecord | null
  view: OverlayView | null
  isPending: boolean
  openAdd: () => void
  openEdit: (location: LocationRecord) => void
  openDelete: (location: LocationRecord) => void
  close: () => void
  submitForm: (values: LocationFormValues) => void
  confirmDelete: () => void
  /** One-click, no dialog: reversible, and the toast says what happened. */
  toggleActive: (location: LocationRecord) => void
}

/**
 * Owns which overlay is open, for which row, and runs the mutation behind it.
 *
 * Keeping this in one place is what stops the page growing a tangle of
 * booleans — and it guarantees an overlay only closes once its write actually
 * succeeded, so a refused duplicate leaves the Admin looking at the form and
 * the error rather than at a list that silently did nothing.
 */
export function useLocationActions(): LocationActionsController {
  const [target, setTarget] = useState<LocationRecord | null>(null)
  const [view, setView] = useState<OverlayView | null>(null)

  const create = useCreateLocation()
  const update = useUpdateLocation()
  const remove = useDeleteLocation()

  const close = useCallback(() => setView(null), [])

  const openAdd = useCallback(() => {
    setTarget(null)
    setView('form')
  }, [])

  const openEdit = useCallback((location: LocationRecord) => {
    setTarget(location)
    setView('form')
  }, [])

  const openDelete = useCallback((location: LocationRecord) => {
    setTarget(location)
    setView('delete')
  }, [])

  const submitForm = useCallback(
    (values: LocationFormValues) => {
      if (target) {
        update.mutate({ id: target.id, ...values }, { onSuccess: close })
        return
      }
      create.mutate(values, { onSuccess: close })
    },
    [target, create, update, close],
  )

  const confirmDelete = useCallback(() => {
    if (!target) {
      return
    }
    remove.mutate(
      { id: target.id, label: `${target.district} / ${target.thana}` },
      { onSuccess: close },
    )
  }, [target, remove, close])

  /**
   * Taking a row out of use, or putting it back.
   *
   * No confirmation: it changes nothing about any existing challan, it is
   * undone by pressing it again, and the toast says which way it went. A
   * dialog here would be ceremony around a switch.
   */
  const toggleActive = useCallback(
    (location: LocationRecord) => {
      update.mutate({ id: location.id, isActive: !location.isActive })
    },
    [update],
  )

  return {
    target,
    view,
    isPending: create.isPending || update.isPending || remove.isPending,
    openAdd,
    openEdit,
    openDelete,
    close,
    submitForm,
    confirmDelete,
    toggleActive,
  }
}
