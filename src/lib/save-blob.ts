/**
 * Hands the browser bytes to save.
 *
 * Every file this module offers — a scanned document, a spreadsheet — comes
 * back through axios rather than from a link, because the endpoints behind
 * them are authenticated and a plain `href` would carry no Firebase token. So
 * the download has to be made out of a blob the app is already holding, and
 * the object URL that wraps it is owned by whoever made it: left unrevoked, a
 * 25 MB PDF stays pinned in memory for the rest of the session.
 *
 * The revoke is deferred rather than immediate. Some browsers cancel a
 * download whose URL is revoked on the same tick.
 */
const REVOKE_DELAY = 10_000

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY)
}
