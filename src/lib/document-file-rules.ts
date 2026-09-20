/**
 * What a scanned or attached **document** may be, anywhere in the app: a
 * signed challan copy coming back off a delivery, a voucher or invoice behind
 * an Accounts entry.
 *
 * Mirrored from `delivery.constants.ts` and `accounts.constants.ts`, which
 * carry the same two limits for the same reason, so the browser can refuse a
 * file before spending a minute uploading it to a sleeping instance.
 *
 * The server is what enforces these — it re-checks the size, and it proves the
 * bytes agree with the declared type by decoding them. This is courtesy, and it
 * is the same arrangement `profile-photo.ts` and `photo-rules.ts` have.
 *
 * It lived in `features/delivery/lib/receipt-rules.ts` until Accounts needed
 * the identical rule for a voucher, and moved out here then: the rule CLAUDE.md
 * sets for a helper a second feature wants is move it, not copy it. Nothing in
 * it was ever about a signed challan — it is the shape of a one-file
 * attachment, which both want in exactly the same form.
 */

export const DOCUMENT_FILE_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const DOCUMENT_FILE_ACCEPT = DOCUMENT_FILE_MIME_TYPES.join(',')

export const MAX_DOCUMENT_FILE_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_DOCUMENT_FILE_PDF_BYTES = 25 * 1024 * 1024

export const ALLOWED_DOCUMENT_FILE_EXTENSIONS = 'PDF, JPG, PNG or WEBP'

export function maxDocumentFileBytesFor(mimeType: string): number {
  return mimeType === 'application/pdf'
    ? MAX_DOCUMENT_FILE_PDF_BYTES
    : MAX_DOCUMENT_FILE_IMAGE_BYTES
}

/**
 * Why this file cannot be attached, or null when it can.
 *
 * A sentence rather than a boolean, because "that did not work" beside a file
 * picker is the least helpful thing a form can say — the two ways a file is
 * refused here are a format nobody can read and a scan at a resolution nobody
 * needed, and each has a different answer.
 */
export function documentFileProblem(file: File): string | null {
  if (!(DOCUMENT_FILE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return `That file is not a ${ALLOWED_DOCUMENT_FILE_EXTENSIONS}.`
  }

  const limit = maxDocumentFileBytesFor(file.type)
  if (file.size > limit) {
    const megabytes = Math.round(limit / (1024 * 1024))
    return file.type === 'application/pdf'
      ? `That PDF is larger than ${megabytes} MB.`
      : `That image is larger than ${megabytes} MB. Scan it as a PDF, or at a lower resolution.`
  }

  return null
}

/** A file size as somebody reads it. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
