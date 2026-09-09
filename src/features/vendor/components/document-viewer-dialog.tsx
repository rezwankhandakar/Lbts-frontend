import { Download, Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatFileSize } from '../lib/vendor-meta'
import type { DocumentRecord } from '../types'
import { DocumentStatusBadge } from './status-badges'

interface DocumentViewerDialogProps {
  document: DocumentRecord | null
  url: string | null
  mimeType: string | null
  isLoading: boolean
  error: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: () => void
}

/**
 * Looking at a filed document.
 *
 * The bytes arrive through axios and are rendered from an object URL, because
 * the endpoint is authenticated and the browser cannot fetch it for itself —
 * the same path Gate Pass and Challan take to their stored scans.
 *
 * **The PDF frame is not sandboxed**, and that is deliberate rather than an
 * oversight. Chrome renders a PDF through its own viewer extension, which needs
 * scripting to start: under `sandbox=""` it refuses and shows "This page has
 * been blocked by Chrome" where the document should be. The combination that
 * would work — `allow-scripts` plus `allow-same-origin`, the latter because a
 * blob: URL cannot resolve without it — removes every protection a sandbox would
 * have given, so the attribute is theatre either way. What contains this frame
 * is the content: bytes this app fetched from its own authenticated API, typed
 * `application/pdf`, which the browser hands to the PDF viewer rather than
 * parsing as a document. The Challan module documents the same decision.
 */
export function DocumentViewerDialog({
  document,
  url,
  mimeType,
  isLoading,
  error,
  open,
  onOpenChange,
  onDownload,
}: DocumentViewerDialogProps) {
  if (!document) {
    return null
  }

  const isPdf = mimeType === 'application/pdf'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92svh] w-[calc(100vw-2rem)] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {document.documentType}
            <DocumentStatusBadge value={document.status} />
          </DialogTitle>
          <DialogDescription>
            {document.ownerLabel}
            {document.documentNumber ? ` · ${document.documentNumber}` : ''} ·{' '}
            {document.expiryPhrase}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[18rem] flex-1 overflow-hidden rounded-lg border bg-muted/40">
          {isLoading ? (
            <div
              className="flex h-full min-h-[18rem] items-center justify-center gap-2 text-sm text-muted-foreground"
              aria-busy="true"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading the file…
            </div>
          ) : error ? (
            <div
              className="flex h-full min-h-[18rem] flex-col items-center justify-center gap-2 px-6 text-center"
              role="alert"
            >
              <TriangleAlert className="size-5 text-destructive" aria-hidden />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : url && isPdf ? (
            <iframe
              src={url}
              title={`${document.documentType} for ${document.ownerLabel}`}
              className="h-[65svh] w-full border-0"
            />
          ) : url ? (
            <div className="flex h-full max-h-[65svh] items-center justify-center overflow-auto p-3">
              <img
                src={url}
                alt={`${document.documentType} for ${document.ownerLabel}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {document.attachment
              ? `${document.attachment.originalName} · ${formatFileSize(document.attachment.size)}`
              : 'No file attached.'}
          </p>

          <Button variant="outline" size="sm" onClick={onDownload} disabled={!document.attachment}>
            <Download data-icon="inline-start" aria-hidden />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
