import { useState } from 'react'
import { Loader2, ScanLine, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScannerPairingDialog } from '@/components/shared/scanner-pairing-dialog'
import { useScanner } from '@/hooks/use-scanner'
import { SCANNER_STATE_COPY, SCANNER_TONES } from '@/lib/scanner-messages'
import type { ScanColorMode, ScanSource } from '@/lib/scanner-agent'
import { cn } from '@/lib/utils'

interface DocumentScanPanelProps {
  disabled: boolean
  onScanned: (file: File) => void
  onDismiss: () => void
  /** Distinguishes this panel's field ids from another on the same page. */
  idPrefix?: string
}

const SOURCE_LABELS: Record<ScanSource, string> = {
  flatbed: 'Flatbed glass',
  feeder: 'Document feeder',
}

const COLOR_LABELS: Record<ScanColorMode, string> = {
  color: 'Colour',
  grayscale: 'Greyscale',
  blackwhite: 'Black & white',
}

/** Base UI labels a closed trigger from these; see `assign-driver-dialog`. */
const SOURCE_OPTIONS = (Object.keys(SOURCE_LABELS) as ScanSource[]).map((value) => ({
  value,
  label: SOURCE_LABELS[value],
}))

const COLOR_OPTIONS = (Object.keys(COLOR_LABELS) as ScanColorMode[]).map((value) => ({
  value,
  label: COLOR_LABELS[value],
}))

/**
 * Taking **one document** off the scanner on this desk.
 *
 * It reaches the hardware through the same `ScannerAgent` seam and the same
 * per-workstation pairing Gate Pass uses — which is why those moved out of
 * `features/gate-pass/` rather than being copied.
 *
 * It lived in `features/vendor/` until Delivery needed it for the receiver's
 * signed challan copy, and moved out here then: the rule CLAUDE.md sets for a
 * helper a second feature wants is move it, not copy it. Nothing in it is
 * about a compliance certificate — it is the one-file half of scanning, which
 * a vendor document and a signed copy want in exactly the same shape.
 *
 * Two differences from the Gate Pass panel, both deliberate:
 *
 * - **A document is one file, never a queue.** A fitness certificate running to
 *   two sheets is one PDF, and so is a two-page signed challan, so
 *   `separatePages` is off and a multi-sheet scan is collected whole. There is
 *   nothing here to file one sheet at a time into.
 * - **The scanner is not checked until it is asked for.** This mounts inside a
 *   form somebody opened to type an expiry date or a floor number. Probing a
 *   loopback port every time one of those opened would be a request nobody
 *   wanted and a warning about a helper nobody was trying to use — so the
 *   check runs on mount, and this only mounts once *Scan it* is pressed.
 *
 * Every word of the status comes from `SCANNER_STATE_COPY`. Nothing here decides
 * what a state means, and no driver string ever reaches the operator.
 */
export function DocumentScanPanel({
  disabled,
  onScanned,
  onDismiss,
  idPrefix = 'doc',
}: DocumentScanPanelProps) {
  const [pairing, setPairing] = useState(false)

  const scanner = useScanner({
    separatePages: false,
    onScanned: (documents) => {
      const [scanned] = documents
      if (scanned) {
        onScanned(scanned.file)
      }
    },
  })

  const copy = SCANNER_STATE_COPY[scanner.state]
  const tone = SCANNER_TONES[copy.tone]
  const isBusy = scanner.state === 'scanning' || scanner.state === 'processing'
  const hasFeeder = scanner.activeDevice?.hasFeeder ?? false

  return (
    <div className="space-y-2.5 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-start gap-2">
        <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', tone.dot)} aria-hidden />
        <div className="min-w-0 flex-1">
          {/* The status changes without the operator doing anything, so it is
              announced rather than only drawn. */}
          <p className="text-[13px] font-medium" aria-live="polite">
            {copy.title}
            {scanner.state === 'scanning' && scanner.pages > 0 && (
              <span className="ml-1 font-normal text-muted-foreground">
                · {scanner.pages} {scanner.pages === 1 ? 'sheet' : 'sheets'}
              </span>
            )}
          </p>
          <p className="text-xs leading-snug text-muted-foreground">{copy.description}</p>
        </div>
      </div>

      {/* Offered only once a device has answered, and the feeder only when the
          device reported one — the same rule `scan-controls.tsx` follows. */}
      {scanner.state === 'ready' && (
        <div className="grid gap-2 sm:grid-cols-2">
          {hasFeeder && (
            <div className="space-y-1">
              <Label htmlFor={`${idPrefix}-scan-source`} className="text-xs text-muted-foreground">
                Source
              </Label>
              <Select
                items={SOURCE_OPTIONS}
                value={scanner.settings.source}
                onValueChange={(value) =>
                  scanner.setSettings({ source: (value ?? 'flatbed') as ScanSource })
                }
              >
                <SelectTrigger id={`${idPrefix}-scan-source`} className="h-8 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-scan-colour`} className="text-xs text-muted-foreground">
              Colour
            </Label>
            <Select
              items={COLOR_OPTIONS}
              value={scanner.settings.colorMode}
              onValueChange={(value) =>
                scanner.setSettings({ colorMode: (value ?? 'blackwhite') as ScanColorMode })
              }
            >
              <SelectTrigger id={`${idPrefix}-scan-colour`} className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {COLOR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {isBusy ? (
          <Button type="button" variant="outline" size="sm" onClick={scanner.cancel}>
            <Square data-icon="inline-start" className="size-3.5" aria-hidden />
            Stop
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={disabled || scanner.state !== 'ready'}
            onClick={scanner.scan}
          >
            {copy.busy ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : (
              <ScanLine data-icon="inline-start" className="size-3.5" aria-hidden />
            )}
            Scan now
          </Button>
        )}

        {scanner.state === 'unpaired' && (
          <Button type="button" variant="outline" size="sm" onClick={() => setPairing(true)}>
            Connect the scanner
          </Button>
        )}

        {copy.retryLabel && !isBusy && (
          <Button type="button" variant="ghost" size="sm" onClick={scanner.check}>
            {copy.retryLabel}
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isBusy}
          onClick={onDismiss}
          className="text-muted-foreground"
        >
          Hide
        </Button>
      </div>

      <ScannerPairingDialog open={pairing} onOpenChange={setPairing} onPaired={scanner.check} />
    </div>
  )
}
