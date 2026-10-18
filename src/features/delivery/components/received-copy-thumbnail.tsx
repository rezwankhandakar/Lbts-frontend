import { Suspense, lazy } from 'react'
import { FileText, Loader2, Maximize2 } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { useReceivedCopyPreview } from '../hooks/use-received-copy-preview'
import type { ReceivedCopyRecord } from '../types'

const PdfThumbnail = lazy(() =>
  import('@/components/shared/pdf-thumbnail').then((module) => ({ default: module.PdfThumbnail })),
)

/** The preview's width in CSS pixels; its box is A4-ish below it. */
const WIDTH = 64

/**
 * The signed copy, small, beside its file name — so the operator who has just
 * scanned it sees *that* sheet came off the glass rather than a file name the
 * scanner made up. A blank page, the wrong challan, the back of a sheet: each
 * is obvious at this size and invisible as `scan-8107d252.jpg`.
 *
 * Pressing it opens the full viewer, the same as View. An image is drawn as
 * itself and a PDF as its first page, through a pdf.js renderer loaded only
 * when one is on screen. Cropped to the top of the sheet rather than fitted,
 * because the top is where a challan says which one it is.
 *
 * Mount it keyed on the upload — `uploadedAt` — so a replaced copy is a new
 * preview rather than the old one waiting for its bytes.
 */
export function ReceivedCopyThumbnail({
  copy,
  onOpen,
}: {
  copy: ReceivedCopyRecord
  onOpen: () => void
}) {
  const t = useT()

  const preview = useReceivedCopyPreview(copy)
  const isPdf = copy.mimeType === 'application/pdf'

  const placeholder = <FileText className="size-6 text-muted-foreground" aria-hidden />
  const spinner = <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t('delivery.copy.openPreview')}
      title={t('delivery.copy.openPreview')}
      className="group relative flex h-20 w-16 shrink-0 items-start justify-center overflow-hidden rounded-md border bg-background shadow-xs transition outline-none hover:ring-2 hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-full items-start justify-center">
        {preview.isLoading ? (
          <span className="flex size-full items-center justify-center">{spinner}</span>
        ) : preview.failed || !preview.url || !preview.blob ? (
          <span className="flex size-full items-center justify-center">{placeholder}</span>
        ) : isPdf ? (
          <Suspense fallback={<span className="flex size-full items-center justify-center">{spinner}</span>}>
            <PdfThumbnail key={preview.url} blob={preview.blob} width={WIDTH} className="block h-auto" />
          </Suspense>
        ) : (
          <img src={preview.url} alt="" className="size-full object-cover object-top" />
        )}
      </span>

      {/* A scrim that stays dark under its icon in both themes — `foreground`
          would invert into a light one in dark mode. */}
      <span
        className="absolute inset-0 flex items-center justify-center bg-primary/60 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden
      >
        <Maximize2 className="size-4" />
      </span>
    </button>
  )
}
