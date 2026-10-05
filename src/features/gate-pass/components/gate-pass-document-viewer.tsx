import { useCallback, useMemo, useState } from 'react'
import { FileWarning, Loader2, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { PdfUrlView } from '@/components/shared/pdf-url-view'
import type { ZoomControls } from '@/hooks/use-zoom'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { isPdf as isPdfType } from '../lib/gate-pass-document'
import { DocumentToolbar } from './document-toolbar'
import type { ViewerControls } from './document-toolbar'
import { ImageStage } from './image-stage'

interface GatePassDocumentViewerProps {
  url: string | null
  mimeType: string | null
  pageCount: number | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
  /** Rendered in place of the document when there is nothing to show. */
  emptyAction?: React.ReactNode
  emptyMessage?: string
  onDownload?: () => void
  onReplace?: () => void
  onRemove?: () => void
  className?: string
}

/**
 * Multiples of "the whole page fits". A scanned A4 in a side panel is drawn at
 * roughly a fifth of its own resolution, so the useful steps run well past
 * doubling — reading a vehicle number off a 300 dpi scan needs four or six.
 */
const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3, 4, 6]

function useViewerControls(): ViewerControls {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const step = useCallback((direction: 1 | -1) => {
    setZoom((current) => {
      const index = ZOOM_STEPS.indexOf(current)
      const next = index === -1 ? 2 : index + direction
      return ZOOM_STEPS[Math.min(Math.max(next, 0), ZOOM_STEPS.length - 1)]
    })
  }, [])

  return useMemo(
    () => ({
      zoom,
      rotation,
      zoomIn: () => step(1),
      zoomOut: () => step(-1),
      rotateLeft: () => setRotation((value) => (value + 270) % 360),
      rotateRight: () => setRotation((value) => (value + 90) % 360),
      // Fit means fit. Rotation is a separate decision the operator made about
      // a sideways scan, and undoing it here would be a surprise.
      fit: () => setZoom(1),
    }),
    [zoom, rotation, step],
  )
}

/** The same zoom, in the shape the shared PDF renderer takes. */
function pdfZoom(controls: ViewerControls): ZoomControls {
  return {
    zoom: controls.zoom,
    zoomIn: controls.zoomIn,
    zoomOut: controls.zoomOut,
    reset: controls.fit,
    canZoomIn: controls.zoom < ZOOM_STEPS[ZOOM_STEPS.length - 1],
    canZoomOut: controls.zoom > ZOOM_STEPS[0],
  }
}

/**
 * The scanned gate pass on screen.
 *
 * Two renderers, because the two formats behave completely differently. An
 * image is ours to zoom and rotate. A PDF is drawn page by page with pdf.js
 * (`PdfUrlView`, loaded on demand) — it used to go to the browser's built-in
 * viewer in an iframe, and a mobile browser has none to embed, so a PDF scan
 * was blank on a phone.
 *
 * The URL is always an object URL: the stored document comes from an
 * authenticated endpoint, and a freshly scanned one has not been uploaded yet.
 * Whoever owns the blob owns revoking it.
 */
export function GatePassDocumentViewer({
  url,
  mimeType,
  pageCount,
  isLoading,
  error,
  onRetry,
  emptyAction,
  emptyMessage,
  onDownload,
  onReplace,
  onRemove,
  className,
}: GatePassDocumentViewerProps) {
  const t = useT()

  const controls = useViewerControls()
  const fullscreenControls = useViewerControls()
  const [fullscreen, setFullscreen] = useState(false)
  const isPdf = isPdfType(mimeType ?? '')

  const body = (() => {
    if (isLoading) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3" aria-busy>
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
          <p className="text-xs text-muted-foreground">{t('gatePass.viewer.loading')}</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center" role="alert">
          <FileWarning className="size-6 text-destructive" aria-hidden />
          <p className="text-sm font-medium">{t('gatePass.viewer.loadFailed')}</p>
          <p className="max-w-xs text-xs text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t('common.actions.retry')}
          </Button>
        </div>
      )
    }

    if (!url) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <ScanLine className="size-5" aria-hidden />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {emptyMessage ?? t('gatePass.viewer.empty')}
          </p>
          {emptyAction}
        </div>
      )
    }

    if (isPdf) {
      return (
        <PdfUrlView
          url={url}
          title={t('gatePass.viewer.scannedTitle')}
          controls={pdfZoom(controls)}
        />
      )
    }

    return <ImageStage url={url} zoom={controls.zoom} rotation={controls.rotation} />
  })()

  return (
    <>
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
        {/* An explicit height rather than a share of the panel's, because the
            panel has no height of its own to share — it is as tall as what is
            inside it. The stage below works out how big to draw the page from
            the space it is given, so that space has to be a real number before
            anything is measured.

            Deliberately not `bg-card`: a scanned page is nearly white, and it
            needs a darker ground behind it to read as a sheet of paper. */}
        <div className="h-88 shrink-0 overflow-hidden bg-muted/60 sm:h-104 lg:h-128">{body}</div>

        {url && (
          <DocumentToolbar
            controls={controls}
            isPdf={isPdf}
            pageCount={pageCount}
            onFullscreen={() => setFullscreen(true)}
            onDownload={onDownload}
            onReplace={onReplace}
            onRemove={onRemove}
          />
        )}
      </div>

      {/* Fullscreen gets its own zoom and rotation, starting from a clean fit.
          Someone opening it wants to read the whole page first; carrying the
          panel's zoom across would drop them into a corner of it. */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="flex h-[92vh] w-[96vw] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
          <DialogTitle className="sr-only">{t('gatePass.viewer.scannedTitle')}</DialogTitle>

          <div className="min-h-0 flex-1 pt-8">
            {url && isPdf && (
              <PdfUrlView
                url={url}
                title={t('gatePass.viewer.scannedTitle')}
                controls={pdfZoom(fullscreenControls)}
              />
            )}
            {url && !isPdf && (
              <ImageStage
                url={url}
                zoom={fullscreenControls.zoom}
                rotation={fullscreenControls.rotation}
              />
            )}
          </div>

          {url && (
            <DocumentToolbar
              controls={fullscreenControls}
              isPdf={isPdf}
              pageCount={pageCount}
              onFullscreen={() => setFullscreen(false)}
              onDownload={onDownload}
              isFullscreen
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
