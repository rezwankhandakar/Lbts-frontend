import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCw,
  Scan,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ViewerControls } from '../hooks/use-viewer-controls'

interface PdfViewerToolbarProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  controls: ViewerControls
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

const BUTTON = 'text-muted-foreground hover:text-foreground'

/**
 * Page navigation and zoom for the source PDF.
 *
 * The page box is an input rather than a label, because on a 24-page file the
 * operator knows the number they want — challan 9 starts on page 14 — and
 * clicking Next thirteen times to get there is the difference between this
 * workspace being fast and being tolerable.
 *
 * Fit-width and fit-page are separate controls rather than one toggle: fitting
 * the width is what you want while reading an address, and fitting the page is
 * what you want while deciding where one challan ends and the next begins.
 */
export function PdfViewerToolbar({
  page,
  pageCount,
  onPageChange,
  controls,
  isFullscreen,
  onToggleFullscreen,
}: PdfViewerToolbarProps) {
  const zoomLabel =
    controls.zoom === 'fit-width'
      ? 'Fit'
      : controls.zoom === 'fit-page'
        ? 'Page'
        : `${Math.round(controls.zoom * 100)}%`

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-card px-2.5 py-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className={BUTTON}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft aria-hidden />
        </Button>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Input
            type="number"
            min={1}
            max={pageCount}
            value={page}
            onChange={(event) => {
              const next = Number.parseInt(event.target.value, 10)
              if (Number.isInteger(next) && next >= 1 && next <= pageCount) {
                onPageChange(next)
              }
            }}
            aria-label="Page number"
            className="h-7 w-14 px-1.5 text-center text-xs tabular-nums"
          />
          <span className="whitespace-nowrap">of {pageCount}</span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className={BUTTON}
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className={BUTTON}
          onClick={controls.zoomOut}
          aria-label="Zoom out"
        >
          <ZoomOut aria-hidden />
        </Button>

        <span className="min-w-11 text-center text-xs text-muted-foreground tabular-nums">
          {zoomLabel}
        </span>

        <Button
          variant="ghost"
          size="icon-sm"
          className={BUTTON}
          onClick={controls.zoomIn}
          aria-label="Zoom in"
        >
          <ZoomIn aria-hidden />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(BUTTON, controls.zoom === 'fit-width' && 'text-primary')}
          onClick={controls.fitWidth}
        >
          Width
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(BUTTON, controls.zoom === 'fit-page' && 'text-primary')}
          onClick={controls.fitPage}
          aria-label="Fit the whole page"
        >
          <Scan aria-hidden />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className={BUTTON}
          onClick={controls.rotate}
          aria-label="Rotate"
        >
          <RotateCw aria-hidden />
        </Button>

        {onToggleFullscreen && (
          <Button
            variant="ghost"
            size="icon-sm"
            className={BUTTON}
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Leave fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 aria-hidden /> : <Maximize2 aria-hidden />}
          </Button>
        )}
      </div>
    </div>
  )
}
