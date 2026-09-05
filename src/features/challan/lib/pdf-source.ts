import * as pdfjs from 'pdfjs-dist'
import type { PDFDocumentProxy, RenderTask, TextLayer } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { MAX_SOURCE_FILE_BYTES, MAX_SOURCE_PAGES } from '../types'

/**
 * The temporary source PDF, and everything done to it — all of it here, in the
 * browser.
 *
 * This file is the reason the Challan module can promise that the WhatsApp PDF
 * an operator opens is never stored anywhere. It is read into memory, rendered
 * for reading, and sliced for submission, and none of those steps involves the
 * API. What crosses the network is only the handful of pages that became a
 * challan somebody actually filed.
 *
 * Two libraries, because they do genuinely different jobs and neither does the
 * other one's. **pdf.js** rasterises a page onto a canvas and pulls the text
 * layer out of it — that is the reading half, and it is what makes page
 * navigation, zoom and "extract text" possible at all. **pdf-lib** copies page
 * objects from one document into another without touching their content — that
 * is the slicing half, and it is what keeps an original challan page byte-for-
 * byte identical on its way to R2 rather than a picture of itself.
 *
 * The Gate Pass module deliberately leaves PDFs to the browser's own viewer,
 * and CLAUDE.md says so. This module cannot: choosing a page range means
 * seeing the pages, and a built-in viewer will not tell an app which page it
 * is showing. The renderer is the price of the page-range selector, and it is
 * paid only on this route — the Challan pages are lazy-loaded, so nothing else
 * in the app carries it.
 */

/**
 * pdf.js runs its parser in a worker. Vite resolves this to a hashed asset URL
 * at build time, so the worker is a real file next to the bundle rather than
 * something fetched off a CDN — which matters because the deployed app has a
 * strict origin and no CDN in its supply chain.
 */
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export class SourcePdfError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SourcePdfError'
  }
}

export interface SourcePdf {
  /** The document handle pdf.js renders from. */
  doc: PDFDocumentProxy
  /**
   * Our own copy of the bytes, kept because pdf.js detaches the buffer it is
   * handed. Without a second copy, extracting a page range after the file had
   * been opened would fail on a zero-length array.
   */
  bytes: Uint8Array
  fileName: string
  fileSize: number
  pageCount: number
}

/** Whether the bytes actually are a PDF, whatever the file dialog claimed. */
function hasPdfSignature(bytes: Uint8Array): boolean {
  return (
    bytes.length > 5 &&
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d // -
  )
}

/**
 * Opens a source PDF for the workspace.
 *
 * Every failure here is phrased for the operator, because every one of them is
 * something they can act on — a file that is not a PDF, one that is password
 * protected, one too large for a browser tab to hold comfortably. None of them
 * reaches a server, so none of them can be phrased as a server error.
 */
export async function openSourcePdf(file: File): Promise<SourcePdf> {
  if (file.size === 0) {
    throw new SourcePdfError('That file is empty. Choose the PDF again.')
  }

  if (file.size > MAX_SOURCE_FILE_BYTES) {
    const limit = Math.round(MAX_SOURCE_FILE_BYTES / (1024 * 1024))
    throw new SourcePdfError(
      `That PDF is ${formatBytes(file.size)}. This workspace opens files up to ${limit} MB.`,
    )
  }

  const bytes = new Uint8Array(await file.arrayBuffer())

  if (!hasPdfSignature(bytes)) {
    throw new SourcePdfError('That file is not a PDF. Choose the challan PDF from WhatsApp.')
  }

  let doc: PDFDocumentProxy

  try {
    // A fresh copy, because the loading task takes ownership of what it is
    // given and leaves the original detached.
    doc = await pdfjs.getDocument({ data: bytes.slice() }).promise
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message.toLowerCase().includes('password')) {
      throw new SourcePdfError(
        'That PDF is password protected. Remove the protection and open it again.',
      )
    }

    throw new SourcePdfError('That PDF could not be opened. It may be damaged.')
  }

  if (doc.numPages > MAX_SOURCE_PAGES) {
    await doc.loadingTask.destroy()
    throw new SourcePdfError(
      `That PDF has ${doc.numPages} pages. This workspace handles up to ${MAX_SOURCE_PAGES}.`,
    )
  }

  return {
    doc,
    bytes,
    fileName: file.name,
    fileSize: file.size,
    pageCount: doc.numPages,
  }
}

