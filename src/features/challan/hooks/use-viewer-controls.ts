import { useCallback, useMemo, useState } from 'react'

/**
 * How large a page is drawn.
 *
 * A numeric zoom is a multiple of "the whole page fits across the panel",
 * rather than a multiple of the PDF's own points. That is the only definition
 * that behaves the same in a narrow side panel and in fullscreen, and it means
 * 1 always shows the page whole — the same convention the gate pass image
 * viewer uses.
 */
export type PdfZoom = number | 'fit-width' | 'fit-page'

/** Multiples of "the whole page fits". */
export const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6]

export interface ViewerControls {
  zoom: PdfZoom
  rotation: number
  setZoom: (zoom: PdfZoom) => void
  zoomIn: () => void
  zoomOut: () => void
  fitWidth: () => void
  fitPage: () => void
  rotate: () => void
}

/**
 * Zoom and rotation for one PDF viewer.
 *
 * A hook rather than state inside the viewer, so the fullscreen copy can have
 * its own: somebody who opens fullscreen wants to read the whole page first,
 * and carrying the side panel's 4× zoom across would drop them into a corner
 * of it. The same reasoning the gate pass document viewer uses.
 *
 * Stepping out of a fit mode lands on a defined step rather than on whatever
 * numeric zoom was last set, so the first press of a zoom button always does
 * something predictable.
 */
export function useViewerControls(initial: PdfZoom = 'fit-width'): ViewerControls {
  const [zoom, setZoom] = useState<PdfZoom>(initial)
  const [rotation, setRotation] = useState(0)

  const step = useCallback((direction: 1 | -1) => {
    setZoom((current) => {
      if (typeof current !== 'number') {
        return direction === 1 ? ZOOM_STEPS[3] : ZOOM_STEPS[1]
      }

      const index = ZOOM_STEPS.indexOf(current)
      const next = index === -1 ? 2 : index + direction
      return ZOOM_STEPS[Math.min(Math.max(next, 0), ZOOM_STEPS.length - 1)]
    })
  }, [])

  return useMemo(
    () => ({
      zoom,
      rotation,
      setZoom,
      zoomIn: () => step(1),
      zoomOut: () => step(-1),
      fitWidth: () => setZoom('fit-width'),
      fitPage: () => setZoom('fit-page'),
      // Rotation is a decision about a sideways page; a fit change must not
      // silently undo it, so the two never touch each other.
      rotate: () => setRotation((value) => (value + 90) % 360),
    }),
    [zoom, rotation, step],
  )
}
