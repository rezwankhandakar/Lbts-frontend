import { FileUp, Layers, ScanLine, Square } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'
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
import {
  ACCEPTED_DOCUMENT_ATTRIBUTE,
  documentRulesHint,
  validateDocumentFile,
} from '../lib/gate-pass-document'
import { SCAN_RESOLUTIONS } from '@/lib/scanner-agent'
import type { ScanColorMode, ScanResolution, ScanSource } from '@/lib/scanner-agent'
import type { ScannerState } from '@/lib/scanner-messages'
import type { ScannerSettings } from '@/hooks/use-scanner'
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

interface ScanControlsProps {
  state: ScannerState
  settings: ScannerSettings
  hasFeeder: boolean
  canScan: boolean
  onSettingsChange: (next: Partial<ScannerSettings>) => void
  onScan: () => void
  onCancel: () => void
  onFilePicked: (file: File) => void
}

const SOURCE_KEYS: Record<ScanSource, TranslationKey> = {
  flatbed: 'gatePass.scanner.flatbed',
  feeder: 'gatePass.scanner.feeder',
}

const COLOR_KEYS: Record<ScanColorMode, TranslationKey> = {
  color: 'gatePass.scanner.colorModes.color',
  grayscale: 'gatePass.scanner.colorModes.grayscale',
  blackwhite: 'gatePass.scanner.colorModes.blackwhite',
}

const TRIGGER = 'h-8 w-full'

/**
 * How the next scan is taken, and the two ways to take it.
 *
 * The file picker is not a fallback bolted on: a gate pass that arrived as a
 * PDF by email is as real as one on the glass, and the operator on a machine
 * with no scanner still has a job to do. It stays available in every scanner
 * state, which is why the panel never becomes a dead end.
 */
export function ScanControls({
  state,
  settings,
  hasFeeder,
  canScan,
  onSettingsChange,
  onScan,
  onCancel,
  onFilePicked,
}: ScanControlsProps) {
  const t = useT()

  const inputRef = useRef<HTMLInputElement>(null)
  const isScanning = state === 'scanning' || state === 'processing'

  const selectFile = (file: File | undefined) => {
    if (!file) {
      return
    }

    const problem = validateDocumentFile(file)
    if (problem) {
      toast.error(t('gatePass.scanner.fileRejected'), { description: problem })
      return
    }

    onFilePicked(file)
  }

  return (
    <div className="space-y-3 border-b px-4 py-3.5 sm:px-5">
      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="scan-source" className="text-xs text-muted-foreground">
            {t('gatePass.scanner.source')}
          </Label>
          <Select
            value={settings.source}
            onValueChange={(value) => onSettingsChange({ source: value as ScanSource })}
          >
            <SelectTrigger id="scan-source" className={TRIGGER} disabled={isScanning}>
              <SelectValue>{() => t(SOURCE_KEYS[settings.source])}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="flatbed">{t(SOURCE_KEYS.flatbed)}</SelectItem>
                {/* Offered only when the device reported one, rather than
                    letting an operator choose a tray that is not there. */}
                {hasFeeder && (
                  <SelectItem value="feeder">
                    <Layers className="size-3.5" aria-hidden />
                    {t(SOURCE_KEYS.feeder)}
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="scan-resolution" className="text-xs text-muted-foreground">
            {t('gatePass.scanner.resolution')}
          </Label>
          <Select
            value={String(settings.resolution)}
            onValueChange={(value) =>
              // Base UI types the value as nullable, because a Select can be
              // cleared. This one never is: every item carries a resolution.
              onSettingsChange({ resolution: Number.parseInt(String(value), 10) as ScanResolution })
            }
          >
            <SelectTrigger id="scan-resolution" className={TRIGGER} disabled={isScanning}>
              <SelectValue>
              {() => t('gatePass.scanner.dpi', { n: formatNumber(settings.resolution) })}
            </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SCAN_RESOLUTIONS.map((dpi) => (
                  <SelectItem key={dpi} value={String(dpi)}>
                    {t('gatePass.scanner.dpi', { n: formatNumber(dpi) })}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="scan-color" className="text-xs text-muted-foreground">
            {t('gatePass.scanner.colour')}
          </Label>
          <Select
            value={settings.colorMode}
            onValueChange={(value) => onSettingsChange({ colorMode: value as ScanColorMode })}
          >
            <SelectTrigger id="scan-color" className={TRIGGER} disabled={isScanning}>
              <SelectValue>{() => t(COLOR_KEYS[settings.colorMode])}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(Object.keys(COLOR_KEYS) as ScanColorMode[]).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {t(COLOR_KEYS[mode])}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {isScanning ? (
          <Button variant="outline" size="lg" onClick={onCancel} className="flex-1">
            <Square data-icon="inline-start" aria-hidden />
            {t('gatePass.scanner.stop')}
          </Button>
        ) : (
          <Button size="lg" onClick={onScan} disabled={!canScan} className="flex-1">
            <ScanLine data-icon="inline-start" aria-hidden />
            {t('gatePass.scanner.scan')}
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          onClick={() => inputRef.current?.click()}
          disabled={isScanning}
        >
          <FileUp data-icon="inline-start" aria-hidden />
          {t('common.actions.attachFile')}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_DOCUMENT_ATTRIBUTE}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            selectFile(event.target.files?.[0])
            // Reset, so choosing the same file twice still fires a change.
            event.target.value = ''
          }}
        />
      </div>

      <p className="text-[11px] leading-snug text-muted-foreground">{documentRulesHint()}</p>
    </div>
  )
}