export interface PageRender {
  /**
   * The live render. **The caller must cancel it** if it stops caring before
   * the promise settles.
   *
   * pdf.js refuses to start a second render on a canvas one is already using —
   * "Cannot use the same canvas during multiple render() operations" — and
   * abandoning a promise does not release that claim. Effects run twice under
   * StrictMode and re-run whenever the page, zoom or rotation changes, so
   * without a real cancel the second render of any page throws and the panel
   * shows nothing.
   */
  task: RenderTask
  /** Device pixels. The caller sizes the element in CSS pixels itself. */
  width: number
  height: number
}

/**
 * Sizes a canvas for one page and starts drawing it.
 *
 * The canvas is sized in device pixels and displayed at CSS size, which is
 * what keeps a 300 dpi scan legible on a high-density screen — the whole point
 * of the viewer is reading a customer's address off it. Capped, because the
 * product of scale and device ratio on a large monitor can otherwise ask a
 * browser for a canvas it refuses to allocate.
 *
 * Returns as soon as the render has *started* rather than awaiting it, so the
 * caller holds the task and can cancel it. Only `canvas` is passed to pdf.js,
 * not a context of our own: v5 onwards takes the canvas and derives the
 * context itself with the options it wants.
 */
const MAX_CANVAS_PIXELS = 8_000_000

export async function startPageRender(
  doc: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  cssWidth: number,
  rotation = 0,
): Promise<PageRender> {
  const page = await doc.getPage(pageNumber)
  const base = page.getViewport({ scale: 1, rotation })

  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  let scale = (cssWidth / base.width) * ratio

  const viewport = page.getViewport({ scale, rotation })

  if (viewport.width * viewport.height > MAX_CANVAS_PIXELS) {
    scale *= Math.sqrt(MAX_CANVAS_PIXELS / (viewport.width * viewport.height))
  }

  const final = page.getViewport({ scale, rotation })

  canvas.width = Math.floor(final.width)
  canvas.height = Math.floor(final.height)

  return {
    task: page.render({ canvas, viewport: final }),
    width: canvas.width,
    height: canvas.height,
  }
}

/** True for the rejection pdf.js uses to report a render the caller cancelled. */
export function isRenderCancelled(error: unknown): boolean {
  return (error as { name?: string } | null)?.name === 'RenderingCancelledException'
}

export interface PageTextLayer {
  /** Cancel it the way a render task is cancelled, on the same cleanup. */
  layer: TextLayer
  /**
   * Whether this page actually carried any text.
   *
   * False for a scanned challan, which is most of them — and worth reporting
   * rather than leaving the operator to discover that dragging across the page
   * selects nothing and wonder which of the two is broken.
   */
  hasText: boolean
}

/**
 * Lays pdf.js's text layer over the rendered page.
 *
 * Without this the viewer is a picture. The entire workflow this module is
 * built around is reading a value off the challan and pasting it into the
 * field beside it, and a canvas has nothing to select — so the same text runs
 * pdf.js already extracted are placed over the page as invisible, absolutely
 * positioned spans, and the browser does the selecting and copying itself.
 *
 * The spans are positioned as percentages of the page, so the container only
 * has to cover exactly the same box as the canvas — `inset: 0` inside the
 * stage wrapper does that, and no size is written here. What does have to be
 * written is `--total-scale-factor`: every span's font size is derived from
 * it, so at the wrong value the text is correctly placed and the wrong size,
 * and a selection drag picks up neighbouring lines.
 *
 * Note the scale is the **CSS** scale, not the canvas's. The canvas is drawn
 * at device pixels and displayed smaller; the text layer lives in CSS pixels.
 */
