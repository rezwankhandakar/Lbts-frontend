import { toast } from 'sonner'
import { t } from '@/lib/i18n'

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

/**
 * True when the file may be uploaded, and a toast explaining why not when it
 * may not — reporting it here keeps every call site down to one `if`.
 */
export function isAllowedPhoto(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error(t('vendor.toasts.photoTypeUnsupported'), {
      description: t('vendor.toasts.photoTypeHint'),
    })
    return false
  }

  if (file.size > MAX_PHOTO_BYTES) {
    toast.error(t('vendor.toasts.photoTooLarge'), {
      description: t('vendor.toasts.photoTooLargeHint'),
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

export function isAllowedDocument(file: File): boolean {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    toast.error(t('vendor.toasts.photoTypeUnsupported'), {
      description: t('vendor.toasts.documentTypeHint'),
    })
    return false
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    toast.error(t('vendor.toasts.documentTooLarge'), {
      description: t('vendor.toasts.documentTooLargeHint'),
    })
    return false
  }

  return true
}
