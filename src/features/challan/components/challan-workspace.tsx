import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { usePdfSource } from '../hooks/use-pdf-source'
import { useResumeBatch } from '../hooks/use-resume-batch'
import { ChallanWorkspaceSession } from './challan-workspace-session'
import { ResumeBatchPanel, ResumeBatchUnavailable } from './resume-batch-panel'
import { SourcePdfDropzone } from './source-pdf-dropzone'

/**
 * The way into the Challan Entry workspace: which PDF, and which batch.
 *
 * There are two ways to arrive. Ordinarily somebody opens a WhatsApp file that
 * has never been seen before, and the first challan they file creates the
 * batch. The other way is `/challan/new?batch=<id>`, which the batch page
 * links to when a file was left half-processed — and it exists because of the
 * module's central rule rather than in spite of it: the source PDF was never
 * stored, so nothing here can reopen it. What this can do is ask for the same
 * file, refuse one that is plainly not it, and hand the session the batch so
 * the challans filed from it join what is already there.
 *
 * Everything downstream of that decision — the split screen, the queue, the
 * submissions — is `ChallanWorkspaceSession`, remounted whenever the file or
 * the batch changes so no queue is ever inherited by the wrong document.
 */
export function ChallanWorkspace() {
  const navigate = useNavigate()
  const pdf = usePdfSource()
  const resume = useResumeBatch()

  /** Drops the batch out of the URL, which is what starts an ordinary session. */
  const startNew = useCallback(() => {
    pdf.close()
    navigate('/challan/new', { replace: true })
  }, [navigate, pdf])

  if (resume.isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl py-6" aria-busy="true">
        <span className="sr-only">Loading the batch</span>
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="mt-4 h-72 rounded-xl" />
      </div>
    )
  }

  if (resume.loadError) {
    return <ResumeBatchUnavailable message={resume.loadError} onStartNew={startNew} />
  }

  if (!pdf.source) {
    return (
      <div className="space-y-4 py-6">
        {resume.batch && (
          <ResumeBatchPanel batch={resume.batch} problem={resume.problem} onStartNew={startNew} />
        )}

        {/* A batch that cannot be continued offers no dropzone: opening a file
            against it would only reach a refusal at submit time, ten typed
            fields later. */}
        {!resume.problem && (
          <SourcePdfDropzone
            onOpen={(file) => pdf.open(file, resume.expectation)}
            expecting={resume.expectation}
            isOpening={pdf.isOpening}
            error={pdf.error}
            onDismissError={pdf.clearError}
          />
        )}
      </div>
    )
  }

  /**
   * Keyed on the file *and* the batch, so opening a second PDF — or leaving a
   * resumed batch for a fresh one — starts a genuinely new session rather than
   * carrying the first one's queue, session key and seeded challans into it.
   */
  return (
    <ChallanWorkspaceSession
      key={`${resume.batchId}:${pdf.source.fileName}:${pdf.source.fileSize}:${pdf.source.pageCount}`}
      source={pdf.source}
      resume={resume.resume}
      onClose={pdf.close}
    />
  )
}
