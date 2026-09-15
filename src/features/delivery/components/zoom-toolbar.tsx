import { ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ZoomControls } from '../hooks/use-zoom'

/**
 * Zoom out, the current level, zoom in. Pressing the level puts the whole page
 * back on screen, which is the one place anybody wants to return to.
 */
export function ZoomToolbar({ controls, disabled = false }: { controls: ZoomControls; disabled?: boolean }) {
  return (
    <div className="inline-flex items-center rounded-md border" role="group" aria-label="Zoom">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Zoom out"
        disabled={disabled || !controls.canZoomOut}
        onClick={controls.zoomOut}
      >
        <ZoomOut aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 min-w-14 px-2 text-xs tabular-nums"
        title="Fit the whole page on screen"
        disabled={disabled}
        onClick={controls.reset}
      >
        {Math.round(controls.zoom * 100)}%
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Zoom in"
        disabled={disabled || !controls.canZoomIn}
        onClick={controls.zoomIn}
      >
        <ZoomIn aria-hidden />
      </Button>
    </div>
  )
}
