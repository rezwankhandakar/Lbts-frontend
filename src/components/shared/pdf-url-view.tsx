import { Suspense, lazy, useEffect, useState } from 'react'
import { FileWarning, Loader2 } from 'lucide-react'
import type { ZoomControls } from '@/hooks/use-zoom'
import { useT } from '@/lib/i18n'

/** pdf.js is only downloaded once somebody actually opens a PDF. */
const ZoomablePdf = lazy(() =>
  import('@/components/shared/zoomable-pdf').then((module) => ({ default: module.ZoomablePdf })),
)

interface PdfUrlViewProps {
  /** An object URL for bytes the app is already holding. */
  url: string
  title: string
  controls: ZoomControls
}

const SPINNER = (
  <div className="flex h-full items-center justify-center text-muted-foreground">
    <Loader2 className="size-6 animate-spin" aria-hidden />
  </div>
)

/**
 * A stored PDF drawn with pdf.js, for the viewers that hold an object URL
 * rather than a blob.
 *
 * It replaced an `<iframe src={url}>`, and the reason is phones: a mobile
 * browser has no PDF viewer to embed, so the frame came up blank (Android
 * Chrome) or as a picture of the first page (iOS Safari) while the same code
 * worked on every desk. Drawing the pages ourselves is the only thing that
 * reads the same everywhere.
 *
 * The blob is read back out of the object URL instead of being threaded down
 * beside it: the URL's owner is the hook that fetched it, and it outlives this
 * read because that hook revokes it only when the document changes.
 */
export function PdfUrlView({ url, title, controls }: PdfUrlViewProps) {
  const t = useT()

  const [loaded, setLoaded] = useState<{ url: string; blob: Blob | null } | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        if (!cancelled) {
          setLoaded({ url, blob })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded({ url, blob: null })
        }
      })

    return () => {
      cancelled = true
    }
  }, [url])

  // A result for an earlier document is not a result for this one.
  const current = loaded && loaded.url === url ? loaded : null

  if (!current) {
    return SPINNER
  }

  if (!current.blob) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center" role="alert">
        <FileWarning className="size-6 text-destructive" aria-hidden />
        <p className="text-sm text-muted-foreground">{t('shared.zoom.pdfFailed')}</p>
      </div>
    )
  }

  return (
    <Suspense fallback={SPINNER}>
      <ZoomablePdf blob={current.blob} title={title} controls={controls} />
    </Suspense>
  )
}
