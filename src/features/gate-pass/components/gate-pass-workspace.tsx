import { useCallback, useMemo, useState } from 'react'
import { ArrowLeft, ScanLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useGatePassDocument } from '../hooks/use-gate-pass-document'
import { useGatePassWorkspace } from '../hooks/use-gate-pass-workspace'
import type { StagedDocument } from '../hooks/use-gate-pass-workspace'
import { useJoinSheets } from '../hooks/use-join-sheets'
import { useScanBatch } from '../hooks/use-scan-batch'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import type { GatePassFormValues } from '../schemas/gate-pass-schemas'
import { EMPTY_GATE_PASS_FORM } from '../schemas/gate-pass-schemas'
import { isFiledStatus, needsReverificationAfterEdit } from '../types'
import type { GatePassRecord } from '../types'
import { BatchComplete } from './batch-complete'
import { DuplicateDialog } from './duplicate-dialog'
import { GatePassEntryForm } from './gate-pass-entry-form'
import { GatePassScannerPanel } from './gate-pass-scanner-panel'
import { GatePassStatusBadge } from './gate-pass-status-badge'
import { SubmissionOverlay } from './submission-overlay'
import { WorkspaceTabs } from './workspace-tabs'
import type { WorkspacePane } from './workspace-tabs'

interface GatePassWorkspaceProps {
  /** An existing record when correcting a rejected pass; null when starting new. */
  initialRecord: GatePassRecord | null
}

/** A saved record, back in the shape the form holds it. */
function toFormValues(record: GatePassRecord): GatePassFormValues {
  return {
    tripDo: record.tripDo,
    tripDate: record.tripDate,
    csd: record.csd,
    unit: record.unit,
    customerName: record.customerName,
    vehicleNo: record.vehicleNo,
    items: record.items.map((item) => ({
      productName: item.productName,
      model: item.model,
      qty: String(item.qty),
    })),
    referenceType: record.referenceType,
    zone: record.zone ?? '',
    po: record.po ?? '',
  }
}

/**
 * Fields worth keeping between two sheets off the same stack.
 *
 * Ten challans from one depot on one day repeat these three exactly, and
 * retyping them ten times is where transcription errors come from. Everything
 * that identifies the individual delivery — the DO, the customer, the vehicle,
 * the goods — starts empty every time, because carrying one of those over is
 * how the wrong trip gets filed.
 *
 * The form says out loud that it did this, and every field is editable.
 */
const CARRIED_FIELDS = ['tripDate', 'csd', 'unit'] as const

function carryOver(previous: GatePassFormValues): GatePassFormValues {
  const next = { ...EMPTY_GATE_PASS_FORM }
  for (const field of CARRIED_FIELDS) {
    next[field] = previous[field]
  }
  return next
}

/**
 * The gate pass workspace: the form on the left, the scanner and the scanned
 * sheet on the right.
 *
 * The split is the entire design. An operator holds a stack of printed
 * challans, scans the lot in one pass, and then reads each image on screen
 * while typing the values beside it — so the two have to be visible at once,
 * at a size where the vehicle number on a 300 dpi scan is legible. Below a
 * large screen that is not possible, and the two become tabs rather than a
 * long scroll.
 *
 * Submitting files the sheet being shown, marks it in the tray, clears the
 * form and moves to the next sheet. That loop is the job.
 */
