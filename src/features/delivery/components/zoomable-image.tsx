import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useZoomSurface } from '../hooks/use-zoom'
import type { ZoomControls } from '../hooks/use-zoom'

interface ZoomableImageProps {
  url: string
  alt: string
  controls: ZoomControls
}

/**
 * A scanned or photographed sheet, drawn so that 100% shows all of it and every
 * step above makes it bigger — scrolling to reach the edges, never cropping them.
 *
 * Mount it keyed on the URL: the measured size of the image belongs to one file.
 */
export function ZoomableImage({ url, alt, controls }: ZoomableImageProps) {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const size = useZoomSurface(surfaceRef, controls)
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null)

  const fit =
    natural && size.width > 0
      ? Math.min(size.width / natural.width, size.height / natural.height)
      : 0
  const width = natural ? Math.max(natural.width * fit * controls.zoom, 40) : undefined

  return (
    <div ref={surfaceRef} className="size-full overflow-auto p-3">
      <img
        src={url}
        alt={alt}
        onLoad={(event) =>
          setNatural({
            width: event.currentTarget.naturalWidth,
            height: event.currentTarget.naturalHeight,
          })
        }
        style={width ? { width, maxWidth: 'none' } : undefined}
        className={cn('mx-auto block h-auto bg-white shadow-md', !natural && 'invisible')}
      />
    </div>
  )
}
