import { toast } from 'sonner'

/**
 * What a vendor or driver photo may be.
 *
 * Mirrors `middlewares/upload.ts` — the same formats and the same 5 MB ceiling
 * an avatar has, because a photo here goes through exactly the same pipeline: a
 * 512px square WEBP on the public bucket.
 *
 * This exists purely to fail *before* a slow upload rather than after one. The
 * server is what enforces it, and a client that skipped this check would simply
 * get a 413 a minute later on a cold instance — which is the whole reason to
 * check here as well. The same arrangement `profile-photo.ts` documents.
 */

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const ALLOWED_PHOTO_EXTENSIONS = 'JPG, PNG or WEBP'

/**
 * True when the file may be uploaded, and a toast explaining why not when it
 * may not — reporting it here keeps every call site down to one `if`.
 */
export function isAllowedPhoto(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error('That file type is not supported', {
      description: `Choose a ${ALLOWED_PHOTO_EXTENSIONS} image.`,
    })
    return false
  }

  if (file.size > MAX_PHOTO_BYTES) {
    toast.error('That image is larger than 5 MB', {
      description: 'Choose a smaller file, or export it at a lower resolution.',
    })
    return false
  }

  return true
}

/**
 * What a compliance document may be. A wider set than a photo — a scanned
 * permit is legitimately a PDF — and a higher ceiling, mirroring
 * `vendor.constants.ts`. The server applies the tighter image limit once it
 * knows the real type.
 */
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024

const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

export const ALLOWED_DOCUMENT_EXTENSIONS = 'PDF, JPG, PNG or WEBP'

export function isAllowedDocument(file: File): boolean {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    toast.error('That file type is not supported', {
      description: `Attach a ${ALLOWED_DOCUMENT_EXTENSIONS} file.`,
    })
    return false
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    toast.error('That file is larger than 25 MB', {
      description: 'Scan it at a lower resolution and attach it again.',
    })
    return false
  }

  return true
}
