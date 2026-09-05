import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import { fetchGatePassDocument } from '../api/gate-pass-api'
import { saveBlob } from '@/lib/save-blob'
import type { ReviewDecision } from '../components/review-dialog'
import type { GatePassRecord } from '../types'
import {
  reportGatePassError,
  useDeleteGatePass,
  useReviewGatePass,
} from './use-gate-pass-mutations'

export interface GatePassActionsController {
  /** The record a dialog is open for, and which dialog. */
  target: GatePassRecord | null
  decision: ReviewDecision | null
  isConfirmingDelete: boolean
  isPending: boolean
  openReview: (record: GatePassRecord, decision: ReviewDecision) => void
  openDelete: (record: GatePassRecord) => void
  close: () => void
  confirmReview: (note: string) => void
  confirmDelete: () => void
  download: (record: GatePassRecord) => void
  print: (record: GatePassRecord) => void
  edit: (record: GatePassRecord) => void
  open: (record: GatePassRecord) => void
}

export interface GatePassActionsOptions {
  /**
   * Run after a delete succeeds. The records list needs nothing — the query
   * invalidation refills it — but the details page is now showing a record
   * that no longer exists, and has to leave.
   */
  onDeleted?: () => void
}

/**
 * Owns which dialog is open, for which record, and runs the write behind it.
 *
 * Keeping this in one place is what stops the records page from growing a
 * tangle of booleans — and it guarantees a dialog only closes once its write
 * actually succeeded, so a failed action leaves the operator looking at the
 * error rather than at a list that silently did nothing.
 */
export function useGatePassActions({
  onDeleted,
}: GatePassActionsOptions = {}): GatePassActionsController {
  const navigate = useNavigate()

  const [target, setTarget] = useState<GatePassRecord | null>(null)
  const [decision, setDecision] = useState<ReviewDecision | null>(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const review = useReviewGatePass()
  const remove = useDeleteGatePass()

  const close = useCallback(() => {
    setDecision(null)
    setIsConfirmingDelete(false)
  }, [])

  const openReview = useCallback((record: GatePassRecord, next: ReviewDecision) => {
    setTarget(record)
    setIsConfirmingDelete(false)
    setDecision(next)
  }, [])

  const openDelete = useCallback((record: GatePassRecord) => {
    setTarget(record)
    setDecision(null)
    setIsConfirmingDelete(true)
  }, [])

  const confirmReview = useCallback(
    (note: string) => {
      if (!target || !decision) {
        return
      }
      review.mutate({ id: target.id, status: decision, note }, { onSuccess: close })
    },
    [target, decision, review, close],
  )

  const confirmDelete = useCallback(() => {
    if (!target) {
      return
    }
    remove.mutate(
      { id: target.id, gatePassId: target.gatePassId },
      {
        onSuccess: () => {
          close()
          onDeleted?.()
        },
      },
    )
  }, [target, remove, close, onDeleted])

  /**
   * Saving the document.
   *
   * The endpoint is authenticated, so a plain link would fetch it with no
   * token and land on a 401. The bytes come through axios and are handed to
   * the browser by `saveBlob`, which owns the object URL and revokes it.
   */
  const download = useCallback(async (record: GatePassRecord) => {
    if (!record.document) {
      return
    }

    const toastId = toast.loading('Preparing the document…')

    try {
      const blob = await fetchGatePassDocument(record.id)
      const extension = record.document.originalName.split('.').pop()?.toLowerCase() ?? 'pdf'

      saveBlob(blob, `${record.gatePassId}.${extension}`)
      toast.success('Document downloaded', { id: toastId })
    } catch (error) {
      toast.dismiss(toastId)
      reportGatePassError(error as ApiError)
    }
  }, [])

  /**
   * Printing happens on the details page, which is where the print sheet
   * lives. From the records list this navigates there and asks it to print,
   * rather than building a second print path for a row.
   */
  const print = useCallback(
    (record: GatePassRecord) => {
      navigate(`/gate-pass/${record.id}?print=1`)
    },
    [navigate],
  )

  return {
    target,
    decision,
    isConfirmingDelete,
    isPending: review.isPending || remove.isPending,
    openReview,
    openDelete,
    close,
    confirmReview,
    confirmDelete,
    download: (record) => void download(record),
    print,
    edit: (record) => navigate(`/gate-pass/${record.id}/edit`),
    open: (record) => navigate(`/gate-pass/${record.id}`),
  }
}
