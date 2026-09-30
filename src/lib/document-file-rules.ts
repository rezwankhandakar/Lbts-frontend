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

import { formatFileSize } from '@/lib/format'
import type { Translator } from '@/lib/i18n'

export const DOCUMENT_FILE_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const DOCUMENT_FILE_ACCEPT = DOCUMENT_FILE_MIME_TYPES.join(',')

export const MAX_DOCUMENT_FILE_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_DOCUMENT_FILE_PDF_BYTES = 25 * 1024 * 1024

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
export function documentFileProblem(file: File, t: Translator): string | null {
  if (!(DOCUMENT_FILE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return t('shared.documentFile.wrongType')
  }

  const limit = maxDocumentFileBytesFor(file.type)
  if (file.size > limit) {
    const size = formatFileSize(limit)
    return file.type === 'application/pdf'
      ? t('shared.documentFile.pdfTooLarge', { size })
      : t('shared.documentFile.imageTooLarge', { size })
  }

  return null
}

/**
 * A file size as somebody reads it — the shared formatter, re-exported under the
 * name this module's callers already use. It shapes its digits for the viewer's
 * own locale, which a local copy did not.
 */
export { formatFileSize as formatBytes } from '@/lib/format'
