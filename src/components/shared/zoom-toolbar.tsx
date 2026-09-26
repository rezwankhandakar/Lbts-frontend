import { ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ZoomControls } from '@/hooks/use-zoom'
import { useFormatters, useT } from '@/lib/i18n'

/**
 * Zoom out, the current level, zoom in. Pressing the level puts the whole page
 * back on screen, which is the one place anybody wants to return to.
 *
 * Shared, with `useZoom`, `ZoomableImage` and `ZoomablePdf`: they moved out of
 * `features/delivery/` together when Accounts needed the same viewer for a
 * voucher.
 */
export function ZoomToolbar({
  controls,
  disabled = false,
}: {
  controls: ZoomControls
  disabled?: boolean
}) {
  const t = useT()
  const format = useFormatters()

  return (
    <div className="inline-flex items-center rounded-md border" role="group" aria-label={t('shared.zoom.group')}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t('shared.zoom.out')}
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
        title={t('shared.zoom.fit')}
        disabled={disabled}
        onClick={controls.reset}
      >
        {format.percent(controls.zoom * 100)}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t('shared.zoom.in')}
        disabled={disabled || !controls.canZoomIn}
        onClick={controls.zoomIn}
      >
        <ZoomIn aria-hidden />
      </Button>
    </div>
  )
}
