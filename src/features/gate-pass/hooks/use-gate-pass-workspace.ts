import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import { DuplicateSubmissionError } from '../api/gate-pass-api'
import type { GatePassFormValues } from '../schemas/gate-pass-schemas'
import type { DuplicateCandidate, GatePassInput, GatePassRecord } from '../types'
import {
  reportGatePassError,
  useCreateGatePass,
  useSubmitGatePass,
  useUpdateGatePass,
  useUploadGatePassDocument,
} from './use-gate-pass-mutations'

/**
 * The stages a submission passes through, and the words shown while it does.
 *
 * A gate pass is filed in three separate calls — the record, then the scanned
 * document, then the submission — because the document key contains the gate
 * pass id, so the record has to exist before its scan can be stored. On a cold
 * Render instance that is a long enough wait that silence reads as a freeze,
 * which is why the stage is a first-class piece of state rather than one
 * spinner.
 */
export type SubmissionStage = 'idle' | 'saving' | 'uploading' | 'finalizing'

export const STAGE_LABELS: Record<Exclude<SubmissionStage, 'idle'>, string> = {
  saving: 'Saving gate pass…',
  uploading: 'Uploading document…',
  finalizing: 'Finalising…',
}

/** A scan waiting to be uploaded, or the one already stored on the record. */
export interface StagedDocument {
  file: File
  /** Only ever a real count, reported by the scanner agent. */
  pageCount: number
}

export interface WorkspaceController {
  /** The saved record, once one exists. Null until the first save. */
  record: GatePassRecord | null
  stage: SubmissionStage
  uploadProgress: number | null
  isBusy: boolean
  /** Candidates behind the duplicate question, or an empty list. */
  duplicates: DuplicateCandidate[]
  dismissDuplicates: () => void
  /**
   * Both writes resolve with the record when they succeeded and null when they
   * did not, rather than with nothing. That is what lets the caller mark the
   * scanned sheet this entry came from and move to the next one — and what
   * keeps the decision about what happens next out of this hook.
   */
  saveDraft: (values: GatePassFormValues) => Promise<GatePassRecord | null>
  submit: (
    values: GatePassFormValues,
    options?: { acknowledgeDuplicate?: boolean },
  ) => Promise<GatePassRecord | null>
  /**
   * Forgets the record this workspace has been writing to, so the next save
   * creates a new one. Filing a stack of gate passes is one workspace and many
   * records; without this the second sheet would overwrite the first.
   */
  startNewEntry: () => void
  lastSavedAt: Date | null
}

interface UseWorkspaceOptions {
  /** An existing record when editing; null when starting from scratch. */
  initialRecord: GatePassRecord | null
  /** The scan waiting to be filed, read at submit time. */
  getStagedDocument: () => StagedDocument | null
  /** Cleared once its bytes are safely on the record. */
  onDocumentStored: () => void
}

/** The form's strings, as the API wants them. */
export function toGatePassInput(values: GatePassFormValues): GatePassInput {
  return {
    tripDo: values.tripDo,
    tripDate: values.tripDate,
    csd: values.csd,
    unit: values.unit,
    customerName: values.customerName,
    vehicleNo: values.vehicleNo,
    referenceType: values.referenceType,
    // The unused side is sent empty rather than stale: the server clears it
    // either way, and sending last week's zone would be a lie in the payload.
    zone: values.referenceType === 'Zone' ? values.zone : '',
    po: values.referenceType === 'PO' ? values.po : '',
    // The form holds every quantity as a string, because that is what a number
    // input gives back; the payload wants numbers.
    items: values.items.map((item) => ({
      productName: item.productName,
      model: item.model,
      qty: Number.parseInt(item.qty, 10),
    })),
  }
}

