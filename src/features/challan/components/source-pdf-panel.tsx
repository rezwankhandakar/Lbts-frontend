import { useState } from 'react'
import { FileText, FileX2, ImageOff, TextCursorInput, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { formatBytes, formatRange } from '../lib/challan-meta'
import { useViewerControls } from '../hooks/use-viewer-controls'
import type { SourcePdf } from '../lib/pdf-source'
import type { ChallanEntry } from '../lib/challan-session'
import type { RangeProblem } from '../lib/page-ranges'
import type { PageRange } from '../types'
import { ExtractedTextPanel } from './extracted-text-panel'
import { PageRangeSelector } from './page-range-selector'
import { PdfPageView } from './pdf-page-view'
import { PdfViewerToolbar } from './pdf-viewer-toolbar'

interface SourcePdfPanelProps {
  source: SourcePdf
  entry: ChallanEntry | null
  entries: ChallanEntry[]
  rangeProblem: RangeProblem | null
  onRangeChange: (range: PageRange) => void
  onClose: () => void
  /** Marks this challan's pages as not a challan. Absent on the edit page. */
  onSkip?: () => void
  onUnskip?: () => void
  skippedPages?: number[]
  disabled?: boolean
}

/**
 * The reading half of the workspace: the source PDF, where this challan starts
 * and ends inside it, and the text on those pages if there is any.
 *
 * The page shown follows the challan being edited rather than being navigated
 * independently — selecting challan 4 in the queue moves the viewer to page 7,
 * because that is what somebody means when they select it. Paging by hand
 * afterwards is free, so the two never fight: the viewer only jumps when the
 * *entry* changes, not on every keystroke that moves the range.
 */
export function SourcePdfPanel({
  source,
  entry,
  entries,
  rangeProblem,
  onRangeChange,
  onClose,
  onSkip,
  onUnskip,
  skippedPages = [],
  disabled,
}: SourcePdfPanelProps) {
  const [page, setPage] = useState(entry?.startPage ?? 1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  /**
   * Whether the page on screen carries selectable text.
   *
   * Worth saying out loud. Some of these PDFs are generated documents and can
   * be copied out of; many are scans and cannot, and an operator who does not
   * know which they are in front of will drag across the page, get nothing,
   * and assume the viewer is broken — which is exactly the report this panel
   * exists to prevent.
   */
  const [hasText, setHasText] = useState<boolean | null>(null)

  const controls = useViewerControls('fit-width')
  const fullscreenControls = useViewerControls('fit-page')

  /**
   * Follows the challan, not the range.
   *
   * Adjusted during render rather than in an effect, which is what React
   * recommends for "reset some state when a prop changes": an effect would
   * paint the previous challan's page first and then jump, and it would fight
   * the operator's own paging. Comparing against the last id *seen* is what
   * makes it fire on a switch and not on a range drag — selecting challan 4
   * jumps to page 7, while widening challan 4 leaves the viewer where it was.
   */
  const [seenEntryId, setSeenEntryId] = useState(entry?.id ?? null)

  if (entry && entry.id !== seenEntryId) {
    setSeenEntryId(entry.id)
    setPage(entry.startPage)
  }

  return (
    <>
      <section
        aria-label="Source PDF"
        className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <header className="flex items-start justify-between gap-3 border-b bg-muted/30 px-4 py-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <h2 className="truncate text-[13px] font-semibold tracking-tight" title={source.fileName}>
                {source.fileName}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {source.pageCount} {source.pageCount === 1 ? 'page' : 'pages'} ·{' '}
                {formatBytes(source.fileSize)} · held in this browser only
              </p>

              {hasText !== null && (
                <p
                  className={cn(
                    'mt-1 inline-flex items-center gap-1.5 text-[11px]',
                    hasText ? 'text-tone-emerald' : 'text-muted-foreground',
                  )}
                  aria-live="polite"
                >
                  {hasText ? (
                    <>
                      <TextCursorInput className="size-3" aria-hidden />
                      Select text on the page and copy it straight into a field
                    </>
                  ) : (
                    <>
                      <ImageOff className="size-3" aria-hidden />
                      This page is a scan — there is no text to select, so type the values in
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground"
            onClick={onClose}
            aria-label="Close this PDF"
          >
            <X aria-hidden />
          </Button>
        </header>

        {/* Viewport-relative, because a challan is a portrait page and the
            thing an operator does with this panel all day is read an address
            off it. A fixed 480px box on a 1080p screen showed a third of a
            page and made them scroll for every field. The minimum keeps it
            usable on a short laptop screen, where vh alone would collapse it. */}
        <div className="h-[58vh] min-h-88 shrink-0 sm:h-[64vh] lg:h-[70vh]">
          <PdfPageView
            doc={source.doc}
            pageNumber={page}
            zoom={controls.zoom}
            rotation={controls.rotation}
            onTextAvailable={setHasText}
          />
        </div>

        <PdfViewerToolbar
          page={page}
          pageCount={source.pageCount}
          onPageChange={setPage}
          controls={controls}
          onToggleFullscreen={() => setIsFullscreen(true)}
        />

        {entry && (
          <div className="border-t px-3 py-3">
            <PageRangeSelector
              entry={entry}
              entries={entries}
              sourcePageCount={source.pageCount}
              problem={rangeProblem}
              onChange={onRangeChange}
              onPreviewPage={setPage}
              disabled={disabled}
            />

            {/* The way out for the blank sheet that turns up in the middle of
                a WhatsApp file. Marking it accounts for the pages without
                creating a record — no serial, no barcode, no PDF — which is
                what lets the batch finish and be printed as one document. The
                alternative would be filing a junk challan for a blank page. */}
            {onSkip && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <p className="text-[11px] text-muted-foreground">
                  {skippedPages.length > 0
                    ? `Marked blank: ${skippedPages.join(', ')}`
                    : 'Not a challan — a blank sheet, a cover page, a duplicate?'}
                </p>

                <div className="flex items-center gap-1.5">
                  {skippedPages.length > 0 && onUnskip && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="text-muted-foreground"
                      disabled={disabled}
                      onClick={onUnskip}
                    >
                      <Undo2 data-icon="inline-start" aria-hidden />
                      Undo
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={disabled}
                    onClick={onSkip}
                  >
                    <FileX2 data-icon="inline-start" aria-hidden />
                    Skip {formatRange(entry)} as blank
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {entry && (
          <ExtractedTextPanel
            doc={source.doc}
            range={{ startPage: entry.startPage, endPage: entry.endPage }}
          />
        )}
      </section>

      {/* Fullscreen gets its own zoom and rotation, starting from a clean fit.
          Somebody opening it wants to read the whole page first; carrying the
          panel's zoom across would drop them into a corner of it. */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="flex h-[92vh] w-[96vw] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
          <DialogTitle className="sr-only">{source.fileName}</DialogTitle>

          <div className="min-h-0 flex-1 pt-8">
            <PdfPageView
              doc={source.doc}
              pageNumber={page}
              zoom={fullscreenControls.zoom}
              rotation={fullscreenControls.rotation}
            />
          </div>

          <PdfViewerToolbar
            page={page}
            pageCount={source.pageCount}
            onPageChange={setPage}
            controls={fullscreenControls}
            isFullscreen
            onToggleFullscreen={() => setIsFullscreen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
