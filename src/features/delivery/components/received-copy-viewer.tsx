import { Suspense, lazy } from 'react'
import { Download, Loader2, Printer, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { printDocument } from '@/lib/print-document'
import { useZoom } from '../hooks/use-zoom'
import { formatBytes } from '../lib/receipt-rules'
import type { ReceivedCopyRecord } from '../types'
import { ZoomToolbar } from './zoom-toolbar'
import { ZoomableImage } from './zoomable-image'

/** pdf.js is only downloaded once somebody actually opens a PDF copy. */
const ZoomablePdf = lazy(() =>
  import('./zoomable-pdf').then((module) => ({ default: module.ZoomablePdf })),
)

interface ReceivedCopyViewerProps {
  copy: ReceivedCopyRecord | null
  challanNumber: string
  url: string | null
  /** The bytes behind `url`, which a PDF needs to be drawn with zoom. */
  blob: Blob | null
  mimeType: string | null
  isLoading: boolean
  error: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: () => void
}

const SPINNER = (
  <div className="flex h-full items-center justify-center text-muted-foreground">
    <Loader2 className="size-6 animate-spin" aria-hidden />
  </div>
)

/**
 * Looking at the signed copy that came back — full screen, with zoom.
 *
 * Presentational only: the bytes, the object URL and its revocation belong to
 * `useReceivedCopy`. The endpoint is authenticated, so the browser cannot fetch
 * it for itself — which is why there is a URL to own in the first place. A
 * photo is scaled directly; a PDF is drawn page by page, because nothing
 * outside the browser's own PDF frame can zoom it.
 */
export function ReceivedCopyViewer({
  copy,
  challanNumber,
  url,
  blob,
  mimeType,
  isLoading,
  error,
  open,
  onOpenChange,
  onDownload,
}: ReceivedCopyViewerProps) {
  const zoom = useZoom()

  if (!copy) {
    return null
  }

  const isPdf = mimeType === 'application/pdf'

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          zoom.reset()
        }
      }}
    >
      <DialogContent className="flex h-[96svh] w-[98vw] max-w-none flex-col gap-2 p-3 sm:max-w-none">
        <div className="flex flex-wrap items-center gap-2 pe-8">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm">
              Signed copy · <span className="font-mono">{challanNumber}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {formatBytes(copy.size)}
              {copy.pageCount ? ` · ${copy.pageCount} pages` : ''} · filed{' '}
              {new Date(copy.uploadedAt).toLocaleDateString()}
            </DialogDescription>
          </div>
          <ZoomToolbar controls={zoom} disabled={!url} />
          <Button
            variant="outline"
            size="sm"
            disabled={!url}
            onClick={() => url && mimeType && printDocument(url, mimeType)}
          >
            <Printer data-icon="inline-start" aria-hidden />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download data-icon="inline-start" aria-hidden />
            Download
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-muted/30">
          {isLoading && SPINNER}

          {error && (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <TriangleAlert className="size-6 text-destructive" aria-hidden />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {url &&
            !error &&
            (isPdf ? (
              blob && (
                <Suspense fallback={SPINNER}>
                  <ZoomablePdf blob={blob} title={`${challanNumber}-signed`} controls={zoom} />
                </Suspense>
              )
            ) : (
              <ZoomableImage key={url} url={url} alt={`Signed copy for ${challanNumber}`} controls={zoom} />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
