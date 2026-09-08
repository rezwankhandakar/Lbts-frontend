import { useCallback, useState } from 'react'
import type { ProductRateFormValues } from '../components/product-rate-form-dialog'
import type { ProductRateRecord } from '../types'
import {
  productRateLabel,
  useCreateProductRate,
  useDeleteProductRate,
  useUpdateProductRate,
} from './use-product-rates'

type OverlayView = 'form' | 'delete'

export interface ProductRateActionsController {
  target: ProductRateRecord | null
  view: OverlayView | null
  isPending: boolean
  openAdd: () => void
  openEdit: (record: ProductRateRecord) => void
  openDelete: (record: ProductRateRecord) => void
  close: () => void
  submitForm: (values: ProductRateFormValues) => void
  confirmDelete: () => void
  /** One-click, no dialog: reversible, and the toast says what happened. */
  toggleActive: (record: ProductRateRecord) => void
}

/**
 * Owns which overlay is open, for which row, and runs the mutation behind it.
 *
 * Keeping this in one place is what stops the page growing a tangle of
 * booleans — and it guarantees an overlay only closes once its write actually
 * succeeded, so a refused duplicate leaves the Admin looking at the form and
 * the error rather than at a list that silently did nothing.
 */
export function useProductRateActions(): ProductRateActionsController {
  const [target, setTarget] = useState<ProductRateRecord | null>(null)
  const [view, setView] = useState<OverlayView | null>(null)

  const create = useCreateProductRate()
  const update = useUpdateProductRate()
  const remove = useDeleteProductRate()

  const close = useCallback(() => setView(null), [])

  const openAdd = useCallback(() => {
    setTarget(null)
    setView('form')
  }, [])

  const openEdit = useCallback((record: ProductRateRecord) => {
    setTarget(record)
    setView('form')
  }, [])

  const openDelete = useCallback((record: ProductRateRecord) => {
    setTarget(record)
    setView('delete')
  }, [])

  const submitForm = useCallback(
    (values: ProductRateFormValues) => {
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
    remove.mutate({ id: target.id, label: productRateLabel(target) }, { onSuccess: close })
  }, [target, remove, close])

  /**
   * Taking a row out of use, or putting it back.
   *
   * No confirmation: it changes nothing about any challan already charged from
   * it, it is undone by pressing it again, and the toast says which way it
   * went. A dialog here would be ceremony around a switch.
   */
  const toggleActive = useCallback(
    (record: ProductRateRecord) => {
      update.mutate({ id: record.id, isActive: !record.isActive })
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
