import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { t } from '@/lib/i18n'
import { saveBlob } from '@/lib/save-blob'
import { fetchReceivedCopy } from '../api/delivery-api'
import type { ReceivedCopyRecord } from '../types'

interface ReceivedCopyState {
  /** An object URL the viewer renders, or null while nothing is open. */
  url: string | null
  /** The bytes behind `url` — a PDF viewer with zoom draws from these. */
  blob: Blob | null
  mimeType: string | null
  isLoading: boolean
  error: string | null
}

const EMPTY: ReceivedCopyState = {
  url: null,
  blob: null,
  mimeType: null,
  isLoading: false,
  error: null,
}

/**
 * Fetches a signed challan copy and hands back an object URL for it.
 *
 * The endpoint is authenticated, so the browser cannot put it in a `src` — only
 * axios attaches the Firebase token. The file therefore comes back as a blob
 * and this hook owns the object URL made from it, which means it also has to
 * revoke it: on close, on opening another copy, and on unmount. Every one of
 * those is a leak if it is missed, and the third is the one that is easy to
 * forget.
 *
 * Imperative rather than an effect, deliberately: nothing here synchronises
 * with a prop, it happens because somebody pressed View. The same arrangement
 * `use-document-file.ts`, `use-gate-pass-document.ts` and
 * `use-challan-document.ts` use for their stored files.
 */
export function useReceivedCopy() {
  const [state, setState] = useState<ReceivedCopyState>(EMPTY)
  const urlRef = useRef<string | null>(null)
  /** Guards against a slow fetch resolving after the viewer moved on. */
  const requestRef = useRef(0)

  const revoke = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
  }, [])

  const close = useCallback(() => {
    requestRef.current += 1
    revoke()
    setState(EMPTY)
  }, [revoke])

  const open = useCallback(
    async (copy: ReceivedCopyRecord) => {
      const token = ++requestRef.current
      revoke()
      setState({ url: null, blob: null, mimeType: copy.mimeType, isLoading: true, error: null })

      try {
        const blob = await fetchReceivedCopy(copy.url)

        // The viewer moved on while this was in flight; the blob is discarded
        // rather than replacing what is now on screen.
        if (token !== requestRef.current) {
          return
        }

        const url = URL.createObjectURL(blob)
        urlRef.current = url
        setState({ url, blob, mimeType: copy.mimeType, isLoading: false, error: null })
      } catch (error) {
        if (token !== requestRef.current) {
          return
        }

        const message =
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : t('delivery.copy.loadFailed')

        setState({ url: null, blob: null, mimeType: null, isLoading: false, error: message })
      }
    },
    [revoke],
  )

  /**
   * Handing the viewer the bytes to keep.
   *
   * Fetched again rather than reused from the object URL above, so a download
   * works without opening the viewer first — and `saveBlob` is the shared
   * helper every other document module already uses for exactly this.
   */
  const download = useCallback(async (copy: ReceivedCopyRecord, fallbackName: string) => {
    try {
      const blob = await fetchReceivedCopy(copy.url)
      saveBlob(blob, copy.originalName || fallbackName)
    } catch {
      toast.error(t('delivery.copy.downloadFailed'))
    }
  }, [])

  // The last object URL outlives the component unless this runs.
  useEffect(() => revoke, [revoke])

  return { ...state, open, close, download }
}
