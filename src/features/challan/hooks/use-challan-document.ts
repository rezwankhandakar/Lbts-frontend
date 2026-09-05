import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ApiError } from '@/lib/axios'
import { fetchChallanDocument } from '../api/challan-api'

export interface DocumentSource {
  /** An object URL the viewer can put in an iframe. */
  url: string | null
  isLoading: boolean
  error: string | null
  retry: () => void
}

/** What one completed fetch produced, tagged with the request it answered. */
interface Loaded {
  key: string
  url: string | null
  error: string | null
}

/**
 * Loads a challan's stored document and hands back an object URL for it.
 *
 * The endpoint is authenticated, so the bytes cannot come from an `src`
 * attribute — only the axios interceptor attaches the Firebase token. That
 * turns a one-line `<iframe src>` into a fetch, a blob and an object URL, and
 * an object URL is a live handle into memory: it has to be revoked when it is
 * replaced and when the component goes away, or paging through a list of
 * challans leaks a PDF at a time.
 *
 * Loading is *derived* rather than stored — the result carries the key of the
 * request it answered, and anything that does not match the key being asked
 * for now is still in flight. That removes the usual isLoading flag and, with
 * it, every way the two can disagree. The same shape as
 * `useGatePassDocument`, deliberately.
 *
 * Not a TanStack Query, for the same reason as there: caching blobs across a
 * session is exactly the memory this is trying not to hold, and a challan's
 * document only changes when the challan itself does.
 */
export function useChallanDocument(id: string | null): DocumentSource {
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  // Null when there is nothing to fetch, which is also what stops the effect.
  const key = id ? `${id}:${attempt}` : null

  useEffect(() => {
    if (!key || !id) {
      return
    }

    let cancelled = false
    let objectUrl: string | null = null

    fetchChallanDocument(id)
      .then((blob) => {
        if (cancelled) {
          return
        }
        objectUrl = URL.createObjectURL(blob)
        setLoaded({ key, url: objectUrl, error: null })
      })
      .catch((failure: ApiError) => {
        if (cancelled) {
          return
        }
        setLoaded({ key, url: null, error: failure.message || 'The document could not be loaded.' })
      })

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [key, id])

  const current = loaded && loaded.key === key ? loaded : null
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  return {
    url: current?.url ?? null,
    isLoading: key !== null && current === null,
    error: current?.error ?? null,
    retry,
  }
}

/**
 * The same thing for bytes the app is already holding — a batch PDF that was
 * just downloaded, say.
 *
 * No state at all: the URL is a pure function of the blob, and the effect
 * exists only to revoke the previous one.
 */
export function useBlobUrl(blob: Blob | null): string | null {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])

  useEffect(() => {
    if (!url) {
      return
    }
    return () => URL.revokeObjectURL(url)
  }, [url])

  return url
}
