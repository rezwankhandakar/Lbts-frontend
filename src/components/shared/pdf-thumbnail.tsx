import { useEffect, useRef, useState } from 'react'
import { FileText } from 'lucide-react'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { isRenderCancelled, openSourcePdf, startPageRender } from '@/features/challan/lib/pdf-source'

interface PdfThumbnailProps {
  blob: Blob
  /** The width it is drawn at, in CSS pixels. The height follows the page. */
  width: number
  className?: string
}

/**
 * The first page of a PDF, drawn small — a preview, not a viewer.
 *
 * The same pdf.js path `ZoomablePdf` draws with (`openSourcePdf`, then
 * `startPageRender` onto a canvas), cut down to one page at one size. The
 * render is cancelled rather than abandoned on cleanup, for the reason
 * `PdfPageView` gives: pdf.js throws on a second render onto a canvas it is
 * still drawing. A file pdf.js cannot read draws a document icon instead,
 * because a preview that fails is a missing picture, not an error to report —
 * opening the copy is still one press away.
 *
 * Heavy, so callers load it with `lazy()`: nobody downloads pdf.js until a PDF
 * is actually on screen. Key it on the blob — a failure belongs to one file.
 */
export function PdfThumbnail({ blob, width, className }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    let cancelled = false
    let doc: PDFDocumentProxy | null = null
    let task: RenderTask | null = null

    void (async () => {
      try {
        const source = await openSourcePdf(new File([blob], 'preview.pdf', { type: 'application/pdf' }))
        if (cancelled) {
          void source.doc.loadingTask.destroy()
          return
        }
        doc = source.doc

        const render = await startPageRender(source.doc, 1, canvas, width)
        if (cancelled) {
          render.task.cancel()
          return
        }

        task = render.task
        canvas.style.width = `${width}px`
        await render.task.promise
      } catch (failure) {
        if (!cancelled && !isRenderCancelled(failure)) {
          setFailed(true)
        }
      }
    })()

    return () => {
      cancelled = true
      task?.cancel()
      if (doc) {
        void doc.loadingTask.destroy()
      }
    }
  }, [blob, width])

  if (failed) {
    return <FileText className="size-6 text-muted-foreground" aria-hidden />
  }

  return <canvas ref={canvasRef} className={className} style={{ maxWidth: 'none' }} aria-hidden />
}
