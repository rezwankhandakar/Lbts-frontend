import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import { printDocument } from '@/lib/print-document'
import { saveBlob } from '@/lib/save-blob'
import { downloadChallanBatch, fetchChallanDocument } from '../api/challan-api'
import type { ChallanRecord } from '../types'
import { reportChallanError, useDeleteChallan } from './use-challan-mutations'

export interface ChallanActionsController {
  /** The record the delete confirmation is open for. */
  target: ChallanRecord | null
  isConfirmingDelete: boolean
  isPending: boolean
  openDelete: (record: ChallanRecord) => void
  close: () => void
  confirmDelete: () => void
  download: (record: ChallanRecord) => void
  print: (record: ChallanRecord) => void
  /** Prints without leaving the page — for the workspace, mid-stack. */
  printNow: (record: ChallanRecord) => void
  edit: (record: ChallanRecord) => void
  open: (record: ChallanRecord) => void
  openBatch: (record: ChallanRecord) => void
}

/** Some browsers cancel a print whose object URL is revoked on the same tick. */
const PRINT_REVOKE_DELAY = 30_000

export interface ChallanActionsOptions {
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
export function useChallanActions({
  onDeleted,
}: ChallanActionsOptions = {}): ChallanActionsController {
  const navigate = useNavigate()

  const [target, setTarget] = useState<ChallanRecord | null>(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const remove = useDeleteChallan()

  const close = useCallback(() => setIsConfirmingDelete(false), [])

  const openDelete = useCallback((record: ChallanRecord) => {
    setTarget(record)
    setIsConfirmingDelete(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!target) {
      return
    }
    remove.mutate(
      { id: target.id, challanNumber: target.challanNumber },
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
  const download = useCallback(async (record: ChallanRecord) => {
    const toastId = toast.loading('Preparing the challan…')

    try {
      const blob = await fetchChallanDocument(record.id)
      saveBlob(blob, `${record.challanNumber}.pdf`)
      toast.success('Challan downloaded', { id: toastId })
    } catch (error) {
      toast.dismiss(toastId)
      reportChallanError(error as ApiError)
    }
  }, [])

  /**
   * Printing happens on the details page, which is where the document is
   * already fetched and held. From a row this navigates there and asks it to
   * print, rather than building a second print path — the same arrangement the
   * Gate Pass records list uses.
   */
  const print = useCallback(
    (record: ChallanRecord) => {
      navigate(`/challan/${record.id}?print=1`)
    },
    [navigate],
  )

  /**
   * Printing without leaving the page.
   *
   * The workspace needs this rather than the navigating version: an operator
   * halfway through a stack who prints the challan they just filed must not
   * lose the queue and the source PDF holding it. So the bytes are fetched,
   * printed from an off-screen frame, and the object URL is released once the
   * print dialog has had time to take a copy — the same delay `saveBlob` uses,
   * and for the same reason.
   */
  const printNow = useCallback(async (record: ChallanRecord) => {
    const toastId = toast.loading('Preparing to print…')

    try {
      const blob = await fetchChallanDocument(record.id)
      const url = URL.createObjectURL(blob)

      toast.dismiss(toastId)
      printDocument(url, 'application/pdf')
      window.setTimeout(() => URL.revokeObjectURL(url), PRINT_REVOKE_DELAY)
    } catch (error) {
      toast.dismiss(toastId)
      reportChallanError(error as ApiError)
    }
  }, [])

  return {
    target,
    isConfirmingDelete,
    isPending: remove.isPending,
    openDelete,
    close,
    confirmDelete,
    download: (record) => void download(record),
    print,
    printNow: (record) => void printNow(record),
    edit: (record) => navigate(`/challan/${record.id}/edit`),
    open: (record) => navigate(`/challan/${record.id}`),
    openBatch: (record) => navigate(`/challan/batch/${record.batchId}`),
  }
}

export interface BatchDownloadController {
  isDownloading: boolean
  download: (batchId: string) => void
}

/**
 * Downloading a completed batch as one PDF.
 *
 * Deliberately not a query: it is something an operator asks for once, and
 * caching a multi-megabyte workbook of merged challans against a key would
 * hold it in memory long after the file was saved. Not a mutation either —
 * nothing on the server changes — so it owns its own pending flag.
 *
 * The toast stays up for the whole call on purpose. The server has to read
 * every challan document out of R2 and merge them before a single byte
 * arrives, and silence for that long reads as a button that did nothing.
 */
export function useBatchDownload(): BatchDownloadController {
  const [isDownloading, setIsDownloading] = useState(false)

  const download = useCallback(
    (batchId: string) => {
      if (isDownloading) {
        return
      }

      setIsDownloading(true)
      const toastId = toast.loading('Assembling the batch PDF…')

      void downloadChallanBatch(batchId)
        .then(({ blob, filename }) => {
          saveBlob(blob, filename)
          toast.success('Batch downloaded', { id: toastId })
        })
        .catch((error: ApiError) => {
          toast.dismiss(toastId)
          reportChallanError(error)
        })
        .finally(() => setIsDownloading(false))
    },
    [isDownloading],
  )

  return { isDownloading, download }
}
