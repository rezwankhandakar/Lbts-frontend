import { useRef, useState } from 'react'
import { FileUp, Paperclip, ScanLine, X } from 'lucide-react'
import { toast } from 'sonner'
import { DocumentScanPanel } from '@/components/shared/document-scan-panel'
import { Button } from '@/components/ui/button'
import {
  ALLOWED_DOCUMENT_FILE_EXTENSIONS,
  DOCUMENT_FILE_ACCEPT,
  documentFileProblem,
  formatBytes,
} from '@/lib/document-file-rules'
import type { EntryVoucher } from '../types'
import { useT } from '@/lib/i18n'

/** A file staged for upload, and how many sheets produced it. */
export interface StagedVoucher {
  file: File
  /** Only the scanner agent knows this; a file off a disk reports nothing. */
  pageCount: number | null
}

interface VoucherFieldProps {
  /** The file staged for this save, if one has been chosen or scanned. */
  staged: StagedVoucher | null
  /** What is already on the entry, so replacing it can be said out loud. */
  current: EntryVoucher | null
  disabled: boolean
  onChange: (staged: StagedVoucher | null) => void
}

/**
 * The paper behind an entry: chosen from disk, or taken off the scanner on
 * this desk.
 *
 * Scanning is offered here for the reason it is offered in Gate Pass and on a
 * compliance document — a fuel bill arrives as a sheet of paper, and the
 * alternative is scanning it with some other program, finding where that
 * program put the file, and attaching that.
 *
 * **Attach a file stays first and stays available in every scanner state.** An
 * invoice that arrived by email is the ordinary case, and a machine with no
 * scanner must never be a dead end — the same rule `scan-controls.tsx` and
 * `DocumentAttachmentField` both follow. The scanner half is a separate
 * component so that it only *mounts* once somebody asks for it, which is also
 * when it first probes the workstation: this sits inside a dialog somebody
 * opened to type an amount, and a loopback request nobody asked for is a
 * warning about a helper nobody was using.
 *
 * A file is only staged here. It is uploaded after the entry is saved, because
 * the object key contains the entry id — see `useSaveEntryVoucher`.
 */
export function VoucherField({ staged, current, disabled, onChange }: VoucherFieldProps) {
  const t = useT()

  const fileInput = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)

  const accept = (file: File, pageCount: number | null) => {
    const problem = documentFileProblem(file)
    if (problem) {
      toast.error(problem)
      return
    }
    onChange({ file, pageCount })
    setScanning(false)
  }

  return (
    <div className="space-y-2">
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

      {staged ? (
        <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2.5">
          <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{staged.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(staged.file.size)}
              {staged.pageCount ? ` · ${staged.pageCount} sheets` : ''}
              {current ? ' · replaces the one on record' : ''}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t('accounts.voucher.removeChosen')}
            disabled={disabled}
            onClick={() => onChange(null)}
          >
            <X aria-hidden />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => fileInput.current?.click()}
            >
              <FileUp data-icon="inline-start" aria-hidden />
              {current ? t('accounts.voucher.replaceFile') : t('common.actions.attachFile')}
            </Button>

            {!scanning && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => setScanning(true)}
              >
                <ScanLine data-icon="inline-start" aria-hidden />
                {t('accounts.voucher.scanIt')}
              </Button>
            )}
          </div>

          {current && (
            <p className="text-xs text-muted-foreground">
              {t('accounts.voucher.holding', {
                name: current.originalName,
                size: formatBytes(current.size),
              })}
            </p>
          )}

          {scanning && (
            <DocumentScanPanel
              idPrefix="voucher"
              disabled={disabled}
              onScanned={accept}
              onDismiss={() => setScanning(false)}
            />
          )}

          <p className="text-xs leading-snug text-muted-foreground">
            {ALLOWED_DOCUMENT_FILE_EXTENSIONS}. A multi-sheet bill is stored as one PDF, and an
            entry is saved with or without one.
          </p>
        </>
      )}
    </div>
  )
}
