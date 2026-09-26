import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { t } from '@/lib/i18n'
import { saveBlob } from '@/lib/save-blob'
import { fetchEntryVoucher } from '../api/accounts-api'
import type { EntryRecord, EntryVoucher } from '../types'

interface VoucherViewState {
  /** The entry whose voucher is open, or null while nothing is. */
  entry: EntryRecord | null
  /** An object URL the viewer renders. */
  url: string | null
  /** The bytes behind `url` — a PDF drawn with zoom is rendered from these. */
  blob: Blob | null
  mimeType: string | null
  isLoading: boolean
  error: string | null
}

const EMPTY: VoucherViewState = {
  entry: null,
  url: null,
  blob: null,
  mimeType: null,
  isLoading: false,
  error: null,
}

/**
 * Fetches an entry's voucher and hands back an object URL for it.
 *
 * The endpoint is authenticated, so the browser cannot put it in a `src` — only
 * axios attaches the Firebase token. The file therefore comes back as a blob
 * and this hook owns the object URL made from it, which means it also has to
 * revoke it: on close, on opening another voucher, and on unmount. Every one of
 * those is a leak if it is missed, and the third is the one that is easy to
 * forget.
 *
 * Imperative rather than an effect, deliberately: nothing here synchronises
 * with a prop, it happens because somebody pressed the paperclip. The same
 * arrangement `use-received-copy.ts` and `use-document-file.ts` use.
 */
export function useEntryVoucher() {
  const [state, setState] = useState<VoucherViewState>(EMPTY)
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
    async (entry: EntryRecord) => {
      const voucher = entry.voucher
      if (!voucher) {
        return
      }

      const token = ++requestRef.current
      revoke()
      setState({ entry, url: null, blob: null, mimeType: voucher.mimeType, isLoading: true, error: null })

      try {
        const blob = await fetchEntryVoucher(voucher)

        // The viewer moved on while this was in flight; the blob is discarded
        // rather than replacing what is now on screen.
        if (token !== requestRef.current) {
          return
        }

        const url = URL.createObjectURL(blob)
        urlRef.current = url
        setState({ entry, url, blob, mimeType: voucher.mimeType, isLoading: false, error: null })
      } catch (error) {
        if (token !== requestRef.current) {
          return
        }

        const message =
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : t('accounts.toasts.voucherLoadFailed')

        setState({ entry, url: null, blob: null, mimeType: null, isLoading: false, error: message })
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
  const download = useCallback(async (voucher: EntryVoucher, fallbackName: string) => {
    try {
      const blob = await fetchEntryVoucher(voucher)
      saveBlob(blob, voucher.originalName || fallbackName)
    } catch {
      toast.error(t('accounts.toasts.voucherDownloadFailed'))
    }
  }, [])

  // The last object URL outlives the component unless this runs.
  useEffect(() => revoke, [revoke])

  return { ...state, open, close, download }
}
