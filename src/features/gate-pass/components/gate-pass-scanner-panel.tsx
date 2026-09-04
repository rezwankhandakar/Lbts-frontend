import { useState } from 'react'
import { formatBytes } from '../lib/gate-pass-meta'
import { useLocalFileUrl } from '../hooks/use-gate-pass-document'
import { useScanner } from '../hooks/use-scanner'
import type { ScanBatch } from '../hooks/use-scan-batch'
import { GatePassDocumentViewer } from './gate-pass-document-viewer'
import { ScanBatchTray } from './scan-batch-tray'
import { ScanControls } from './scan-controls'
import { ScannerPairingDialog } from './scanner-pairing-dialog'
import { ScannerStatus } from './scanner-status'

interface GatePassScannerPanelProps {
  /** The stack of scanned sheets, owned by the workspace. */
  batch: ScanBatch
  /**
   * False when this workspace is one record — correcting an existing gate
   * pass. A multi-sheet scan is then one document rather than a stack.
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
  allowBatch,
  storedUrl,
  storedMimeType,
  storedPageCount,
  isStoredLoading,
  storedError,
  onRetryStored,
  disabled,
}: GatePassScannerPanelProps) {
  const [pairing, setPairing] = useState(false)

  // The hook probes for the helper as it mounts, so there is nothing to kick
  // off here. `separatePages` is what turns a ten-sheet feeder run into ten
  // gate passes rather than one ten-page document.
  const scanner = useScanner({
    onScanned: batch.add,
    separatePages: allowBatch,
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
      aria-label="Scanner and document"
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
            ? 'Every scanned sheet has been dealt with. Scan the next stack, or attach a file.'
            : 'No gate pass document yet. Put the stack in the feeder and scan, or attach a file.'
        }
        onReplace={canScan ? scanner.scan : undefined}
        onRemove={active ? () => batch.remove(active.id) : undefined}
      />

      {active && !batch.isBatch && (
        <footer className="flex items-center justify-between gap-3 border-t bg-muted/20 px-4 py-2 text-xs">
          <p className="min-w-0 truncate text-muted-foreground">
            <span className="font-medium text-foreground">Ready to file</span> ·{' '}
            {formatBytes(active.file.size)}
            {active.pageCount > 1 ? ` · ${active.pageCount} pages` : ''}
          </p>
        </footer>
      )}

      <ScannerPairingDialog open={pairing} onOpenChange={setPairing} onPaired={scanner.check} />
    </section>
  )
}
