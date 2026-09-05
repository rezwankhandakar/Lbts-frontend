/** True for a PDF, which is printed by the frame holding it rather than by us. */
function isPdf(mimeType: string): boolean {
  return mimeType === 'application/pdf'
}

/**
 * Sends one stored document — a scanned gate pass, a generated challan — to
 * the printer, and nothing else.
 *
 * Printing the details page would put the sidebar, the header and a document
 * viewer on paper, and printing a summary of the record would print something
 * nobody asked for. What a gate pass is on paper is the scanned challan
 * itself; what a challan is on paper is its front pages and the LBTS back
 * page. In both cases the stored document is the thing, so this prints it and
 * only it.
 *
 * It goes through an off-screen iframe rather than the page's own print
 * styles, for two reasons. A page cannot print a PDF it embeds; the only thing
 * that can print it is the frame holding it, which is what
 * `contentWindow.print()` reaches. And an image printed from its own small
 * document needs no `@media print` rules in the app at all — no component has
 * to know the shell exists, and Ctrl+P on the app is left alone.
 *
 * The bytes are already an object URL by the time this is called: every
 * document endpoint in this API is authenticated, so a stored document can
 * never be an `src` the browser fetches for itself. That URL belongs to
 * whichever hook fetched it — `useGatePassDocument`, `useChallanDocument` —
 * and that hook revokes it; nothing here takes ownership of it.
 */

const FRAME_ID = 'lbts-print-frame'

/**
 * The whole document an image scan is printed from.
 *
 * Fit rather than fill: a challan is read off the page, and a scan cropped by
 * the paper edge has lost the corner somebody needed. `max-height: 100vh` is
 * the page box while printing, so a portrait A4 scan lands on one sheet
 * whatever resolution it arrived at.
 */
function imagePage(url: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>LBTS document</title>
    <style>
      @page { margin: 8mm; }
      html, body { margin: 0; padding: 0; background: #fff; }
      img { display: block; margin: 0 auto; max-width: 100%; max-height: 100vh; }
    </style>
  </head>
  <body><img src="${url}" alt="" /></body>
</html>`
}

/**
 * Whether the frame is showing the scan, rather than the empty document it
 * started on.
 *
 * Inserting an iframe fires a `load` for its initial `about:blank` in most
 * browsers, and printing that produces a blank sheet — the one failure here
 * that wastes paper and tells the operator nothing. So the handler proves it
 * is looking at the real document before it prints: an image that has decoded,
 * or a frame that has actually navigated to the PDF.
 */
function isShowingScan(frame: HTMLIFrameElement, url: string, pdf: boolean): boolean {
  const view = frame.contentWindow
  if (!view) {
    return false
  }

  if (pdf) {
    try {
      return view.location.href === url
    } catch {
      // A viewer that will not hand over its location has certainly navigated
      // away from about:blank, which is the only thing being ruled out.
      return true
    }
  }

  const image = frame.contentDocument?.querySelector('img')
  return Boolean(image?.complete && image.naturalWidth > 0)
}

/**
 * A frame left over from a previous print still holds a copy of that scan, so
 * each print sweeps up the last one. `afterprint` would be the tidier moment,
 * but it does not fire in every browser for a PDF, and a frame that is never
 * removed is worse than one that outlives its print dialog.
 */
function removePreviousFrame(): void {
  document.getElementById(FRAME_ID)?.remove()
}

export function printDocument(url: string, mimeType: string): void {
  removePreviousFrame()

  const pdf = isPdf(mimeType)
  const frame = document.createElement('iframe')

  frame.id = FRAME_ID
  frame.setAttribute('aria-hidden', 'true')
  frame.setAttribute('tabindex', '-1')
  /**
   * Off-screen at a real page size rather than hidden or one pixel square. A
   * frame with no box may never lay its content out, and an image that was
   * never laid out can print blank.
   */
  frame.style.cssText =
    'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;pointer-events:none;'

  frame.addEventListener('load', () => {
    const view = frame.contentWindow
    if (!view || !isShowingScan(frame, url, pdf)) {
      return
    }

    view.addEventListener('afterprint', () => frame.remove(), { once: true })

    /**
     * Chrome renders a PDF with its own viewer inside the frame, and that
     * viewer is not ready the instant the frame reports it loaded. An image
     * document has no such second stage and prints immediately.
     */
    window.setTimeout(
      () => {
        view.focus()
        view.print()
      },
      pdf ? 300 : 0,
    )
  })

  document.body.appendChild(frame)

  if (pdf) {
    frame.src = url
  } else {
    frame.srcdoc = imagePage(url)
  }
}
