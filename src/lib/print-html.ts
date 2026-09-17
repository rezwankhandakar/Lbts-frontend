/**
 * Printing a sheet the app composes itself — a trip manifest, a vendor's
 * monthly statement — from an off-screen frame.
 *
 * HTML rather than a PDF because names on these sheets are often Bangla,
 * pdf-lib has no complex-script shaping, and the browser does. The same
 * off-screen-frame technique `print-document.ts` uses for a stored scan, so
 * the app itself still carries no print rules and Ctrl+P is left alone.
 *
 * Lifted out of the Delivery module's manifest when Accounts needed to print a
 * vendor statement: two copies of the frame dance is how one of them comes to
 * print a blank sheet.
 */

/**
 * Every value put into a printed sheet goes through this. These are strings
 * people typed, and a name is not allowed to become markup.
 */
export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function printHtml(html: string, frameId: string): void {
  document.getElementById(frameId)?.remove()

  const frame = document.createElement('iframe')
  frame.id = frameId
  frame.setAttribute('aria-hidden', 'true')
  frame.setAttribute('tabindex', '-1')
  // A real page size off-screen, for the same reason print-document gives: a
  // frame with no box may never lay its content out.
  frame.style.cssText =
    'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;pointer-events:none;'

  frame.addEventListener(
    'load',
    () => {
      const view = frame.contentWindow
      if (!view) {
        return
      }
      view.addEventListener('afterprint', () => frame.remove(), { once: true })
      view.focus()
      view.print()
    },
    { once: true },
  )

  frame.srcdoc = html
  document.body.appendChild(frame)
}