export function GatePassWorkspace({ initialRecord }: GatePassWorkspaceProps) {
  const navigate = useNavigate()

  const batch = useScanBatch()
  const joining = useJoinSheets(batch)
  const [pane, setPane] = useState<WorkspacePane>('form')
  const [isFormDirty, setIsFormDirty] = useState(false)

  /**
   * Correcting an existing gate pass is one record and one document, so a
   * multi-sheet scan is taken as a single document there rather than a stack.
   */
  const allowBatch = initialRecord === null

  /**
   * Sheets staged but not yet filed. In a correction these are pages of one
   * scan, so more than one of them is a question the operator has to answer
   * before anything is written — several sheets and one document slot means
   * saving would quietly keep whichever was on screen and drop the rest.
   */
  const stagedSheets = batch.items.filter((item) => item.status === 'pending').length
  const hasUnjoinedSheets = !allowBatch && stagedSheets > 1

  /**
   * Remounts the form between entries. Changing the key is what clears nine
   * fields at once without React Hook Form having to reset each of them, and
   * it guarantees no value from the last challan survives into the next.
   */
  const [entryKey, setEntryKey] = useState(0)
  const [carried, setCarried] = useState<GatePassFormValues | null>(null)
  const [carriedFrom, setCarriedFrom] = useState<string | null>(null)

  const activeItem = batch.active

  const getStagedDocument = useCallback(
    (): StagedDocument | null =>
      activeItem ? { file: activeItem.file, pageCount: activeItem.pageCount } : null,
    [activeItem],
  )

  const workspace = useGatePassWorkspace({
    initialRecord,
    getStagedDocument,
    // The sheet stays in the tray after its bytes land — it is marked when the
    // entry finishes, not when the upload does.
    onDocumentStored: () => undefined,
  })

  const record = workspace.record
  const stored = useGatePassDocument(record?.id ?? null, Boolean(record?.document))

  const hasDocument = Boolean(activeItem) || Boolean(record?.document)

  // Losing a stack of transcribed challans to a stray reload is a real cost;
  // losing an empty form is not.
  useUnsavedChanges(isFormDirty || batch.remaining > 0)

  const defaultValues = useMemo(() => {
    if (initialRecord) {
      return toFormValues(initialRecord)
    }
    return carried ?? EMPTY_GATE_PASS_FORM
  }, [initialRecord, carried])

  /**
   * The values behind the duplicate question, kept so "submit anyway" resends
   * exactly what was asked about rather than re-reading a form the operator
   * may have touched while the dialog was open.
   */
  const [pendingValues, setPendingValues] = useState<GatePassFormValues | null>(null)

  /** Marks the sheet this entry came from, and sets up the next one. */
  const finishEntry = useCallback(
    (values: GatePassFormValues, saved: GatePassRecord, submitted: boolean) => {
      const item = activeItem

      // A correction is one record. Marking a sheet, forgetting the record and
      // carrying values forward are all queue moves, and running them here
      // would turn the next staged sheet into a second gate pass.
      if (!allowBatch || !item) {
        navigate(`/gate-pass/${saved.id}`, { replace: true })
        return
      }

      batch.markFiled(item.id, saved, submitted)
      workspace.startNewEntry()

      // One sheet on its own behaves exactly as before, so nothing is carried
      // and the operator lands on the record they just filed.
      if (!batch.isBatch) {
        navigate(`/gate-pass/${saved.id}`, { replace: true })
        return
      }

      setCarried(carryOver(values))
      setCarriedFrom(saved.gatePassId)
      setEntryKey((key) => key + 1)
      setIsFormDirty(false)
      setPane('form')
    },
    [activeItem, allowBatch, batch, workspace, navigate],
  )

  const handleSubmit = useCallback(
    async (values: GatePassFormValues, acknowledgeDuplicate = false) => {
      setPendingValues(values)
      const saved = await workspace.submit(values, { acknowledgeDuplicate })
      if (saved) {
        finishEntry(values, saved, true)
      }
    },
    [workspace, finishEntry],
  )

  const handleSaveDraft = useCallback(
    async (values: GatePassFormValues) => {
      const saved = await workspace.saveDraft(values)
      if (saved && batch.isBatch) {
        finishEntry(values, saved, false)
      }
    },
    [workspace, batch.isBatch, finishEntry],
  )

  /**
   * Correcting a record that has already been filed. Submitting it again is
   * not a legal move — it is already submitted, or already verified — so the
   * primary action saves and the entry ends on the record's own page, exactly
   * as a submission does.
   */
  const handleSaveChanges = useCallback(
    async (values: GatePassFormValues) => {
      const saved = await workspace.saveChanges(values)
      if (saved) {
        finishEntry(values, saved, false)
      }
    },
    [workspace, finishEntry],
  )

  const startNextStack = useCallback(() => {
    batch.clear()
    workspace.startNewEntry()
    setCarried(null)
    setCarriedFrom(null)
    setEntryKey((key) => key + 1)
  }, [batch, workspace])

  const showComplete = batch.isComplete && batch.isBatch

  /**
   * What the primary button does, and what it costs.
   *
   * A record still open is filed by submitting it. One already filed is
   * corrected by saving — and where a reviewer has already signed it off,
   * saying so on the button matters, because the save is what sends it back
   * to be checked again.
   */
  const isFiled = record !== null && isFiledStatus(record.status)
  const willReverify = record !== null && needsReverificationAfterEdit(record.status)

  const primaryLabel = !initialRecord
    ? batch.isBatch
      ? `Submit sheet ${batch.activePosition} of ${batch.total}`
      : 'Submit gate pass'
    : willReverify
      ? 'Save and re-verify'
      : isFiled
        ? 'Save changes'
        : 'Resubmit'

  return (
    <div className="relative mx-auto flex w-full max-w-[100rem] flex-col">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {initialRecord ? 'Correct gate pass' : 'New gate pass'}
            </h1>
            {record && <GatePassStatusBadge status={record.status} />}
          </div>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
            {initialRecord
              ? `${initialRecord.gatePassId} · check every field against the scan, then ${
                  isFiled ? 'save the correction' : 'submit'
                }.`
              : 'Scan the whole stack in one pass, then enter each sheet against the image beside it.'}
          </p>

          {willReverify && (
            <p className="mt-2 max-w-2xl rounded-lg border border-tone-amber/25 bg-tone-amber/5 px-3 py-2 text-xs leading-relaxed text-pretty">
              <span className="font-semibold">This gate pass has been verified.</span> That
              verification was against what it says now, so saving a correction — to the values or
              to the scan — returns it to a reviewer to be checked again.
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {workspace.lastSavedAt && (
            <p className="hidden text-xs text-muted-foreground sm:block">
              Saved {workspace.lastSavedAt.toLocaleTimeString(undefined, { timeStyle: 'short' })}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate('/gate-pass')}>
            <ArrowLeft data-icon="inline-start" aria-hidden />
            All gate passes
          </Button>
        </div>
      </header>

      {showComplete && (
        <div className="mb-4">
          <BatchComplete items={batch.items} onScanAnother={startNextStack} />
        </div>
      )}

      <div className="mb-3 lg:hidden">
        <WorkspaceTabs value={pane} onChange={setPane} hasDocument={hasDocument} />
      </div>

      <div className="grid min-h-0 gap-4 lg:grid-cols-2 lg:items-start xl:gap-6">
        <section
          aria-label="Gate pass details"
          className={cn(
            'overflow-hidden rounded-xl border bg-card shadow-sm',
            pane === 'form' ? 'block' : 'hidden',
            'lg:block',
          )}
        >
          <GatePassEntryForm
            key={entryKey}
            defaultValues={defaultValues}
            hasDocument={hasDocument}
            isBusy={workspace.isBusy || joining.isJoining}
            blockedReason={
              hasUnjoinedSheets
                ? `Join the ${stagedSheets} scanned sheets into one document first, or remove the ones that do not belong.`
                : null
            }
            canSaveDraft={!record || record.status === 'Draft'}
            primaryAction={isFiled ? 'save' : 'submit'}
            submitLabel={primaryLabel}
            carriedFrom={carriedFrom}
            onSaveDraft={(values) => void handleSaveDraft(values)}
            onSubmit={(values) =>
              void (isFiled ? handleSaveChanges(values) : handleSubmit(values))
            }
            onDirtyChange={setIsFormDirty}
          />
        </section>

        <div
          className={cn(pane === 'document' ? 'block' : 'hidden', 'lg:block', 'lg:sticky lg:top-0')}
        >
          <GatePassScannerPanel
            batch={batch}
            joining={joining}
            allowBatch={allowBatch}
            storedUrl={stored.url}
            storedMimeType={record?.document?.mimeType ?? null}
            storedPageCount={record?.document?.pageCount ?? null}
            isStoredLoading={stored.isLoading}
            storedError={stored.error}
            onRetryStored={stored.retry}
            disabled={workspace.isBusy}
          />

          {/* On a phone the form tab is where the submit button lives, so the
              document tab needs a way back to it. */}
          <Button
            variant="outline"
            className="mt-3 w-full lg:hidden"
            onClick={() => setPane('form')}
          >
            <ScanLine data-icon="inline-start" aria-hidden />
            Back to the details
          </Button>
        </div>
      </div>

      <SubmissionOverlay stage={workspace.stage} uploadProgress={workspace.uploadProgress} />

      <DuplicateDialog
        duplicates={workspace.duplicates}
        isSubmitting={workspace.isBusy}
        onDismiss={workspace.dismissDuplicates}
        onContinue={() => {
          if (pendingValues) {
            void handleSubmit(pendingValues, true)
          }
        }}
      />
    </div>
  )
}
