import { CircleCheck, CircleX, Info, Loader2, ScanLine, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScanOutcome } from '../hooks/use-challan-scan'

interface ScannerStatusProps {
  listening: boolean
  pending: boolean
  last: ScanOutcome | null
}

/**
 * One line saying whether a scan will be heard, and what the last one did.
 *
 * The listening dot matters: a scan that lands while a dialog is open is
 * deliberately ignored, and an operator who scans into a page that is not
 * listening should be able to see why nothing happened.
 */
export function ScannerStatus({ listening, pending, last }: ScannerStatusProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <span className="relative flex size-2" aria-hidden>
          {listening && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
          )}
          <span
            className={cn(
              'relative inline-flex size-2 rounded-full',
              listening ? 'bg-success' : 'bg-muted-foreground/40',
            )}
          />
        </span>
        <ScanLine className="size-3.5" aria-hidden />
        {listening ? 'Barcode scanner ready' : 'Scanner paused while a dialog is open'}
      </span>

      <span aria-live="polite" className="min-w-0">
        {pending ? (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Looking up the barcode…
          </span>
        ) : last ? (
          <LastScan outcome={last} />
        ) : null}
      </span>
    </div>
  )
}

function LastScan({ outcome }: { outcome: ScanOutcome }) {
  switch (outcome.kind) {
    case 'added':
      return (
        <span className="flex items-center gap-1.5 text-tone-emerald">
          <CircleCheck className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            Added <span className="font-mono font-semibold">{outcome.candidate.challanNumber}</span>
          </span>
        </span>
      )
    case 'duplicate':
      return (
        <span className="flex items-center gap-1.5 text-tone-cyan">
          <Info className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            <span className="font-mono font-semibold">{outcome.challanNumber}</span> is already on
            this trip
          </span>
        </span>
      )
    case 'dispatched':
      return (
        <span className="flex items-center gap-1.5 text-tone-amber">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            <span className="font-mono font-semibold">{outcome.candidate.challanNumber}</span> has
            gone out in full
          </span>
        </span>
      )
    case 'missing':
      return (
        <span className="flex items-center gap-1.5 text-destructive">
          <CircleX className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{outcome.message}</span>
        </span>
      )
  }
}
