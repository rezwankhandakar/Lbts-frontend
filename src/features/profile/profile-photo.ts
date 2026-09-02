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

export const IMAGE_RULES_HINT = 'JPG, PNG or WEBP · up to 5 MB'

/** Returns a message to show the user, or null when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return 'That file type is not supported. Choose a JPG, PNG or WEBP image.'
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return `That image is ${formatBytes(file.size)}. The limit is 5 MB.`
  }

  if (file.size === 0) {
    return 'That file is empty. Choose a different image.'
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
