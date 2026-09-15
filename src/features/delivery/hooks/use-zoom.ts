import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

/** Multiples of "the whole page fits on screen". */
export const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4]

export interface ZoomControls {
  zoom: number
  zoomIn: () => void
  zoomOut: () => void
  /** Back to the whole page on screen. */
  reset: () => void
  canZoomIn: boolean
  canZoomOut: boolean
}

/**
 * Zoom for a document viewer, where 1 means the whole page fits — the same
 * starting point for a signed photo and a challan PDF, so "100%" always shows
 * the entire sheet and everything above it is for reading the small print.
 */
export function useZoom(): ZoomControls {
  const [zoom, setZoom] = useState(1)

  const zoomIn = useCallback(
    () => setZoom((current) => ZOOM_LEVELS.find((level) => level > current + 0.001) ?? current),
    [],
  )
  const zoomOut = useCallback(
    () =>
      setZoom(
        (current) => [...ZOOM_LEVELS].reverse().find((level) => level < current - 0.001) ?? current,
      ),
    [],
  )
  const reset = useCallback(() => setZoom(1), [])

  return {
    zoom,
    zoomIn,
    zoomOut,
    reset,
    canZoomIn: zoom < ZOOM_LEVELS[ZOOM_LEVELS.length - 1],
    canZoomOut: zoom > ZOOM_LEVELS[0],
  }
}

/**
 * The box a zoomable document is drawn in: measured, because "fits" depends on
 * it, and listening for Ctrl + mouse wheel, which is how anybody zooms a
 * document on a desktop. The wheel listener is attached by hand as non-passive,
 * or the browser would zoom the whole page instead.
 */
export function useZoomSurface(
  ref: RefObject<HTMLElement | null>,
  controls: ZoomControls,
): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const zoomInRef = useRef(controls.zoomIn)
  const zoomOutRef = useRef(controls.zoomOut)

  useEffect(() => {
    zoomInRef.current = controls.zoomIn
    zoomOutRef.current = controls.zoomOut
  }, [controls.zoomIn, controls.zoomOut])

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      if (box) {
        setSize({ width: Math.floor(box.width), height: Math.floor(box.height) })
      }
    })
    observer.observe(element)

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) {
        return
      }
      event.preventDefault()
      if (event.deltaY < 0) {
        zoomInRef.current()
      } else {
        zoomOutRef.current()
      }
    }
    element.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      observer.disconnect()
      element.removeEventListener('wheel', onWheel)
    }
  }, [ref])

  return size
}
