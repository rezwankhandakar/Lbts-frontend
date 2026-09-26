import { useState } from 'react'
import { formatNumber } from '@/lib/format'
import { formatBytes } from '../lib/gate-pass-meta'
import { useLocalFileUrl } from '../hooks/use-gate-pass-document'
import type { JoinSheets } from '../hooks/use-join-sheets'
import { useScanner } from '@/hooks/use-scanner'
import type { ScanBatch } from '../hooks/use-scan-batch'
import { GatePassDocumentViewer } from './gate-pass-document-viewer'
import { ScanBatchTray } from './scan-batch-tray'
import { ScanControls } from './scan-controls'
import { ScannerPairingDialog } from '@/components/shared/scanner-pairing-dialog'
import { ScannerStatus } from './scanner-status'
import { useT } from '@/lib/i18n'

interface GatePassScannerPanelProps {
  /** The stack of scanned sheets, owned by the workspace. */
  batch: ScanBatch
  /**
   * Joining sheets into one document. Owned by the workspace rather than by
   * this panel, because a correction has to be able to insist the stack is one
   * document before it saves.
   */
  joining: JoinSheets
  /**
   * False when this workspace is one record — correcting an existing gate
   * pass. The sheets are then pages of that record's one document, so the tray
   * insists they become one before anything is saved.
   */
  allowBatch: boolean
  /** The document already stored on the record, if there is one. */
  storedUrl: string | null
  storedMimeType: string | null
  storedPageCount: number | null
  isStoredLoading: boolean
  storedError: string | null
  onRetryStored: () => void
  disabled?: boolean
}

/**
 * The right-hand half of the workspace: the scanner, the stack it produced,
 * and the sheet being worked on.
 *
 * A sheet from the stack always wins over the document already stored on the
 * record. Rescanning a gate pass that already has one should show the new page
 * immediately — before it is uploaded — because the operator is deciding
 * whether to keep it.
 */
export function GatePassScannerPanel({
  batch,
  joining,
  allowBatch,
  storedUrl,
  storedMimeType,
  storedPageCount,
  isStoredLoading,
  storedError,
  onRetryStored,
  disabled,
}: GatePassScannerPanelProps) {
  const t = useT()

  const [pairing, setPairing] = useState(false)

  /**
   * The hook probes for the helper as it mounts, so there is nothing to kick
   * off here. `separatePages` is what turns a ten-sheet feeder run into ten
   * gate passes rather than one ten-page document.
   *
   * It is on even when this workspace holds a single record. Asking the agent
   * to merge the job would be one step shorter, but it hands back a PDF whose
   * pages can no longer be told apart — and a feeder that pulled a blank sheet
   * or the back of a challan is exactly what an operator correcting a record
   * needs to remove. Sheets arrive separately and the tray joins them, which
   * costs one click and keeps every sheet removable up to the moment it is
   * saved.
   */
  const scanner = useScanner({
    onScanned: batch.add,
    separatePages: true,
  })

  const active = batch.active
  const activeUrl = useLocalFileUrl(active?.file ?? null)
  const showingScan = Boolean(active)

  const url = showingScan ? activeUrl : storedUrl
  const mimeType = showingScan ? (active?.file.type ?? null) : storedMimeType
  const pageCount = showingScan ? (active?.pageCount ?? null) : storedPageCount

  const canScan =
    !disabled &&
    (scanner.state === 'ready' ||
      scanner.state === 'completed' ||
      scanner.state === 'busy' ||
      scanner.state === 'no-paper' ||
      scanner.state === 'cover-open' ||
      scanner.state === 'paper-jam' ||
      scanner.state === 'driver-error' ||
      scanner.state === 'failed')

  /** The retry button means different things in different states. */
  const handleRetry = () => {
    if (scanner.state === 'unpaired') {
      setPairing(true)
      return
    }
    if (
      scanner.state === 'idle' ||
      scanner.state === 'agent-missing' ||
      scanner.state === 'network-error'
    ) {
      scanner.check()
      return
    }
    scanner.scan()
  }

  /**
   * The stack was one gate pass after all. The sheets are still on the agent,
   * so this costs a re-read rather than another trip to the scanner.
   */
  const handleCombine = async () => {
    const combined = await scanner.combineLast()
    if (combined) {
      batch.replaceWith(combined)
    }
  }

  return (
    <section
      aria-label={t('gatePass.scanner.panelAria')}
      className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <ScannerStatus
        state={scanner.state}
        device={scanner.activeDevice}
        pages={scanner.pages}
        onRetry={handleRetry}
      />

      <ScanControls
        state={scanner.state}
        settings={scanner.settings}
        hasFeeder={scanner.activeDevice?.hasFeeder ?? false}
        canScan={canScan}
        onSettingsChange={scanner.setSettings}
        onScan={scanner.scan}
        onCancel={scanner.cancel}
        onFilePicked={(file) => {
          // A picked file counts as one sheet: only the scanner agent reports
          // a real page count, and it is never guessed.
          batch.add([{ file, pageCount: 1 }])
          scanner.reset()
        }}
      />

      <ScanBatchTray
        batch={batch}
        onCombine={allowBatch ? () => void handleCombine() : undefined}
        onJoin={joining.join}
        isJoining={joining.isJoining}
        singleDocument={!allowBatch}
        disabled={disabled}
      />

      <GatePassDocumentViewer
        url={url}
        mimeType={mimeType}
        pageCount={pageCount}
        isLoading={!showingScan && isStoredLoading}
        error={showingScan ? null : storedError}
        onRetry={onRetryStored}
        emptyMessage={
          batch.total > 0
            ? t('gatePass.scanner.emptyDealt')
            : t('gatePass.scanner.emptyNone')
        }
        onReplace={canScan ? scanner.scan : undefined}
        onRemove={active ? () => batch.remove(active.id) : undefined}
      />

      {active && !batch.isBatch && (
        <footer className="flex items-center justify-between gap-3 border-t bg-muted/20 px-4 py-2 text-xs">
          <p className="min-w-0 truncate text-muted-foreground">
            <span className="font-medium text-foreground">
              {t('gatePass.scanner.readyToFile')}
            </span>{' '}
            · {formatBytes(active.file.size)}
            {active.pageCount > 1
              ? ` · ${t('gatePass.scanner.pageCount', {
                  count: active.pageCount,
                  n: formatNumber(active.pageCount),
                })}`
              : ''}
            {active.parts.length > 1
              ? ` · ${t('gatePass.scanner.sheetsJoined', {
                  count: active.parts.length,
                  n: formatNumber(active.parts.length),
                })}`
              : ''}
          </p>
        </footer>
      )}

      <ScannerPairingDialog open={pairing} onOpenChange={setPairing} onPaired={scanner.check} />
    </section>
  )
}
