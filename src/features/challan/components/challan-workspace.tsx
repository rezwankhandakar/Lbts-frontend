import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { cn } from '@/lib/utils'
import { useChallanActions } from '../hooks/use-challan-actions'
import { useBatchSkippedPages } from '../hooks/use-challan-mutations'
import { useChallanSession } from '../hooks/use-challan-session'
import { useChallanSubmission } from '../hooks/use-challan-submission'
import { usePdfSource } from '../hooks/use-pdf-source'
import type { SourcePdf } from '../lib/pdf-source'
import { fromChallanValues } from '../schemas/challan-schemas'
import { canWriteChallans } from '../types'
import type { ChallanValues } from '../types'
import { BatchCompletePanel } from './batch-complete-panel'
import { ChallanEntryForm } from './challan-entry-form'
import { ChallanFiledPanel } from './challan-filed-panel'
import { ChallanQueue } from './challan-queue'
import { DuplicateChallanDialog } from './duplicate-challan-dialog'
import { SessionProgressPanel } from './session-progress'
import { SourcePdfDropzone } from './source-pdf-dropzone'
import { SourcePdfPanel } from './source-pdf-panel'
import { SubmissionOverlay } from './submission-overlay'
import { WorkspaceTabs } from './workspace-tabs'
import type { WorkspacePane } from './workspace-tabs'

/**
 * The Challan Entry workspace.
 *
 * One WhatsApp PDF on the left, one challan's fields on the right, and the
 * queue of challans cut out of it underneath. The split is the entire design:
 * an operator reads a value off the page and types it into the box beside it,
 * ten times over, and the two have to be visible at once at a size where an
 * address is legible.
 *
 * Nothing here is saved until a challan is submitted. The PDF never leaves the
 * browser, the page ranges and the half-typed fields live in memory, and the
 * only thing that crosses the network is the pages of a challan somebody
 * actually filed. That is the module's central rule, and this component is
 * where it is visible: there is no autosave, no draft endpoint, and no upload
 * of the source file.
 */
export function ChallanWorkspace() {
  const pdf = usePdfSource()

  if (!pdf.source) {
    return (
      <div className="py-6">
        <SourcePdfDropzone
          onOpen={pdf.open}
          isOpening={pdf.isOpening}
          error={pdf.error}
          onDismissError={pdf.clearError}
        />
      </div>
    )
  }

  /**
   * Keyed on the file, so opening a second PDF starts a genuinely new session
   * rather than carrying the first one's queue and session key into it.
   */
  return (
    <ChallanWorkspaceSession
      key={`${pdf.source.fileName}:${pdf.source.fileSize}:${pdf.source.pageCount}`}
      source={pdf.source}
      onClose={pdf.close}
    />
  )
}

interface SessionProps {
  source: SourcePdf
  onClose: () => void
}

