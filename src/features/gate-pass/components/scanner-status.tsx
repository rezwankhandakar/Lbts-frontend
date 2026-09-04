import { Loader2, Printer, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SCANNER_STATE_COPY, SCANNER_TONES } from '../lib/scanner-messages'
import type { ScannerState } from '../lib/scanner-messages'
import type { ScannerDevice } from '../lib/scanner-agent'

interface ScannerStatusProps {
  state: ScannerState
  device: ScannerDevice | null
  /** Pages transferred so far, while a feeder scan is running. */
  pages: number
  onRetry: () => void
}

/**
 * What the scanner is doing, in one line an operator can read from across the
 * desk, plus the sentence that says what to do about it.
 *
 * Every word comes from SCANNER_STATE_COPY. Nothing here decides what a state
 * means, and no driver text ever reaches this component — that separation is
 * what keeps an HRESULT from appearing in front of somebody loading paper.
 */
export function ScannerStatus({ state, device, pages, onRetry }: ScannerStatusProps) {
  const copy = SCANNER_STATE_COPY[state]
  const tone = SCANNER_TONES[copy.tone]

  return (
    <div className="border-b px-4 py-3.5 sm:px-5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg ring-1',
            tone.chip,
          )}
          aria-hidden
        >
          {copy.busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Printer className="size-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'size-1.5 shrink-0 rounded-full',
                tone.dot,
                copy.busy && 'animate-pulse',
              )}
              aria-hidden
            />
            {/* The status is the one thing on this page that changes without
                the operator doing anything, so it is announced. */}
            <h2 className="text-[13px] font-semibold tracking-tight" aria-live="polite">
              {copy.title}
              {state === 'scanning' && pages > 0 && (
                <span className="ml-1 font-normal text-muted-foreground">
                  · page {pages + 1}
                </span>
              )}
            </h2>
          </div>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy.description}</p>

          {/* Naming the machine is what turns "scanner ready" into something
              an operator with two scanners can trust. */}
          {device && (state === 'ready' || state === 'completed') && (
            <p className="mt-1.5 truncate text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{device.description || device.name}</span>
              {device.hasFeeder && <span> · flatbed and feeder</span>}
            </p>
          )}
        </div>

        {copy.retryLabel && (
          <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0">
            <RefreshCcw data-icon="inline-start" aria-hidden />
            {copy.retryLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
