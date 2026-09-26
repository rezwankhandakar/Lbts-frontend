import { t } from '@/lib/i18n'
import { useCallback, useEffect, useState } from 'react'
import { fetchChallanDocument } from '@/features/challan/api/challan-api'

interface Loaded {
  key: string
  url: string | null
  blob: Blob | null
  error: string | null
}

/**
 * A challan's stored PDF **without its LBTS back page** — just the pages the
 * office sent, which is what somebody checking a delivery wants to read.
 *
 * The back page is always the last page of a stored challan (the Challan
 * module relies on that to regenerate it), so dropping it is one `removePage`.
 * A one-page document is shown as it is rather than as nothing. pdf-lib is
 * loaded on demand, the way every other PDF writer in the app is.
 *
 * Fetches only while `id` is set, and owns the object URL: revoked when the
 * request changes and when the component goes away.
 */
export function useChallanFrontPages(id: string | null) {
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const key = id ? `${id}:${attempt}` : null

  useEffect(() => {
    if (!key || !id) {
      return
    }

    let cancelled = false
    let objectUrl: string | null = null

    const load = async () => {
      const original = await fetchChallanDocument(id)
      const { PDFDocument } = await import('pdf-lib')
      const pdf = await PDFDocument.load(new Uint8Array(await original.arrayBuffer()))

      if (pdf.getPageCount() > 1) {
        pdf.removePage(pdf.getPageCount() - 1)
      }

      const bytes = await pdf.save()
      return new Blob([bytes.slice().buffer], { type: 'application/pdf' })
    }

    load()
      .then((blob) => {
        if (cancelled) {
          return
        }
        objectUrl = URL.createObjectURL(blob)
        setLoaded({ key, url: objectUrl, blob, error: null })
      })
      .catch((failure: unknown) => {
        if (cancelled) {
          return
        }
        const message =
          typeof failure === 'object' && failure !== null && 'message' in failure
            ? String((failure as { message: unknown }).message)
            : t('delivery.dispatch.pdfLoadFailed')
        setLoaded({ key, url: null, blob: null, error: message })
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
    blob: current?.blob ?? null,
    isLoading: key !== null && current === null,
    error: current?.error ?? null,
    retry,
  }
}
