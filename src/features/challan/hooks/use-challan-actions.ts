import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import { printDocument } from '@/lib/print-document'
import { saveBlob } from '@/lib/save-blob'
import { useCurrentRole } from '@/hooks/use-current-role'
import { downloadChallanBatch, fetchChallanDocument } from '../api/challan-api'
import { canWriteChallans } from '../types'
import type { ChallanRecord } from '../types'
import {
  reportChallanError,
  useBatchPrinted,
  useChallanPrinted,
  useDeleteChallan,
} from './use-challan-mutations'

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
  /**
   * Records that a challan was printed, or takes the mark back. Called for the
   * operator by every print path here, and directly by the row menu for the
   * copy that came off somebody else's printer.
   */
  setPrinted: (record: ChallanRecord, printed: boolean) => void
  /** False for a role that may read and print but not write — CEO. */
  canMarkPrinted: boolean
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
  /**
   * Destructured rather than held whole: TanStack Query guarantees `mutate`
   * is referentially stable while the result object around it is not, and the
   * details page puts `setPrinted` in an effect's dependency list — an
   * unstable one there would re-run the effect and cancel the print it was
   * about to start.
   */
  const { mutate: markPrinted } = useChallanPrinted()

  /**
   * Whether this viewer's print should leave a mark on the record.
   *
   * Printing is a read, so every role the module is open to may do it; the
   * mark is a write, and `CEO` writes nothing here. Asking the role rather
   * than sending the request and swallowing a 403 is what keeps a print by a
   * CEO from ending in an error toast about something they did not ask for.
   */
  const canMarkPrinted = canWriteChallans(useCurrentRole())

  const setPrinted = useCallback(
    (record: ChallanRecord, next: boolean) => {
      if (!canMarkPrinted) {
        return
      }
      markPrinted({ id: record.id, printed: next })
    },
    [canMarkPrinted, markPrinted],
  )

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
  const printNow = useCallback(
    async (record: ChallanRecord) => {
      const toastId = toast.loading('Preparing to print…')

      try {
        const blob = await fetchChallanDocument(record.id)
        const url = URL.createObjectURL(blob)

        toast.dismiss(toastId)
        printDocument(url, 'application/pdf')
        window.setTimeout(() => URL.revokeObjectURL(url), PRINT_REVOKE_DELAY)

        /**
         * Marked once the document has been handed to the print dialog, and
         * not before: a fetch that failed printed nothing. It cannot be marked
         * *after* the paper comes out either — no browser reports that — so
         * this is the last honest moment, and the mark stays correctable.
         */
        setPrinted(record, true)
      } catch (error) {
        toast.dismiss(toastId)
        reportChallanError(error as ApiError)
      }
    },
    [setPrinted],
  )

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
    setPrinted,
    canMarkPrinted,
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

export interface BatchPrintController {
  isPrinting: boolean
  print: (batchId: string) => void
}

/**
 * Printing a whole source file: every challan it produced, as one document,
 * in the order the pages arrived.
 *
 * This is the shape of the actual job. The corporate office sends a PDF of
 * fifteen challans; the operator files them one at a time, and then has to put
 * fifteen printed challans on the counter. Printing them one record at a time
 * means fifteen dialogs, fifteen chances to miss one, and no way afterwards to
 * say which were missed — so the batch is assembled server-side and sent to
 * the printer once.
 *
 * The bytes are the same ones Download hands over, from the same endpoint: a
 * separate assembly path for printing could quietly come to disagree with the
 * saved file about what a batch contains, and the printed copy is the one that
 * goes out with the goods.
 *
 * Marking follows the dispatch, not the paper. The browser cannot learn
 * whether the dialog ended in Print or Cancel, so the batch is marked when the
 * document reaches the dialog and the mark can be cleared again on the batch
 * page — the same bargain `printNow` makes for one record, and the same one
 * marking a page blank makes.
 */
export function useBatchPrint(): BatchPrintController {
  const [isPrinting, setIsPrinting] = useState(false)
  const { mutate: markBatchPrinted } = useBatchPrinted()
  const canMarkPrinted = canWriteChallans(useCurrentRole())

  const print = useCallback(
    (batchId: string) => {
      if (isPrinting) {
        return
      }

      setIsPrinting(true)
      const toastId = toast.loading('Assembling the batch PDF to print…')

      void downloadChallanBatch(batchId)
        .then(({ blob }) => {
          const url = URL.createObjectURL(blob)

          toast.dismiss(toastId)
          printDocument(url, 'application/pdf')
          window.setTimeout(() => URL.revokeObjectURL(url), PRINT_REVOKE_DELAY)

          if (canMarkPrinted) {
            markBatchPrinted({ batchId, printed: true })
          }
        })
        .catch((error: ApiError) => {
          toast.dismiss(toastId)
          reportChallanError(error)
        })
        .finally(() => setIsPrinting(false))
    },
    [isPrinting, canMarkPrinted, markBatchPrinted],
  )

  return { isPrinting, print }
}
