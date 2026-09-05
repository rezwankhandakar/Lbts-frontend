import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { PDFDocumentProxy, RenderTask, TextLayer } from 'pdfjs-dist'
import { cn } from '@/lib/utils'
import { isRenderCancelled, renderTextLayer, startPageRender } from '../lib/pdf-source'
import type { PdfZoom } from '../hooks/use-viewer-controls'
import '../lib/pdf-text-layer.css'

interface PdfPageViewProps {
  doc: PDFDocumentProxy
  pageNumber: number
  zoom: PdfZoom
  rotation: number
  /** Reports whether this page carried any selectable text. */
  onTextAvailable?: (hasText: boolean) => void
  className?: string
}

/**
 * One page of the source PDF: the canvas, and pdf.js's text layer over it.
 *
 * The canvas is sized in device pixels and displayed at CSS size, which is
 * what keeps a 300 dpi scan legible on a high-density screen — the whole job
 * here is reading a customer's address off the page and typing it beside it.
 *
 * The text layer is not decoration. This module's workflow is copy off the
 * PDF, paste into the field beside it, and a canvas alone is a picture with
 * nothing to select. The layer puts the same text runs pdf.js already knows
 * about over the page as invisible spans, so selection and Ctrl+C behave the
 * way they would in any PDF viewer. A scanned challan has no text runs at all
 * and the layer comes up empty — which is reported rather than left for the
 * operator to discover by dragging across a page and getting nothing.
 *
 * A numeric zoom is a multiple of "the whole page fits across the panel",
 * rather than a multiple of the PDF's own points. That is the only definition
 * that behaves the same in a narrow side panel and in fullscreen, and it means
 * 1 always shows the page whole — the same convention the gate pass image
 * viewer uses.
 *
 * Rendering has to be cancelled, not merely abandoned. pdf.js keeps a claim on
 * a canvas for as long as a render is in flight and **throws** on a second
 * render onto the same one rather than queuing it — so dropping a promise and
 * starting again is not a no-op, it is a page that never draws. Every path
 * that re-runs this effect hits that: changing page, zoom or rotation while a
 * render is still going, and StrictMode's double invocation in development.
 * A cancellation is therefore a normal outcome and never reported as a fault.
 */
export function PdfPageView({
  doc,
  pageNumber,
  zoom,
  rotation,
  onTextAvailable,
  className,
}: PdfPageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)

  /**
   * Held in a ref rather than a dependency: the render effect reports through
   * it, and a caller passing an inline arrow would otherwise redraw the page
   * on every parent render. Kept current in an effect rather than during
   * render, because a ref written during render is not a value React can
   * promise anything about.
   */
  const reportRef = useRef(onTextAvailable)

  useEffect(() => {
    reportRef.current = onTextAvailable
  }, [onTextAvailable])

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [isRendering, setIsRendering] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * The panel's size drives the page's size, so it has to be measured rather
   * than assumed — the workspace is a split layout that moves with the
   * viewport, and a page drawn for last render's width is blurry or clipped.
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      if (box) {
        setSize({ width: Math.floor(box.width), height: Math.floor(box.height) })
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    const textContainer = textLayerRef.current

    if (!canvas || !stage || !textContainer || size.width < 1) {
      return
    }

    let cancelled = false
    /**
     * The live render and text layer, so the cleanup can cancel both.
     *
     * pdf.js keeps a claim on a canvas while a render is in flight and refuses
     * to start a second one on it; dropping the promise does not release that
     * claim. Under StrictMode every effect runs twice, so a render that is
     * merely abandoned rather than cancelled means the second attempt throws
     * and the page never appears at all.
     */
    let task: RenderTask | null = null
    let text: TextLayer | null = null

    setIsRendering(true)
    setError(null)

    void (async () => {
      try {
        const page = await doc.getPage(pageNumber)
        const base = page.getViewport({ scale: 1, rotation })

        // Whichever of the three the caller asked for, resolved to one number:
        // how wide, in CSS pixels, this page should be drawn.
        const cssWidth = Math.max(
          zoom === 'fit-width'
            ? size.width
            : zoom === 'fit-page'
              ? Math.min(size.width, (size.height * base.width) / base.height)
              : size.width * zoom,
          80,
        )

        if (cancelled) {
          return
        }

        const render = await startPageRender(doc, pageNumber, canvas, cssWidth, rotation)
        task = render.task

        // The cleanup may have run while the page was being fetched, in which
        // case nothing above saw it and the claim has to be released here.
        if (cancelled) {
          render.task.cancel()
          return
        }

        /**
         * The stage carries the CSS size for both layers: the canvas fills it,
         * and the text layer sits on `inset: 0` over exactly the same box. One
         * number, so the spans cannot drift off the glyphs they belong to.
         */
        stage.style.width = `${cssWidth}px`
        canvas.style.width = '100%'
        canvas.style.height = 'auto'

        await render.task.promise

        if (cancelled) {
          return
        }

        setIsRendering(false)

        // After the canvas, deliberately: the page should appear as soon as it
        // is drawn rather than waiting on the text runs behind it.
        const layer = await renderTextLayer(doc, pageNumber, textContainer, cssWidth, rotation)

        if (cancelled) {
          layer.layer.cancel()
          return
        }

        text = layer.layer
        reportRef.current?.(layer.hasText)
      } catch (failure) {
        // A cancelled render is the expected outcome of paging quickly, not a
        // fault worth putting in front of anybody.
        if (cancelled || isRenderCancelled(failure)) {
          return
        }

        // The message is deliberately plain, but the reason belongs in the
        // console — "could not be drawn" is not something anyone can debug.
        console.error('[challan] page render failed', failure)
        setError('This page could not be drawn.')
        setIsRendering(false)
      }
    })()

    return () => {
      cancelled = true
      task?.cancel()
      text?.cancel()
    }
  }, [doc, pageNumber, zoom, rotation, size.width, size.height])

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full overflow-auto bg-muted/60 p-3', className)}
    >
      {isRendering && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <p role="alert" className="flex h-full items-center justify-center text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Kept mounted through an error so the canvas element survives — pdf.js
          holds its claim against that node, and swapping it out mid-render is
          how the next attempt ends up drawing onto a detached canvas. */}
      <div
        ref={stageRef}
        className={cn('relative mx-auto', error && 'hidden')}
        // A scanned page is nearly white and needs a shadow to read as a sheet
        // of paper rather than as the panel background.
      >
        <canvas ref={canvasRef} className="block rounded-sm bg-white shadow-md" aria-hidden />
        {/* Not aria-hidden: on a PDF that carries text this layer is the only
            readable version of the page, so it is what a screen reader gets. */}
        <div ref={textLayerRef} className="textLayer" />
      </div>

      <span className="sr-only">Page {pageNumber}</span>
    </div>
  )
}
