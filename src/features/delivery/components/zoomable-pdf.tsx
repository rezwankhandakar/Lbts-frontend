import { useEffect, useRef, useState } from 'react'
import { FileWarning, Loader2 } from 'lucide-react'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { isRenderCancelled, openSourcePdf, startPageRender } from '@/features/challan/lib/pdf-source'
import { useZoomSurface } from '../hooks/use-zoom'
import type { ZoomControls } from '../hooks/use-zoom'

interface ZoomablePdfProps {
  blob: Blob
  title: string
  controls: ZoomControls
}

/**
 * A PDF drawn page by page with pdf.js, so the zoom buttons actually zoom.
 *
 * The browser's own viewer in an iframe has its zoom, but nothing outside the
 * frame can drive it — buttons beside it would do nothing. So the pages are
 * rendered onto canvases at the size the zoom asks for, stacked for scrolling,
 * through the Challan module's own `openSourcePdf` and `startPageRender`.
 *
 * pdf.js is heavy, so the dialogs load this file with `lazy()`: nobody downloads
 * it until they open a PDF.
 */
export function ZoomablePdf({ blob, title, controls }: ZoomablePdfProps) {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const size = useZoomSurface(surfaceRef, controls)
  const [loaded, setLoaded] = useState<{ blob: Blob; doc: PDFDocumentProxy | null; error: string | null } | null>(null)

  useEffect(() => {
    let cancelled = false
    let opened: PDFDocumentProxy | null = null

    openSourcePdf(new File([blob], `${title}.pdf`, { type: 'application/pdf' }))
      .then((source) => {
        if (cancelled) {
          void source.doc.loadingTask.destroy()
          return
        }
        opened = source.doc
        setLoaded({ blob, doc: source.doc, error: null })
      })
      .catch((failure: unknown) => {
        if (!cancelled) {
          setLoaded({
            blob,
            doc: null,
            error: failure instanceof Error ? failure.message : 'The PDF could not be opened.',
          })
        }
      })

    return () => {
      cancelled = true
      if (opened) {
        void opened.loadingTask.destroy()
      }
    }
  }, [blob, title])

  // A result for an earlier file is not a result for this one.
  const current = loaded && loaded.blob === blob ? loaded : null

  return (
    <div ref={surfaceRef} className="relative size-full overflow-auto p-3">
      {!current && (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-hidden />
        </div>
      )}

      {current?.error && (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center" role="alert">
          <FileWarning className="size-6 text-destructive" aria-hidden />
          <p className="text-sm text-muted-foreground">{current.error}</p>
        </div>
      )}

      {current?.doc && (
        <div className="space-y-3">
          {Array.from({ length: current.doc.numPages }, (_, index) => (
            <PdfCanvasPage
              key={index}
              doc={current.doc as PDFDocumentProxy}
              pageNumber={index + 1}
              zoom={controls.zoom}
              surface={size}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PdfCanvasPageProps {
  doc: PDFDocumentProxy
  pageNumber: number
  zoom: number
  surface: { width: number; height: number }
}

/**
 * One page. Its CSS width is "the whole page fits the box" times the zoom; the
 * render is cancelled rather than abandoned whenever that changes, because
 * pdf.js throws on a second render onto a canvas it is still drawing — the
 * reason `PdfPageView` in Challan gives at length.
 */
function PdfCanvasPage({ doc, pageNumber, zoom, surface }: PdfCanvasPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || surface.width < 1) {
      return
    }

    let cancelled = false
    let task: RenderTask | null = null

    void (async () => {
      try {
        const page = await doc.getPage(pageNumber)
        const base = page.getViewport({ scale: 1 })
        const fit = Math.min(surface.width, (surface.height * base.width) / base.height)
        const cssWidth = Math.max(fit * zoom, 80)

        if (cancelled) {
          return
        }

        const render = await startPageRender(doc, pageNumber, canvas, cssWidth)
        if (cancelled) {
          render.task.cancel()
          return
        }

        task = render.task
        canvas.style.width = `${cssWidth}px`
        await render.task.promise
      } catch (failure) {
        if (!cancelled && !isRenderCancelled(failure)) {
          console.error('[delivery] page render failed', failure)
        }
      }
    })()

    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [doc, pageNumber, zoom, surface.width, surface.height])

  return (
    <canvas
      ref={canvasRef}
      className="mx-auto block h-auto rounded-sm bg-white shadow-md"
      style={{ maxWidth: 'none' }}
      aria-label={`Page ${pageNumber}`}
    />
  )
}