export function useGatePassWorkspace({
  initialRecord,
  getStagedDocument,
  onDocumentStored,
}: UseWorkspaceOptions): WorkspaceController {
  const [record, setRecord] = useState<GatePassRecord | null>(initialRecord)
  const [stage, setStage] = useState<SubmissionStage>('idle')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([])
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const create = useCreateGatePass()
  const update = useUpdateGatePass()
  const upload = useUploadGatePassDocument()
  const send = useSubmitGatePass()

  /**
   * The record id as the *current* attempt knows it. A retry after a failed
   * upload must not create a second gate pass, so once a record exists its id
   * is read from here rather than from state a re-render might not have caught
   * up with.
   */
  const recordRef = useRef<GatePassRecord | null>(initialRecord)

  const remember = useCallback((next: GatePassRecord) => {
    recordRef.current = next
    setRecord(next)
    setLastSavedAt(new Date())
  }, [])

  /** Creates the record, or updates the one this workspace already made. */
  const persist = useCallback(
    async (values: GatePassFormValues): Promise<GatePassRecord> => {
      const input = toGatePassInput(values)
      const existing = recordRef.current

      const saved = existing
        ? await update.mutateAsync({ id: existing.id, input })
        : await create.mutateAsync(input)

      remember(saved)
      return saved
    },
    [create, update, remember],
  )

  const storeDocument = useCallback(
    async (id: string, staged: StagedDocument): Promise<GatePassRecord> => {
      setUploadProgress(0)
      try {
        const saved = await upload.mutateAsync({
          id,
          file: staged.file,
          pageCount: staged.pageCount,
          onProgress: setUploadProgress,
        })
        remember(saved)
        onDocumentStored()
        return saved
      } finally {
        setUploadProgress(null)
      }
    },
    [upload, remember, onDocumentStored],
  )

  const saveDraft = useCallback(
    async (values: GatePassFormValues): Promise<GatePassRecord | null> => {
      setStage('saving')
      try {
        const saved = await persist(values)

        const staged = getStagedDocument()
        let current = saved

        if (staged) {
          setStage('uploading')
          current = await storeDocument(saved.id, staged)
        }

        toast.success('Draft saved', {
          description: `${current.gatePassId} is saved. You can finish it later.`,
        })

        return current
      } catch (error) {
        reportGatePassError(error as ApiError)
        return null
      } finally {
        setStage('idle')
      }
    },
    [persist, getStagedDocument, storeDocument],
  )

  const submit = useCallback(
    async (
      values: GatePassFormValues,
      options?: { acknowledgeDuplicate?: boolean },
    ): Promise<GatePassRecord | null> => {
      setDuplicates([])
      setStage('saving')

      try {
        const saved = await persist(values)

        const staged = getStagedDocument()
        let current = saved

        if (staged) {
          setStage('uploading')
          current = await storeDocument(saved.id, staged)
        }

        if (!current.document) {
          // The server refuses this too; saying it here saves a round trip and
          // points at the panel that needs attention.
          toast.error('Scan the gate pass first', {
            description: 'A submitted gate pass has to carry its scanned document.',
          })
          return null
        }

        setStage('finalizing')
        const submitted = await send.mutateAsync({
          id: current.id,
          acknowledgeDuplicate: options?.acknowledgeDuplicate ?? false,
        })

        remember(submitted)
        return submitted
      } catch (error) {
        if (error instanceof DuplicateSubmissionError) {
          // Not a failure: a question the operator is the only one who can
          // answer. The record is saved either way, so nothing is lost.
          setDuplicates(error.duplicates)
          return null
        }
        reportGatePassError(error as ApiError)
        return null
      } finally {
        setStage('idle')
      }
    },
    [persist, getStagedDocument, storeDocument, send, remember],
  )

  /**
   * Ends this entry. The next save starts a new gate pass rather than
   * updating the one just filed.
   */
  const startNewEntry = useCallback(() => {
    recordRef.current = null
    setRecord(null)
    setDuplicates([])
  }, [])

  return {
    record,
    stage,
    uploadProgress,
    isBusy: stage !== 'idle',
    duplicates,
    dismissDuplicates: () => setDuplicates([]),
    saveDraft,
    submit,
    startNewEntry,
    lastSavedAt,
  }
}
