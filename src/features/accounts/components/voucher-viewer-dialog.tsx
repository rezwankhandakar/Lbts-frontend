import { Suspense, lazy } from 'react'
import { Download, Loader2, Printer, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ZoomToolbar } from '@/components/shared/zoom-toolbar'
import { ZoomableImage } from '@/components/shared/zoomable-image'
import { useZoom } from '@/hooks/use-zoom'
import { formatBytes } from '@/lib/document-file-rules'
import { printDocument } from '@/lib/print-document'
import { KIND_META, formatDay, taka } from '../lib/accounts-meta'
import type { EntryRecord } from '../types'

/** pdf.js is only downloaded once somebody actually opens a PDF voucher. */
const ZoomablePdf = lazy(() =>
  import('@/components/shared/zoomable-pdf').then((module) => ({ default: module.ZoomablePdf })),
)

interface VoucherViewerDialogProps {
  entry: EntryRecord | null
  url: string | null
  /** The bytes behind `url`, which a PDF needs to be drawn with zoom. */
  blob: Blob | null
  mimeType: string | null
  isLoading: boolean
  error: string | null
  onClose: () => void
  onDownload: () => void
}

const SPINNER = (
  <div className="flex h-full items-center justify-center text-muted-foreground">
    <Loader2 className="size-6 animate-spin" aria-hidden />
  </div>
)

/**
 * Looking at the paper behind an entry — full screen, with zoom.
 *
 * It is the shape `ReceivedCopyViewer` already uses, down to the shared zoom
 * pieces, because it is the same job: a scanned sheet somebody has to read a
 * figure off. A fuel bill photographed at a pump and a manifest off the feeder
 * are both A4 portrait, and a dialog sized to a form leaves them either
 * unreadably small or scrolled in a box — which is what this replaced.
 *
 * Two layout facts do the fitting, and both are easy to get wrong:
 * `min-h-0` on the flex child, or it refuses to shrink below its content; and a
 * surface the image measures itself against, rather than a `h-full` resolving
 * against a height nothing has stated, which silently falls back to the image's
 * natural size.
 *
 * Presentational only: the bytes, the object URL and its revocation belong to
 * `useEntryVoucher`. The endpoint is authenticated, so the browser cannot fetch
 * it for itself — which is why there is a URL to own in the first place. A
 * photo is scaled directly; a PDF is drawn page by page, because nothing
 * outside the browser's own PDF frame can zoom it.
 */
export function VoucherViewerDialog({
  entry,
  url,
  blob,
  mimeType,
  isLoading,
  error,
  onClose,
  onDownload,
}: VoucherViewerDialogProps) {
  const zoom = useZoom()

  if (!entry?.voucher) {
    return null
  }

  const voucher = entry.voucher
  const isPdf = mimeType === 'application/pdf'
  const title = `Voucher for ${entry.entryNumber}`

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) {
          zoom.reset()
          onClose()
        }
      }}
    >
      <DialogContent className="flex h-[96svh] w-[98vw] max-w-none flex-col gap-2 p-3 sm:max-w-none">
        <div className="flex flex-wrap items-center gap-2 pe-8">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm">
              Voucher · <span className="font-mono">{entry.entryNumber}</span>
            </DialogTitle>
            <DialogDescription className="truncate text-xs">
              {KIND_META[entry.kind].label} · {taka(entry.amount)} · {formatDay(entry.date)}
              {entry.expenseName ? ` · ${entry.expenseName}` : ''} · {formatBytes(voucher.size)}
              {voucher.pageCount ? ` · ${voucher.pageCount} sheets` : ''}
              {voucher.uploadedBy ? ` · attached by ${voucher.uploadedBy.name}` : ''}
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

        {/* `min-h-0` is what lets this shrink to the dialog rather than to its
            own content — without it the sheet inside decides the height and
            overflows instead of fitting. */}
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
                  <ZoomablePdf blob={blob} title={entry.entryNumber} controls={zoom} />
                </Suspense>
              )
            ) : (
              <ZoomableImage key={url} url={url} alt={title} controls={zoom} />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
