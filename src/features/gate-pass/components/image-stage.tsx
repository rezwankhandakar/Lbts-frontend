import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageStageProps {
  url: string
  /** 1 means the whole page fits; 2 is twice that size. */
  zoom: number
  /** Quarter turns, in degrees. */
  rotation: number
  className?: string
}

interface Size {
  width: number
  height: number
}

/**
 * A scanned page on screen: whole at 100%, scrollable in both directions
 * beyond it, and correct at every rotation.
 *
 * The obvious version of this — an `<img>` with `transform: scale()` — is
 * wrong in a way that only shows up once somebody zooms in. A transform does
 * not change layout, so the scroll container never learns the image got
 * bigger: it gives you the top-left corner and no way to reach the rest.
 * Rotation has the same problem, and a portrait page in a landscape panel ends
 * up half off the edge.
 *
 * So the scale is computed as a number and applied as real pixel dimensions.
 * The wrapper takes the size the page occupies *after* rotation, which is what
 * gives the scroller something honest to scroll, and the image is centred
 * inside it and turned about its own middle.
 */
export function ImageStage({ url, zoom, rotation, className }: ImageStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = useState<{ url: string; size: Size } | null>(null)
  const [viewport, setViewport] = useState<Size | null>(null)

  // The page's own pixels, which is what every measurement below starts from.
  useEffect(() => {
    let cancelled = false

    const image = new Image()
    image.onload = () => {
      if (!cancelled) {
        setMeasured({ url, size: { width: image.naturalWidth, height: image.naturalHeight } })
      }
    }
    image.src = url

    return () => {
      cancelled = true
    }
  }, [url])

  /**
   * Tagged with the page it was taken from, and read back only when the tag
   * still matches. Sizing a newly scanned sheet with the previous one's
   * dimensions would draw it wrong for a frame — and clearing the size as the
   * effect runs would be a render cascade on every document change.
   */
  const natural = measured && measured.url === url ? measured.size : null

  /**
   * The panel's size, watched rather than measured once: this sits in a
   * two-column workspace that becomes one column, and inside a dialog that
   * opens at a different size again. A stale measurement here is a page that
   * no longer fits.
   */
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const measure = () => {
      setViewport({ width: container.clientWidth, height: container.clientHeight })
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const quarterTurn = ((rotation % 360) + 360) % 360
  const isSideways = quarterTurn === 90 || quarterTurn === 270

  /** What the page occupies once it has been turned. */
  const rotated: Size | null = natural
    ? {
        width: isSideways ? natural.height : natural.width,
        height: isSideways ? natural.width : natural.height,
      }
    : null

  /**
   * The scale at which the whole page is visible. Both axes are considered —
   * fitting the width alone is what leaves the bottom half of an A4 scan below
   * the fold, which is the entire point of doing this properly.
   *
   * Padding is subtracted so the page does not sit flush against the edges.
   */
  const PADDING = 24

  const fitScale =
    rotated && viewport && rotated.width > 0 && rotated.height > 0
      ? Math.min(
          (viewport.width - PADDING) / rotated.width,
          (viewport.height - PADDING) / rotated.height,
        )
      : 1

  const scale = Math.max(fitScale, 0.01) * zoom

  return (
    <div ref={containerRef} className={cn('flex size-full overflow-auto bg-muted/60', className)}>
      {natural && rotated ? (
        /**
         * `m-auto` on a flex item centres it on both axes while it is smaller
         * than the panel, and gets out of the way once it is larger — unlike
         * `justify-center`, which would centre it and then clip the top and
         * left edges out of reach of the scrollbars.
         */
        <div
          className="relative m-auto shrink-0"
          style={{
            width: rotated.width * scale,
            height: rotated.height * scale,
          }}
        >
          <img
            src={url}
            alt="Scanned gate pass"
            draggable={false}
            className="absolute top-1/2 left-1/2 max-w-none rounded shadow-sm select-none"
            style={{
              width: natural.width * scale,
              height: natural.height * scale,
              // Turned about its own centre, then pulled back so that centre
              // sits in the middle of the wrapper whichever way it is facing.
              transform: `translate(-50%, -50%) rotate(${quarterTurn}deg)`,
            }}
          />
        </div>
      ) : (
        <div className="size-full" aria-hidden />
      )}
    </div>
  )
}
