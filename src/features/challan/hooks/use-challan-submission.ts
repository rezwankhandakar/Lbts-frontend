import { useCallback, useState } from 'react'
import type { ApiError } from '@/lib/axios'
import { DuplicateChallanError, PageRangeConflictError } from '../api/challan-api'
import { SourcePdfError, extractPageRangeAsFile } from '../lib/pdf-source'
import type { ChallanEntry } from '../lib/challan-session'
import type {
  ChallanRecord,
  ChallanValues,
  DuplicateChallanCandidate,
  PageRangeProblem,
} from '../types'
import { reportChallanError, useSubmitChallan } from './use-challan-mutations'

/**
 * The stages a submission passes through, and the words shown while it does.
 *
 * Three, and all three are real. The operator's browser cuts the challan's
 * pages out of the source PDF, uploads them, and then waits while the server
 * allocates the two numbers, draws the barcode, builds the back page, merges
 * the document and writes it to R2. Only the first two are observable from
 * here, so only the first two are ticked — the third is named for what the
 * server is doing rather than split into steps this side cannot actually see
 * happen. A progress list that ticks stages nobody measured is a worse lie
 * than a spinner.
 */
export type SubmissionStage = 'idle' | 'extracting' | 'uploading' | 'finalizing'

export const SUBMISSION_STAGES: Exclude<SubmissionStage, 'idle'>[] = [
  'extracting',
  'uploading',
  'finalizing',
]

export const STAGE_LABELS: Record<Exclude<SubmissionStage, 'idle'>, string> = {
  extracting: 'Cutting the challan pages out of the PDF',
  uploading: 'Uploading the challan pages',
  finalizing: 'Numbering, barcode, back page and document',
}

export interface SubmissionContext {
  sessionKey: string
  sourceBytes: Uint8Array
  sourceFileName: string
  sourcePageCount: number
}

export interface ChallanSubmissionController {
  stage: SubmissionStage
  uploadProgress: number | null
  isBusy: boolean
  /** Candidates behind the duplicate question, or an empty list. */
  duplicates: DuplicateChallanCandidate[]
  dismissDuplicates: () => void
  /** A page range the server says is already taken, if that is why it failed. */
  rangeProblem: PageRangeProblem | null
  dismissRangeProblem: () => void
  /** The record just filed, for the success panel. Cleared by the next entry. */
  lastFiled: ChallanRecord | null
  clearLastFiled: () => void
  /**
   * Files one entry. Resolves with the record on success and null when it did
   * not happen — so the caller can mark the queue and move on, and the
   * decision about what happens next stays out of this hook.
   */
  submit: (
    entry: ChallanEntry,
    values: ChallanValues,
    options?: { acknowledgeDuplicate?: boolean },
  ) => Promise<ChallanRecord | null>
}

/**
 * Files one challan out of the temporary source PDF.
 *
 * The whole of the module's storage rule is visible in the first line of
 * `submit`: the pages for *this* challan are cut out of the file in memory and
 * those are what get uploaded. The source PDF itself never leaves the browser,
 * so filing fifteen challans out of a 24-page file sends fifteen small
 * extracts rather than the same 24 pages fifteen times.
 *
 * The entry's `submissionKey` is used exactly as it was created — never
 * regenerated on a retry. That is what makes "submit anyway" after a duplicate
 * question, or a second click on a slow connection, land on the same record
 * rather than a second one: the server recognises the key and answers with
 * what the first attempt produced.
 */
export function useChallanSubmission(context: SubmissionContext): ChallanSubmissionController {
  const [stage, setStage] = useState<SubmissionStage>('idle')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [duplicates, setDuplicates] = useState<DuplicateChallanCandidate[]>([])
  const [rangeProblem, setRangeProblem] = useState<PageRangeProblem | null>(null)
  const [lastFiled, setLastFiled] = useState<ChallanRecord | null>(null)

  const send = useSubmitChallan()

  const submit = useCallback(
    async (
      entry: ChallanEntry,
      values: ChallanValues,
      options?: { acknowledgeDuplicate?: boolean },
    ): Promise<ChallanRecord | null> => {
      setDuplicates([])
      setRangeProblem(null)
      setStage('extracting')

      try {
        const pages = await extractPageRangeAsFile(
          context.sourceBytes,
          entry.startPage,
          entry.endPage,
          `challan-pages-${entry.startPage}-${entry.endPage}`,
        )

        setStage('uploading')
        setUploadProgress(0)

        const record = await send.mutateAsync({
          payload: {
            ...values,
            sessionKey: context.sessionKey,
            sourceFileName: context.sourceFileName,
            sourcePageCount: context.sourcePageCount,
            sourcePageStart: entry.startPage,
            sourcePageEnd: entry.endPage,
            // Created with the entry, not here. A key made at submit time
            // would be new on every click, and two clicks would be two
            // challans.
            submissionKey: entry.submissionKey,
            acknowledgeDuplicate: options?.acknowledgeDuplicate ?? false,
          },
          pages,
          onProgress: (percent) => {
            setUploadProgress(percent)
            // The bytes are all sent; everything after this is the server
            // building the document, which is where the wait actually is.
            if (percent >= 99) {
              setStage('finalizing')
            }
          },
        })

        setLastFiled(record)
        return record
      } catch (error) {
        if (error instanceof DuplicateChallanError) {
          // Not a failure: a question only the operator can answer. Nothing
          // was written, and the same key resubmits the same entry.
          setDuplicates(error.duplicates)
          return null
        }

        if (error instanceof PageRangeConflictError) {
          setRangeProblem(error.problem)
          return null
        }

        if (error instanceof SourcePdfError) {
          // Never reached the network: the source PDF could not be sliced.
          reportChallanError({
            message: error.message,
            statusCode: 0,
            errorSources: [],
            body: null,
          })
          return null
        }

        reportChallanError(error as ApiError)
        return null
      } finally {
        setStage('idle')
        setUploadProgress(null)
      }
    },
    [
      context.sessionKey,
      context.sourceBytes,
      context.sourceFileName,
      context.sourcePageCount,
      send,
    ],
  )

  return {
    stage,
    uploadProgress,
    isBusy: stage !== 'idle',
    duplicates,
    dismissDuplicates: useCallback(() => setDuplicates([]), []),
    rangeProblem,
    dismissRangeProblem: useCallback(() => setRangeProblem(null), []),
    lastFiled,
    clearLastFiled: useCallback(() => setLastFiled(null), []),
    submit,
  }
}
