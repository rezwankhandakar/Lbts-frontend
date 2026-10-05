import { useState } from 'react'
import { Download, FileWarning, Loader2, Maximize2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { PdfUrlView } from '@/components/shared/pdf-url-view'
import { ZoomToolbar } from '@/components/shared/zoom-toolbar'
import { useZoom } from '@/hooks/use-zoom'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface ChallanDocumentViewerProps {
  url: string | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onDownload: () => void
  onPrint: () => void
  pageCount: number
  className?: string
}

/**
 * The stored challan document on screen.
 *
 * Always a PDF, and drawn with pdf.js rather than left to the browser's own
 * viewer in an iframe. That was the arrangement until it met a phone: a mobile
 * browser has no PDF viewer to embed, so the frame was blank there. pdf.js is
 * loaded on demand by `PdfUrlView`, so the page still does not pay for it
 * until a document is actually on screen.
 *
 * The URL is always an object URL: the endpoint is authenticated, so the bytes
 * cannot be an `src` the browser fetches for itself. Whoever owns the blob
 * owns revoking it — here that is `useChallanDocument`.
 */
export function ChallanDocumentViewer({
  url,
  isLoading,
  error,
  onRetry,
  onDownload,
  onPrint,
  pageCount,
  className,
}: ChallanDocumentViewerProps) {
  const t = useT()

  const [fullscreen, setFullscreen] = useState(false)
  const zoom = useZoom()
  // Fullscreen starts from a clean fit rather than the panel's zoom.
  const fullscreenZoom = useZoom()
  const title = t('challan.details.documentAria')

  const body = (() => {
    if (isLoading) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3" aria-busy>
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
          <p className="text-xs text-muted-foreground">{t('challan.goods.loadingDocument')}</p>
        </div>
      )
    }

    if (error) {
      return (
        <div
          className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
          role="alert"
        >
          <FileWarning className="size-6 text-destructive" aria-hidden />
          <p className="text-sm font-medium">{t('challan.details.loadFailed')}</p>
          <p className="max-w-xs text-xs text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t('common.actions.retry')}
          </Button>
        </div>
      )
    }

    if (!url) {
      return null
    }

    return <PdfUrlView url={url} title={title} controls={zoom} />
  })()

  return (
    <>
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
        {/* An explicit height rather than a share of the panel's, because the
            panel has no height of its own to share — it is as tall as what is
            inside it. Deliberately not `bg-card`: a challan page is nearly
            white and needs a darker ground behind it to read as paper. */}
        <div className="h-96 shrink-0 overflow-hidden bg-muted/60 sm:h-128 lg:h-152">{body}</div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-card px-2.5 py-2">
          <p className="px-1 text-xs text-muted-foreground">
            {pageCount} {pageCount === 1 ? 'page' : 'pages'}, ending with the LBTS back page
          </p>

          <div className="flex items-center gap-1">
            <ZoomToolbar controls={zoom} disabled={!url} />
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setFullscreen(true)}
              disabled={!url}
              aria-label={t('challan.pdf.fullscreen')}
            >
              <Maximize2 aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={onPrint}
              disabled={!url}
              aria-label={t('common.actions.print')}
            >
              <Printer aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={onDownload}
              aria-label={t('common.actions.download')}
            >
              <Download aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={fullscreen}
        onOpenChange={(next) => {
          setFullscreen(next)
          if (!next) {
            fullscreenZoom.reset()
          }
        }}
      >
        <DialogContent className="flex h-[92svh] w-[96vw] max-w-none flex-col gap-2 overflow-hidden p-3 sm:max-w-none">
          <div className="flex items-center gap-2 pe-8">
            <DialogTitle className="min-w-0 flex-1 truncate text-sm">{title}</DialogTitle>
            <ZoomToolbar controls={fullscreenZoom} disabled={!url} />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-muted/60">
            {url && <PdfUrlView url={url} title={title} controls={fullscreenZoom} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
