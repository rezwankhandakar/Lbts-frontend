import {
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Scan,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface ViewerControls {
  zoom: number
  rotation: number
  zoomIn: () => void
  zoomOut: () => void
  rotateLeft: () => void
  rotateRight: () => void
  fit: () => void
}

interface DocumentToolbarProps {
  controls: ViewerControls
  /** Image controls are meaningless over the browser's own PDF viewer. */
  isPdf: boolean
  pageCount: number | null
  onFullscreen: () => void
  onDownload?: () => void
  onReplace?: () => void
  onRemove?: () => void
  disabled?: boolean
  /** The same toolbar serves the dialog, where the button closes it again. */
  isFullscreen?: boolean
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  disabled,
}: {
  label: string
  icon: typeof ZoomIn
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon-sm" onClick={onClick} disabled={disabled} />
        }
      >
        <Icon aria-hidden />
        <span className="sr-only">{label}</span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Everything that can be done to the document on screen.
 *
 * Zoom and rotation apply to an image only. A PDF is rendered by the browser's
 * own viewer, which owns its zoom, its rotation and its page navigation — and
 * cannot be driven from script. Offering buttons that would silently do
 * nothing would be worse than not offering them, so for a PDF the toolbar
 * shows the page count and gets out of the way.
 */
export function DocumentToolbar({
  controls,
  isPdf,
  pageCount,
  onFullscreen,
  onDownload,
  onReplace,
  onRemove,
  disabled,
  isFullscreen,
}: DocumentToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-t bg-muted/30 px-2 py-1.5">
      {isPdf ? (
        <p className="px-2 text-xs text-muted-foreground">
          {pageCount && pageCount > 1 ? `${pageCount} pages` : 'PDF document'}
          <span className="hidden sm:inline"> · use the viewer controls to page and zoom</span>
        </p>
      ) : (
        <>
          <IconButton label="Zoom out" icon={ZoomOut} onClick={controls.zoomOut} disabled={disabled} />
          <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(controls.zoom * 100)}%
          </span>
          <IconButton label="Zoom in" icon={ZoomIn} onClick={controls.zoomIn} disabled={disabled} />

          <span className="mx-1 h-4 w-px bg-border" aria-hidden />

          <IconButton
            label="Rotate left"
            icon={RotateCcw}
            onClick={controls.rotateLeft}
            disabled={disabled}
          />
          <IconButton
            label="Rotate right"
            icon={RotateCw}
            onClick={controls.rotateRight}
            disabled={disabled}
          />
          <Button variant="ghost" size="sm" onClick={controls.fit} disabled={disabled}>
            Fit
          </Button>
        </>
      )}

      <div className={cn('ml-auto flex items-center gap-1')}>
        <IconButton
          label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          icon={isFullscreen ? Minimize2 : Maximize2}
          onClick={onFullscreen}
          disabled={disabled}
        />

        {onDownload && (
          <IconButton label="Download" icon={Download} onClick={onDownload} disabled={disabled} />
        )}

        {onReplace && (
          <Button variant="ghost" size="sm" onClick={onReplace} disabled={disabled}>
            <Scan data-icon="inline-start" aria-hidden />
            Rescan
          </Button>
        )}

        {onRemove && (
          <IconButton label="Remove document" icon={Trash2} onClick={onRemove} disabled={disabled} />
        )}
      </div>
    </div>
  )
}
