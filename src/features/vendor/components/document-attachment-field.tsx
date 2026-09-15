import { useRef, useState } from 'react'
import { FileUp, Paperclip, ScanLine, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  MAX_DOCUMENT_BYTES,
  isAllowedDocument,
} from '../lib/photo-rules'
import { formatFileSize } from '../lib/vendor-meta'
import type { DocumentAttachment } from '../types'
import { DocumentScanPanel } from '@/components/shared/document-scan-panel'

interface DocumentAttachmentFieldProps {
  /** The file staged for this submission, if the operator has chosen one. */
  file: File | null
  /** What is already on the record, so replacing it can be said out loud. */
  current: DocumentAttachment | null
  disabled: boolean
  onFileChange: (file: File | null) => void
}

/**
 * The scan on a compliance document: chosen from disk, or taken off the
 * scanner on this desk.
 *
 * Scanning is offered here for the same reason it is offered in Gate Pass — a
 * registration certificate arrives as a sheet of paper, and the alternative is
 * scanning it with some other program, finding where that program put the file,
 * and attaching that.
 *
 * **Attach a file stays first and stays available in every scanner state.** A
 * vendor who emails a PDF is the ordinary case, and a machine with no scanner
 * must never be a dead end — the same rule `scan-controls.tsx` follows. The
 * scanner half is a separate component so that it only *mounts* once somebody
 * asks for it, which is also when it first probes the workstation.
 */
export function DocumentAttachmentField({
  file,
  current,
  disabled,
  onFileChange,
}: DocumentAttachmentFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)

  return (
    <>
      <input
        ref={fileInput}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const chosen = event.target.files?.[0]
          // Reset first, so choosing the same file twice still fires.
          event.target.value = ''
          if (chosen && isAllowedDocument(chosen)) {
            onFileChange(chosen)
          }
        }}
      />

      {file ? (
        <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2.5">
          <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Remove the chosen file"
            disabled={disabled}
            onClick={() => onFileChange(null)}
          >
            <X aria-hidden />
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => fileInput.current?.click()}
            >
              <FileUp data-icon="inline-start" aria-hidden />
              {current ? 'Replace the attached file' : 'Attach a file'}
            </Button>

            {!scanning && (
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => setScanning(true)}
              >
                <ScanLine data-icon="inline-start" aria-hidden />
                Scan it
              </Button>
            )}
          </div>

          {current && (
            <p className="text-xs text-muted-foreground">
              Currently holding {current.originalName} ({formatFileSize(current.size)}). A new file
              replaces it.
            </p>
          )}

          {scanning && (
            <DocumentScanPanel
              disabled={disabled}
              onScanned={onFileChange}
              onDismiss={() => setScanning(false)}
            />
          )}

          <p className="text-xs leading-snug text-muted-foreground">
            {ALLOWED_DOCUMENT_EXTENSIONS}, up to {MAX_DOCUMENT_BYTES / (1024 * 1024)} MB. A
            multi-sheet scan is stored as one PDF, because a document is one file.
          </p>
        </div>
      )}
    </>
  )
}
