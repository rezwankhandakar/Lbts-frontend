import type { Translator } from '@/lib/i18n'

/**
 * Client-side image rules. These mirror `LBTS-Backend/src/middlewares/upload.ts`
 * exactly, and for one reason only: to fail in the browser before a 5 MB
 * request crosses a slow connection to a cold server. The server rejects the
 * same files whatever this file says — validation here is courtesy, not
 * security. Change one, change both.
 */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Fed straight to the file input, so the picker filters before we do. */
export const ACCEPTED_IMAGE_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',')

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/**
 * Why a file was refused, as a message already fit to show — or null when the
 * file is acceptable.
 *
 * Takes the translator for the reason `providerLabels` does: the caller holds
 * `useT()`, and this is called from an event handler where the result goes
 * straight into a toast.
 */
export function validateImageFile(file: File, t: Translator): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return t('profile.photo.badType')
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return t('profile.photo.tooLarge', { size: formatBytes(file.size) })
  }

  if (file.size === 0) {
    return t('profile.photo.empty')
  }

  return null
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
