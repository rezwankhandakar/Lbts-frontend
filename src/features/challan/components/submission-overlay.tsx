import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STAGE_LABELS, SUBMISSION_STAGES } from '../hooks/use-challan-submission'
import type { SubmissionStage } from '../hooks/use-challan-submission'

interface SubmissionOverlayProps {
  stage: SubmissionStage
  /** 0-100 while the pages are in flight, null otherwise. */
  uploadProgress: number | null
}

/**
 * What the app is doing while a challan is being filed.
 *
 * Filing one is real work — the browser cuts the pages out of the source PDF,
 * uploads them, and then waits while the server allocates two numbers, draws a
 * barcode, builds the back page, merges the document and writes it to R2. On a
 * cold Render instance that last part alone can take most of a minute, and a
 * single spinner for all of it reads as a frozen page.
 *
 * Three stages, and each one is something that actually happens. The upload
 * shows real bytes rather than a guess. The server stage is named for the work
 * rather than split into ticks nobody here can observe: a checklist that
 * animates through steps the client never measured would look more precise and
 * be less true.
 */
export function SubmissionOverlay({ stage, uploadProgress }: SubmissionOverlayProps) {
  if (stage === 'idle') {
    return null
  }

  const currentIndex = SUBMISSION_STAGES.indexOf(stage as (typeof SUBMISSION_STAGES)[number])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="assertive"
    >
      <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-lg">
        <p className="mb-4 text-sm font-semibold tracking-tight">Filing this challan…</p>

        <ol className="space-y-3">
          {SUBMISSION_STAGES.map((step, index) => {
            const isDone = index < currentIndex
            const isCurrent = index === currentIndex

            return (
              <li key={step} className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ring-1',
                    isDone && 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
                    isCurrent && 'bg-primary/10 text-primary ring-primary/20',
                    !isDone && !isCurrent && 'bg-muted text-muted-foreground ring-border',
                  )}
                  aria-hidden
                >
                  {isDone ? (
                    <Check className="size-3.5" />
                  ) : isCurrent ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </span>

                <span
                  className={cn(
                    'text-sm leading-snug',
                    isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {STAGE_LABELS[step]}
                  {isCurrent && step === 'uploading' && uploadProgress !== null && (
                    <span className="ml-1 tabular-nums">{uploadProgress}%</span>
                  )}
                </span>
              </li>
            )
          })}
        </ol>

        {stage === 'uploading' && uploadProgress !== null && (
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          The server may take a moment to wake up. Nothing is lost if this is slow, and pressing the
          button again cannot file this challan twice.
        </p>
      </div>
    </div>
  )
}
