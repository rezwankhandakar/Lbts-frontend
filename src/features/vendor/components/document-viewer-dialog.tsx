import { Download, Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PdfUrlView } from '@/components/shared/pdf-url-view'
import { ZoomToolbar } from '@/components/shared/zoom-toolbar'
import { useZoom } from '@/hooks/use-zoom'
import { formatFileSize } from '@/lib/format'
import { documentTypeLabel } from '../lib/vendor-meta'
import type { DocumentRecord } from '../types'
import { DocumentStatusBadge } from './status-badges'
import { useT } from '@/lib/i18n'

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
 * A PDF is drawn with pdf.js (`PdfUrlView`) rather than in an iframe: a mobile
 * browser has no PDF viewer to embed, so a frame is blank on a phone.
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
  const t = useT()
  const zoom = useZoom()

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
            <div className="h-[65svh]">
              <PdfUrlView url={url} title={document.documentType} controls={zoom} />
            </div>
          ) : url ? (
            <div className="flex h-full max-h-[65svh] items-center justify-center overflow-auto p-3">
              <img
                src={url}
                alt={t('vendor.document.viewerTitle', {
                  type: documentTypeLabel(document.documentType, t),
                  owner: document.ownerLabel,
                })}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {document.attachment
              ? t('vendor.document.fileMeta', {
                  name: document.attachment.originalName,
                  size: formatFileSize(document.attachment.size),
                })
              : t('vendor.document.noFileAttached')}
          </p>

          <div className="flex items-center justify-end gap-2">
            {url && isPdf && <ZoomToolbar controls={zoom} />}
            <Button variant="outline" size="sm" onClick={onDownload} disabled={!document.attachment}>
              <Download data-icon="inline-start" aria-hidden />
              {t('common.actions.download')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
