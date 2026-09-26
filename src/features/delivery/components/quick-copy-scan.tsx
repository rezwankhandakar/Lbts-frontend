import { useRef, useState } from 'react'
import { FileUp, Loader2, ScanLine, Square } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScannerPairingDialog } from '@/components/shared/scanner-pairing-dialog'
import { useScanner } from '@/hooks/use-scanner'
import {
  SCANNER_STATE_COPY,
  SCANNER_TONES,
  scannerDescriptionKey,
  scannerTitleKey,
} from '@/lib/scanner-messages'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import type { ScanSource } from '@/lib/scanner-agent'
import { cn } from '@/lib/utils'
import {
  ALLOWED_DOCUMENT_FILE_EXTENSIONS,
  DOCUMENT_FILE_ACCEPT,
  documentFileProblem,
} from '@/lib/document-file-rules'

interface QuickCopyScanProps {
  /** True while the file is on its way to the API. */
  uploading: boolean
  disabled?: boolean
  scanLabel?: string
  /** Called with a checked file; the caller uploads it straight away. */
  onFile: (file: File, pageCount: number | null) => void
}

const SOURCES: { value: ScanSource; labelKey: TranslationKey }[] = [
  { value: 'flatbed', labelKey: 'delivery.copy.glass' },
  { value: 'feeder', labelKey: 'delivery.copy.feeder' },
]

/**
 * The signed copy in one press, the way Gate Pass scans: the scanner is
 * checked when this mounts, the big button starts the scan, and what comes off
 * the glass is filed without a second confirm.
 *
 * Unlike `DocumentScanPanel`, which waits to be asked because it sits inside a
 * form somebody opened to type an expiry date, this probes on mount. The whole
 * point of the delivery page is the scan, so checking first is what makes the
 * first press work.
 *
 * *Attach a file* sits beside it in every scanner state — a copy photographed
 * at the gate and sent on WhatsApp is ordinary, and no scanner is no dead end.
 */
export function QuickCopyScan({
  uploading,
  disabled = false,
  scanLabel,
  onFile,
}: QuickCopyScanProps) {
  const t = useT()

  const fileInput = useRef<HTMLInputElement>(null)
  const [pairing, setPairing] = useState(false)

  const accept = (file: File, pageCount: number | null) => {
    const problem = documentFileProblem(file)
    if (problem) {
      toast.error(problem)
      return
    }
    onFile(file, pageCount)
  }

  const scanner = useScanner({
    separatePages: false,
    onScanned: ([scanned]) => {
      if (scanned) {
        accept(scanned.file, scanned.pageCount)
      }
    },
  })

  const copy = SCANNER_STATE_COPY[scanner.state]
  const tone = SCANNER_TONES[copy.tone]
  const scanning = scanner.state === 'scanning' || scanner.state === 'processing'
  // A finished scan leaves the scanner exactly as ready as it was.
  const canScan = scanner.state === 'ready' || scanner.state === 'completed'
  const hasFeeder = scanner.activeDevice?.hasFeeder ?? false
  const locked = disabled || uploading

  return (
    <div className="space-y-2.5">
      <input
        ref={fileInput}
        type="file"
        accept={DOCUMENT_FILE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const chosen = event.target.files?.[0]
          // Reset first, so choosing the same file twice still fires.
          event.target.value = ''
          if (chosen) {
            accept(chosen, null)
          }
        }}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        {scanning ? (
          <Button type="button" size="lg" variant="outline" className="flex-1" onClick={scanner.cancel}>
            <Square data-icon="inline-start" aria-hidden />
            {t('delivery.copy.stopScanning')}
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={locked || !canScan}
            onClick={scanner.scan}
          >
            {uploading ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : (
              <ScanLine data-icon="inline-start" aria-hidden />
            )}
            {uploading ? t('delivery.copy.filingCopy') : (scanLabel ?? t('delivery.copy.scan'))}
          </Button>
        )}

        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={locked || scanning}
          onClick={() => fileInput.current?.click()}
        >
          <FileUp data-icon="inline-start" aria-hidden />
          {t('common.actions.attachFile')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        <span className="flex items-center gap-1.5" aria-live="polite">
          <span className={cn('size-1.5 shrink-0 rounded-full', tone.dot)} aria-hidden />
          <span className="font-medium">
            {t(scannerTitleKey(scanner.state))}
            {scanning && scanner.pages > 0 && ` · ${scanner.pages} ${scanner.pages === 1 ? 'sheet' : 'sheets'}`}
          </span>
        </span>

        {hasFeeder && !scanning && (
          <span className="inline-flex rounded-md border p-0.5" role="group" aria-label={t('delivery.copy.scanFromAria')}>
            {SOURCES.map((source) => (
              <button
                key={source.value}
                type="button"
                aria-pressed={scanner.settings.source === source.value}
                onClick={() => scanner.setSettings({ source: source.value })}
                className={cn(
                  'rounded px-2 py-0.5',
                  scanner.settings.source === source.value
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {t(source.labelKey)}
              </button>
            ))}
          </span>
        )}

        {scanner.state === 'unpaired' && (
          <Button type="button" variant="outline" size="sm" className="h-7" onClick={() => setPairing(true)}>
            {t('delivery.copy.connectScanner')}
          </Button>
        )}
        {copy.retryLabelKey && !scanning && (
          <Button type="button" variant="ghost" size="sm" className="h-7" onClick={scanner.check}>
            {t(copy.retryLabelKey)}
          </Button>
        )}
      </div>

      <p className="text-xs leading-snug text-muted-foreground">
        {!canScan && !scanning && scanner.state !== 'checking' ? `${t(scannerDescriptionKey(scanner.state))} ` : ''}
        {ALLOWED_DOCUMENT_FILE_EXTENSIONS}. Two sheets are saved as one PDF.
      </p>

      <ScannerPairingDialog open={pairing} onOpenChange={setPairing} onPaired={scanner.check} />
    </div>
  )
}