export async function renderTextLayer(
  doc: PDFDocumentProxy,
  pageNumber: number,
  container: HTMLElement,
  cssWidth: number,
  rotation = 0,
): Promise<PageTextLayer> {
  const page = await doc.getPage(pageNumber)
  const base = page.getViewport({ scale: 1, rotation })
  const scale = cssWidth / base.width
  const viewport = page.getViewport({ scale, rotation })

  // Spans from the previous page would otherwise stay and be selectable.
  container.replaceChildren()
  container.style.setProperty('--total-scale-factor', String(scale))

  const layer = new pdfjs.TextLayer({
    textContentSource: page.streamTextContent(),
    container,
    viewport,
  })

  await layer.render()

  return {
    layer,
    hasText: layer.textContentItemsStr.some((item) => item.trim().length > 0),
  }
}

/**
 * The selectable text on a range of pages.
 *
 * Assistive only, and honest about it: many Walton challans are scans with no
 * text layer at all, and this returns an empty string for those rather than
 * pretending. There is no OCR here and the UI must not imply there is — the
 * operator reads the page and types, and this only saves them the retyping
 * when the PDF happens to carry real text.
 */
export async function extractText(
  doc: PDFDocumentProxy,
  startPage: number,
  endPage: number,
): Promise<string> {
  const parts: string[] = []

  for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
    const page = await doc.getPage(pageNumber)
    const content = await page.getTextContent()

    const lines: string[] = []
    let current = ''
    let lastY: number | null = null

    for (const item of content.items) {
      if (!('str' in item)) {
        continue
      }

      // pdf.js emits runs, not lines. The vertical position is what separates
      // one line of a challan from the next; without it an address and a phone
      // number arrive glued together.
      const y = item.transform[5] as number
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        lines.push(current.trim())
        current = ''
      }

      current += item.str
      if (item.hasEOL) {
        lines.push(current.trim())
        current = ''
      }
      lastY = y
    }

    if (current.trim()) {
      lines.push(current.trim())
    }

    const text = lines.filter((line) => line.length > 0).join('\n')
    if (text) {
      parts.push(text)
    }
  }

  return parts.join('\n\n')
}

/**
 * Cuts one challan's pages out of the source, as a new PDF.
 *
 * `copyPages` lifts each page object and its resources across unchanged, so
 * what is uploaded is the original page and not a rendering of it — the text
 * stays selectable, a vector challan stays vector, and a scan is not
 * re-compressed. That is the difference between an archive and a photocopy of
 * an archive.
 *
 * This is the only thing in the module that ever leaves the browser, and it is
 * why the source file does not have to: fifteen challans out of a 24-page PDF
 * upload fifteen small extracts rather than the same 24 pages fifteen times.
 */
export async function extractPageRange(
  bytes: Uint8Array,
  startPage: number,
  endPage: number,
): Promise<Uint8Array> {
  /**
   * pdf-lib is loaded on demand rather than at module scope, the same way the
   * backend defers ExcelJS. It is only needed at the moment a challan is
   * filed — reading and paging the source PDF is entirely pdf.js — so keeping
   * it out of the workspace's initial chunk means an operator who opens a file
   * and reads it never downloads a library they have not used yet.
   */
  const { PDFDocument } = await import('pdf-lib')

  const source = await PDFDocument.load(bytes)
  const total = source.getPageCount()

  if (startPage < 1 || endPage > total || endPage < startPage) {
    throw new SourcePdfError(
      `Pages ${startPage}–${endPage} are not inside this PDF, which has ${total}.`,
    )
  }

  const output = await PDFDocument.create()
  // pdf-lib indexes from zero; the operator counts from one.
  const indices = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i)

  for (const page of await output.copyPages(source, indices)) {
    output.addPage(page)
  }

  return output.save()
}

/** The extracted range as a File, which is what a multipart body wants. */
export async function extractPageRangeAsFile(
  bytes: Uint8Array,
  startPage: number,
  endPage: number,
  challanLabel: string,
): Promise<File> {
  const extracted = await extractPageRange(bytes, startPage, endPage)

  return new File([extracted as BlobPart], `${challanLabel}.pdf`, { type: 'application/pdf' })
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
