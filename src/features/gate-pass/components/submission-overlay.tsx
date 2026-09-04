import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STAGE_LABELS } from '../hooks/use-gate-pass-workspace'
import type { SubmissionStage } from '../hooks/use-gate-pass-workspace'

interface SubmissionOverlayProps {
  stage: SubmissionStage
  /** 0-100 while document bytes are in flight, null otherwise. */
  uploadProgress: number | null
}

const ORDER: Exclude<SubmissionStage, 'idle'>[] = ['saving', 'uploading', 'finalizing']

/**
 * What the app is doing during a submission, stage by stage.
 *
 * Filing a gate pass is three calls, and on a cold Render instance the first
 * can take most of a minute. A single spinner for all of that reads as a
 * frozen page, so each stage is named, the finished ones are ticked, and the
 * upload shows real bytes rather than a guess.
 */
export function SubmissionOverlay({ stage, uploadProgress }: SubmissionOverlayProps) {
  if (stage === 'idle') {
    return null
  }

  const currentIndex = ORDER.indexOf(stage as (typeof ORDER)[number])

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="assertive"
    >
      <div className="w-full max-w-xs rounded-xl border bg-card p-5 shadow-lg">
        <ol className="space-y-3">
          {ORDER.map((step, index) => {
            const isDone = index < currentIndex
            const isCurrent = index === currentIndex

            return (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full ring-1',
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
                    'text-sm',
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
          The server may take a moment to wake up. Nothing is lost if this is slow.
        </p>
      </div>
    </div>
  )
}
