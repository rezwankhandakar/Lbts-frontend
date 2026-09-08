import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useAuthStore } from '@/stores/use-auth-store'
import { canManageAnyChallan, canWriteChallans } from '../types'
import type { ChallanBatchDetail } from '../types'
import type { SourcePdfExpectation } from './use-pdf-source'
import type { ResumedBatch } from './use-challan-session'
import { useChallanBatch } from './use-challans'

export interface ResumeBatchState {
  /** The batch named in the URL, or empty for an ordinary new session. */
  batchId: string
  isPending: boolean
  batch: ChallanBatchDetail | null
  /** Why the batch could not be loaded at all — a bad id, or no access. */
  loadError: string | null
  /**
   * Why this batch cannot be continued even though it loaded: it is finished,
   * or it belongs to somebody this operator may not file for. Null when it can.
   */
  problem: string | null
  /** What the session needs to rebuild where the last operator left off. */
  resume: ResumedBatch | null
  /** What the reopened file has to be, so a different PDF is refused. */
  expectation: SourcePdfExpectation | null
}

/**
 * The unfinished batch this workspace was sent to continue, if it was.
 *
 * `/challan/new?batch=<id>` is how the batch page hands the job back: the
 * source PDF was never stored, so the only way to file the pages nobody got to
 * is for somebody to open the same file again — and when they do, this is
 * everything the workspace has to know that the file itself cannot tell it.
 *
 * The two refusals are worth stating rather than leaving to the API. A
 * finished batch has no pages to file, and a colleague's batch is one this
 * operator may not add to; both would be refused at submit, which is after ten
 * fields have been typed. Saying so before the file is even opened is the
 * difference between a rule and a wasted transcription.
 */
export function useResumeBatch(): ResumeBatchState {
  const [params] = useSearchParams()
  const batchId = params.get('batch') ?? ''

  const role = useCurrentRole()
  const currentUserId = useAuthStore((state) => state.profile?.id ?? null)

  const query = useChallanBatch(batchId || undefined)
  const batch = batchId ? (query.data ?? null) : null

  const mayContinue =
    canWriteChallans(role) && (canManageAnyChallan(role) || batch?.createdBy?.id === currentUserId)

  const problem = !batch
    ? null
    : batch.isComplete
      ? 'Every page of this PDF is already accounted for, so there is nothing left to file from it.'
      : !mayContinue
        ? 'This batch was started by somebody else. Only they, or a Manager, can file the rest of its challans.'
        : null

  /**
   * Rebuilt from the records rather than from anything the last session held —
   * it held nothing that survived. Memoised on the batch, so re-rendering the
   * workspace does not hand the session a new object to reseed itself from.
   */
  const resume = useMemo<ResumedBatch | null>(() => {
    if (!batch) {
      return null
    }

    return {
      batchId: batch.id,
      filed: batch.challans.map((challan) => ({
        id: challan.id,
        challanNumber: challan.challanNumber,
        slNumber: challan.slNumber,
        startPage: challan.sourcePageStart,
        endPage: challan.sourcePageEnd,
      })),
      skippedPages: batch.skippedPages,
    }
  }, [batch])

  return {
    batchId,
    isPending: Boolean(batchId) && query.isPending,
    batch,
    loadError: batchId && !query.isPending && !batch ? loadMessage(query.error?.message) : null,
    problem,
    /**
     * Returned whatever `problem` says, because the two answer different
     * questions. `problem` decides whether a file may be opened against this
     * batch at all — asked once, before anything is open. This is what a
     * running session was built on, and it has to keep naming the same batch
     * afterwards: filing the last page of a file makes the batch complete,
     * which is a problem for *starting* and no reason to cut a session that is
     * already under way loose from the batch it has been filing into.
     */
    resume,
    expectation: batch
      ? { pageCount: batch.sourcePageCount, fileName: batch.sourceFileName }
      : null,
  }
}

function loadMessage(message: string | undefined): string {
  return (
    message ??
    'That batch could not be opened. It may have been removed when its last challan was deleted.'
  )
}
