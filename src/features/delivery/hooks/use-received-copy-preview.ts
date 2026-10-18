import { useEffect, useState } from 'react'
import { fetchReceivedCopy } from '../api/delivery-api'
import type { ReceivedCopyRecord } from '../types'

/** What one completed fetch produced, tagged with the copy it answered. */
interface Loaded {
  key: string
  url: string | null
  blob: Blob | null
  failed: boolean
}

/**
 * A filed signed copy's bytes, fetched as soon as there is one, for the small
 * preview beside it.
 *
 * The object is private, so it cannot be an `src` the browser fetches for
 * itself — only axios attaches the Firebase token. This fetches it, owns the
 * object URL made from it, and revokes that URL when the copy changes and when
 * the component goes away: the shape `useChallanFrontPages` and
 * `useChallanDocument` already have, with loading derived from the key rather
 * than stored beside it.
 *
 * **Keyed on the upload, not the path.** A copy is always served from the
 * trip-and-challan's own `/received-copy` path, so a replacement arrives at the
 * same URL — `uploadedAt` is what makes it a different picture. And it is not a
 * TanStack Query on purpose: the detail query is refetched after every write
 * on the page, and a cache entry under it would re-download the scan each time
 * somebody saved a floor number.
 */
export function useReceivedCopyPreview(copy: ReceivedCopyRecord | null) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  const path = copy?.url ?? null
  const key = copy ? `${copy.url}:${copy.uploadedAt}` : null

  useEffect(() => {
    if (!key || !path) {
      return
    }

    let cancelled = false
    let objectUrl: string | null = null

    fetchReceivedCopy(path)
      .then((blob) => {
        if (cancelled) {
          return
        }
        objectUrl = URL.createObjectURL(blob)
        setLoaded({ key, url: objectUrl, blob, failed: false })
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded({ key, url: null, blob: null, failed: true })
        }
      })

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [key, path])

  const current = loaded && loaded.key === key ? loaded : null

  return {
    url: current?.url ?? null,
    blob: current?.blob ?? null,
    isLoading: key !== null && current === null,
    failed: current?.failed ?? false,
  }
}
