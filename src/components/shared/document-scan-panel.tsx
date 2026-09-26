import { useMemo, useState } from 'react'
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
import {
  SCANNER_STATE_COPY,
  SCANNER_TONES,
  scannerDescriptionKey,
  scannerTitleKey,
} from '@/lib/scanner-messages'
import { useFormatters, useT } from '@/lib/i18n'
import type { TranslationKey, Translator } from '@/lib/i18n'
import type { ScanColorMode, ScanSource } from '@/lib/scanner-agent'
import { cn } from '@/lib/utils'

interface DocumentScanPanelProps {
  disabled: boolean
  /**
   * The scanned document, and how many sheets produced it — the agent is the
   * only thing that knows, and a caller storing a page count wants it. A caller
   * that does not simply ignores the second argument.
   */
  onScanned: (file: File, pageCount: number | null) => void
  onDismiss: () => void
  /** Distinguishes this panel's field ids from another on the same page. */
  idPrefix?: string
}

const SOURCE_KEYS: Record<ScanSource, TranslationKey> = {
  flatbed: 'shared.documentScan.flatbed',
  feeder: 'shared.documentScan.feeder',
}

const COLOR_KEYS: Record<ScanColorMode, TranslationKey> = {
  color: 'shared.documentScan.colour',
  grayscale: 'shared.documentScan.greyscale',
  blackwhite: 'shared.documentScan.blackwhite',
}

/**
 * Base UI labels a closed trigger from these; see `assign-driver-dialog`.
 *
 * Built inside the component rather than at module scope, because a module
 * constant is evaluated once and could never follow a language change — the
 * trigger would keep the words it was born with while the list beside it
 * changed. `useMemo` on the translator keeps the arrays stable otherwise.
 */
function useScanOptions(t: Translator) {
  return useMemo(
    () => ({
      sources: (Object.keys(SOURCE_KEYS) as ScanSource[]).map((value) => ({
        value,
        label: t(SOURCE_KEYS[value]),
      })),
      colors: (Object.keys(COLOR_KEYS) as ScanColorMode[]).map((value) => ({
        value,
        label: t(COLOR_KEYS[value]),
      })),
    }),
    [t],
  )
}

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
        onScanned(scanned.file, scanned.pageCount ?? null)
      }
    },
  })

  const t = useT()
  const format = useFormatters()
  const { sources: SOURCE_OPTIONS, colors: COLOR_OPTIONS } = useScanOptions(t)
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
            {t(scannerTitleKey(scanner.state))}
            {scanner.state === 'scanning' && scanner.pages > 0 && (
              <span className="ml-1 font-normal text-muted-foreground">
                ·{' '}
                {t('shared.documentScan.sheets', {
                  count: scanner.pages,
                  n: format.number(scanner.pages),
                })}
              </span>
            )}
          </p>
          <p className="text-xs leading-snug text-muted-foreground">{t(scannerDescriptionKey(scanner.state))}</p>
        </div>
      </div>

      {/* Offered only once a device has answered, and the feeder only when the
          device reported one — the same rule `scan-controls.tsx` follows. */}
      {scanner.state === 'ready' && (
        <div className="grid gap-2 sm:grid-cols-2">
          {hasFeeder && (
            <div className="space-y-1">
              <Label htmlFor={`${idPrefix}-scan-source`} className="text-xs text-muted-foreground">
                {t('shared.documentScan.sourceLabel')}
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
              {t('shared.documentScan.colourLabel')}
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
            {t('shared.documentScan.stop')}
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
            {t('shared.documentScan.scanNow')}
          </Button>
        )}

        {scanner.state === 'unpaired' && (
          <Button type="button" variant="outline" size="sm" onClick={() => setPairing(true)}>
            {t('scanner.pairing.title')}
          </Button>
        )}

        {copy.retryLabelKey && !isBusy && (
          <Button type="button" variant="ghost" size="sm" onClick={scanner.check}>
            {t(copy.retryLabelKey)}
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
          {t('shared.documentScan.hide')}
        </Button>
      </div>

      <ScannerPairingDialog open={pairing} onOpenChange={setPairing} onPaired={scanner.check} />
    </div>
  )
}
