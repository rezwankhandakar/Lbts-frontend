import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { saveBlob } from '@/lib/save-blob'
import { fetchDocumentFile } from '../api/vendor-api'
import type { DocumentRecord } from '../types'

interface DocumentFileState {
  /** An object URL the viewer renders, or null while nothing is open. */
  url: string | null
  mimeType: string | null
  isLoading: boolean
  error: string | null
}

const EMPTY: DocumentFileState = { url: null, mimeType: null, isLoading: false, error: null }

/**
 * Fetches a document's file and hands back an object URL for it.
 *
 * The endpoint is authenticated, so the browser cannot put it in a `src` — only
 * axios attaches the Firebase token. The file therefore comes back as a blob and
 * this hook owns the object URL made from it, which means it also has to revoke
 * it: on close, on switching to another document, and on unmount. Every one of
 * those is a leak if it is missed, and the third is the one that is easy to
 * forget.
 *
 * The same arrangement `use-gate-pass-document.ts` and `use-challan-document.ts`
 * use for their stored scans.
 */
export function useDocumentFile() {
  const [state, setState] = useState<DocumentFileState>(EMPTY)
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
    async (document: DocumentRecord) => {
      if (!document.attachment) {
        return
      }

      const token = ++requestRef.current
      revoke()
      setState({ url: null, mimeType: document.attachment.mimeType, isLoading: true, error: null })

      try {
        const blob = await fetchDocumentFile(document.id)

        // The viewer moved on while this was in flight; the blob is discarded
        // rather than replacing what is now on screen.
        if (token !== requestRef.current) {
          return
        }

        const url = URL.createObjectURL(blob)
        urlRef.current = url
        setState({
          url,
          mimeType: document.attachment.mimeType,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        if (token !== requestRef.current) {
          return
        }

        const message =
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : 'The file could not be loaded.'

        setState({ url: null, mimeType: null, isLoading: false, error: message })
      }
    },
    [revoke],
  )

  /**
   * Handing the viewer the bytes to keep.
   *
   * Fetched again rather than reused from the object URL above, so a download
   * works from a row without opening the viewer first — and `saveBlob` is the
   * shared helper the other two document modules already use for exactly this.
   */
  const download = useCallback(async (document: DocumentRecord) => {
    if (!document.attachment) {
      return
    }

    try {
      const blob = await fetchDocumentFile(document.id)
      saveBlob(blob, document.attachment.originalName)
    } catch {
      toast.error('That file could not be downloaded.')
    }
  }, [])

  // The last object URL outlives the component unless this runs.
  useEffect(() => revoke, [revoke])

  return { ...state, open, close, download }
}
