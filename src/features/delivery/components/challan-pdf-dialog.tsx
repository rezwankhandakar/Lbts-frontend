import { Suspense, lazy } from 'react'
import { Download, FileWarning, Loader2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { printDocument } from '@/lib/print-document'
import { saveBlob } from '@/lib/save-blob'
import { useChallanFrontPages } from '../hooks/use-challan-front-pages'
import { useZoom } from '@/hooks/use-zoom'
import { ZoomToolbar } from '@/components/shared/zoom-toolbar'
import { useT } from '@/lib/i18n'

/** pdf.js is only downloaded once somebody actually opens a PDF. */
const ZoomablePdf = lazy(() =>
  import('@/components/shared/zoomable-pdf').then((module) => ({ default: module.ZoomablePdf })),
)

interface ChallanPdfDialogProps {
  challanId: string
  challanNumber: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SPINNER = (
  <div className="flex h-full items-center justify-center text-muted-foreground">
    <Loader2 className="size-6 animate-spin" aria-hidden />
  </div>
)

/**
 * The challan the office sent — its own pages only, without the LBTS barcode
 * back page — full screen, with zoom.
 *
 * Handed the id only while open, so a manifest of twenty challans fetches
 * nothing until one is asked for. Print and Download use the same pages that
 * are on screen.
 */
export function ChallanPdfDialog({ challanId, challanNumber, open, onOpenChange }: ChallanPdfDialogProps) {
  const t = useT()

  const document = useChallanFrontPages(open ? challanId : null)
  const zoom = useZoom()

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          zoom.reset()
        }
      }}
    >
      <DialogContent className="flex h-[96svh] w-[98vw] max-w-none flex-col gap-2 p-3 sm:max-w-none">
        <div className="flex flex-wrap items-center gap-2 pe-8">
          <DialogTitle className="min-w-0 flex-1 truncate text-sm">
            Challan PDF · <span className="font-mono">{challanNumber}</span>
          </DialogTitle>
          <ZoomToolbar controls={zoom} disabled={!document.blob} />
          <Button
            variant="outline"
            size="sm"
            disabled={!document.url}
            onClick={() => document.url && printDocument(document.url, 'application/pdf')}
          >
            <Printer data-icon="inline-start" aria-hidden />
            {t('common.actions.print')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!document.blob}
            onClick={() => document.blob && saveBlob(document.blob, `${challanNumber}.pdf`)}
          >
            <Download data-icon="inline-start" aria-hidden />
            {t('common.actions.download')}
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-muted/60">
          {document.isLoading && SPINNER}
          {document.error && (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center" role="alert">
              <FileWarning className="size-6 text-destructive" aria-hidden />
              <p className="text-sm text-muted-foreground">{document.error}</p>
              <Button variant="outline" size="sm" onClick={document.retry}>
                {t('common.actions.retry')}
              </Button>
            </div>
          )}
          {document.blob && (
            <Suspense fallback={SPINNER}>
              <ZoomablePdf blob={document.blob} title={challanNumber} controls={zoom} />
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