function ChallanWorkspaceSession({ source, onClose }: SessionProps) {
  const navigate = useNavigate()

  const session = useChallanSession(source.pageCount)
  const submission = useChallanSubmission({
    sessionKey: session.sessionKey,
    sourceBytes: source.bytes,
    sourceFileName: source.fileName,
    sourcePageCount: source.pageCount,
  })
  const actions = useChallanActions()
  /** `CEO` may print and may not mark; every other role here does both. */
  const canMark = canWriteChallans(useCurrentRole())

  const [pane, setPane] = useState<WorkspacePane>('pdf')
  /**
   * Remounts the entry form. Changing the key clears ten fields at once
   * without React Hook Form having to reset each of them, and it guarantees no
   * value from the last challan survives into the next.
   */
  const [entryKey, setEntryKey] = useState(0)

  /** The values behind the duplicate question, so "file it anyway" resends
   *  exactly what was asked about rather than re-reading a form the operator
   *  may have touched while the dialog was open. */
  const [pending, setPending] = useState<ChallanValues | null>(null)

  const active = session.active
  const progress = session.progress

  // Losing a stack of transcribed challans to a stray reload is a real cost;
  // losing an empty form is not.
  useUnsavedChanges(session.hasUnsaved || submission.isBusy)

  /**
   * The batch this session's challans landed in, known only once one has been
   * filed — a batch does not exist before that, by design.
   */
  const [batchId, setBatchId] = useState<string | null>(null)
  const skipped = useBatchSkippedPages()
  const skippedPages = session.session.skippedPages

  /**
   * Pushes the marked-blank pages to the batch that now holds them.
   *
   * They live in the session until a batch exists, which is the price of a
   * batch only ever being created by a real submission — so this is a genuine
   * synchronisation with something outside React, and it runs whenever either
   * side changes: the first file gives it a batch, and marking another page
   * gives it new pages.
   *
   * The request replaces the whole list, so running it more often than
   * strictly needed costs a round trip and never a wrong answer. A failure is
   * reported and nothing else stops: the pages can always be marked again on
   * the batch page, which is where somebody returning tomorrow would do it.
   */
  const syncKey = `${batchId ?? ''}:${skippedPages.join(',')}`
  const lastSynced = useRef<string | null>(null)

  useEffect(() => {
    if (!batchId || lastSynced.current === syncKey) {
      return
    }

    lastSynced.current = syncKey
    skipped.mutate({ batchId, pages: skippedPages })
  }, [batchId, syncKey, skippedPages, skipped])

  const file = useCallback(
    async (values: ChallanValues, acknowledgeDuplicate = false) => {
      if (!active) {
        return
      }

      setPending(values)
      const record = await submission.submit(active, values, { acknowledgeDuplicate })

      if (record) {
        session.markFiled(active.id, record)
        // The batch exists from this moment; anything already marked blank in
        // the session is pushed to it by the effect above.
        setBatchId(record.batchId)
        setEntryKey((key) => key + 1)
        setPending(null)
        setPane('pdf')
      }
    },
    [active, submission, session],
  )

  const startNext = useCallback(() => {
    submission.clearLastFiled()
    if (!session.active) {
      session.add()
    }
    setPane('pdf')
  }, [submission, session])

  const filed = submission.lastFiled
  const blockedReason = session.rangeProblem
    ? session.rangeProblem.message
    : !active
      ? 'Every page of this PDF has been filed. Add a challan to carry on.'
      : null

  return (
    <div className="mx-auto flex w-full max-w-[100rem] flex-col">
      <WorkspaceHeader
        activeLabel={session.activeLabel}
        onClose={onClose}
        onLeave={() => navigate('/challan')}
      />

      <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <SessionProgressPanel
          fileName={source.fileName}
          pageCount={source.pageCount}
          progress={progress}
        />

        {filed && (
          <ChallanFiledPanel
            record={filed}
            nextLabel={nextLabelFor(session.active, progress.isComplete)}
            onNext={startNext}
            onDismiss={submission.clearLastFiled}
            onDownload={actions.download}
            onPrint={actions.printNow}
          />
        )}
      </div>

      {/* The end of the file, without leaving the workspace.
          Filing the last challan out of a WhatsApp PDF is the moment the whole
          session was for: the set now has to be printed and handed over. The
          batch page offers exactly this, but reaching it means navigating away
          from a workspace still holding the source PDF — so the same two
          actions are offered here, where the job actually ends. */}
      {batchId && progress.isComplete && (
        <div className="mb-4">
          <BatchCompletePanel batchId={batchId} canChange={canMark} />
        </div>
      )}

      <div className="mb-3 lg:hidden">
        <WorkspaceTabs value={pane} onChange={setPane} hasEntry={Boolean(active?.values)} />
      </div>

      <div className="grid min-h-0 gap-4 lg:grid-cols-2 lg:items-start xl:gap-6">
        <div className={cn(pane === 'pdf' ? 'block' : 'hidden', 'lg:sticky lg:top-0 lg:block')}>
          <SourcePdfPanel
            source={source}
            entry={active}
            entries={session.session.entries}
            rangeProblem={session.rangeProblem}
            onRangeChange={session.setActiveRange}
            onClose={onClose}
            onSkip={session.skipActive}
            onUnskip={session.unskipAll}
            skippedPages={session.session.skippedPages}
            disabled={submission.isBusy}
          />
        </div>

        <section
          aria-label="Challan details"
          className={cn(
            'overflow-hidden rounded-xl border bg-card shadow-sm',
            pane === 'form' ? 'block' : 'hidden',
            'lg:block',
          )}
        >
          <ChallanEntryForm
            key={entryKey}
            defaultValues={active?.values ? fromChallanValues(active.values) : undefined}
            isBusy={submission.isBusy}
            blockedReason={blockedReason}
            submitLabel={`File ${session.activeLabel}`}
            onSubmit={(values) => void file(values)}
            onValuesChange={session.rememberValues}
          />
        </section>
      </div>

      <div className="mt-4">
        <ChallanQueue
          entries={session.session.entries}
          activeId={session.session.activeId}
          onSelect={(id) => {
            session.select(id)
            setEntryKey((key) => key + 1)
            setPane('pdf')
          }}
          onRemove={session.remove}
          onAdd={() => {
            session.add()
            setEntryKey((key) => key + 1)
          }}
          canAdd={!progress.isComplete}
          disabled={submission.isBusy}
        />
      </div>

      <SubmissionOverlay stage={submission.stage} uploadProgress={submission.uploadProgress} />

      <DuplicateChallanDialog
        duplicates={submission.duplicates}
        isSubmitting={submission.isBusy}
        onDismiss={submission.dismissDuplicates}
        onContinue={() => {
          if (pending) {
            void file(pending, true)
          }
        }}
      />
    </div>
  )
}

/** What the "next" button on the success panel should say, if anything. */
function nextLabelFor(active: { id: string } | null, isComplete: boolean): string | null {
  if (isComplete) {
    return null
  }
  return active ? 'Next challan' : 'Add the next challan'
}

function WorkspaceHeader({
  activeLabel,
  onClose,
  onLeave,
}: {
  activeLabel: string
  onClose: () => void
  onLeave: () => void
}) {
  return (
    <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Challan entry</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
          Mark out where each challan starts and ends in the PDF, type its details beside the page,
          and file them one at a time. {activeLabel} is on screen.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Open a different PDF
        </Button>
        <Button variant="outline" size="sm" onClick={onLeave}>
          <ArrowLeft data-icon="inline-start" aria-hidden />
          All challans
        </Button>
      </div>
    </header>
  )
}
