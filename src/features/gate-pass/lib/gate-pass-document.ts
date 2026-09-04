import { formatBytes } from './gate-pass-meta'

/**
 * Client-side document rules. These mirror
 * `LBTS-Backend/src/modules/gate-pass/gate-pass.constants.ts` exactly, and for
 * one reason only: to fail in the browser before a 25 MB request crosses a
 * slow connection to a cold server. The server rejects the same files whatever
 * this file says — validation here is courtesy, not security. Change one,
 * change both.
 */

export const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

/** Fed straight to the file input, so the picker filters before we do. */
export const ACCEPTED_DOCUMENT_ATTRIBUTE = ACCEPTED_DOCUMENT_TYPES.join(',')

/**
 * Two limits, not one. A single scanned page is well under 10 MB; a multi-page
 * PDF off the document feeder legitimately is not.
 */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_PDF_BYTES = 25 * 1024 * 1024

export const DOCUMENT_RULES_HINT = 'PDF up to 25 MB, or JPG, PNG, WEBP up to 10 MB'

export function isPdf(mimeType: string): boolean {
  return mimeType === 'application/pdf'
}

export function maxBytesFor(mimeType: string): number {
  return isPdf(mimeType) ? MAX_PDF_BYTES : MAX_IMAGE_BYTES
}

/** Returns a message to show the user, or null when the file is acceptable. */
export function validateDocumentFile(file: File): string | null {
  if (!(ACCEPTED_DOCUMENT_TYPES as readonly string[]).includes(file.type)) {
    return 'That file type is not supported. Use a PDF, JPG, PNG or WEBP.'
  }

  if (file.size === 0) {
    return 'That file is empty. Choose a different file.'
  }

  const limit = maxBytesFor(file.type)
  if (file.size > limit) {
    return `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(limit)}.`
  }

  return null
}
