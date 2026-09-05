import { useState } from 'react'
import { Download, FileWarning, Loader2, Maximize2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ChallanDocumentViewerProps {
  url: string | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onDownload: () => void
  onPrint: () => void
  pageCount: number
  className?: string
}

/**
 * The stored challan document on screen.
 *
 * Always a PDF, so this is always the browser's own viewer in an iframe —
 * which brings its own paging and zoom, and reimplementing those would mean
 * shipping a second PDF renderer to render a document the browser already
 * renders. The workspace bundles pdf.js because choosing a page range needs
 * the app to know which page it is showing; reading a finished challan does
 * not, so this page does not pay for it.
 *
 * The URL is always an object URL: the endpoint is authenticated, so the bytes
 * cannot be an `src` the browser fetches for itself. Whoever owns the blob
 * owns revoking it — here that is `useChallanDocument`.
 */
export function ChallanDocumentViewer({
  url,
  isLoading,
  error,
  onRetry,
  onDownload,
  onPrint,
  pageCount,
  className,
}: ChallanDocumentViewerProps) {
  const [fullscreen, setFullscreen] = useState(false)

  const body = (() => {
    if (isLoading) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3" aria-busy>
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
          <p className="text-xs text-muted-foreground">Loading the challan document…</p>
        </div>
      )
    }

    if (error) {
      return (
        <div
          className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
          role="alert"
        >
          <FileWarning className="size-6 text-destructive" aria-hidden />
          <p className="text-sm font-medium">The document could not be loaded</p>
          <p className="max-w-xs text-xs text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )
    }

    if (!url) {
      return null
    }

    return (
      // Deliberately not sandboxed. Chrome renders a PDF through its own
      // viewer extension, which needs scripting to start: under `sandbox=""`
      // it refuses and shows "This page has been blocked by Chrome" where the
      // document should be. The combination that would work — allow-scripts
      // plus allow-same-origin, the latter because a blob: URL cannot resolve
      // without it — removes every protection a sandbox would have given, so
      // the attribute is theatre either way.
      //
      // What actually contains this is the content itself: the blob is bytes
      // this app fetched from its own authenticated API, typed
      // application/pdf, so the browser hands it to the PDF viewer rather than
      // parsing it as a document.
      <iframe src={url} title="Challan document" className="size-full border-0 bg-white" />
    )
  })()

  return (
    <>
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
        {/* An explicit height rather than a share of the panel's, because the
            panel has no height of its own to share — it is as tall as what is
            inside it. Deliberately not `bg-card`: a challan page is nearly
            white and needs a darker ground behind it to read as paper. */}
        <div className="h-96 shrink-0 overflow-hidden bg-muted/60 sm:h-128 lg:h-152">
          {body}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-card px-2.5 py-2">
          <p className="px-1 text-xs text-muted-foreground">
            {pageCount} {pageCount === 1 ? 'page' : 'pages'}, ending with the LBTS back page
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setFullscreen(true)}
              disabled={!url}
              aria-label="Fullscreen"
            >
              <Maximize2 aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={onPrint}
              disabled={!url}
              aria-label="Print"
            >
              <Printer aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={onDownload}
              aria-label="Download"
            >
              <Download aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="flex h-[92vh] w-[96vw] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
          <DialogTitle className="sr-only">Challan document</DialogTitle>
          <div className="min-h-0 flex-1 pt-8">
            {url && (
              <iframe
                src={url}
                title="Challan document"
                className="size-full border-0 bg-white"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
