import { useState } from 'react'
import { Expand } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface PhotoLightboxProps {
  /** What the photo is of — the dialog's title, and the image's alt text. */
  label: string
  /** A line under the title: a vendor code, a plate, a driver code. */
  caption?: string
  photoUrl: string
  /** The avatar itself, rendered inside the button that opens the big view. */
  children: React.ReactNode
  className?: string
}

/**
 * The enlargement behind every photo in this module.
 *
 * Photos here are stored as a 512px square and rendered at 36–64px, so what is
 * on screen is a thumbnail of a thumbnail: a driver's face is recognisable and
 * a lorry's plate is not. Opening it is the only way to actually *look* at
 * one, which is the whole reason a fleet keeps pictures.
 *
 * It is deliberately **the avatar that owns this**, not each page. The alternative
 * — a viewer in the workspace and a callback threaded down through eight tables,
 * cards and sheets — is eight chances for one surface to be forgotten, and this
 * has no state anybody else needs to see. The cost is that an avatar is now a
 * button, so it may not sit inside another one; the three tables that had it
 * inside their row link render it as a sibling instead.
 *
 * No zoom, no pan, no gallery. The stored object is 512px square — there is
 * nothing further in to go, and a magnifier over an image that has no more
 * detail is a control that lies about what it can show.
 */
export function PhotoLightbox({
  label,
  caption,
  photoUrl,
  children,
  className,
}: PhotoLightboxProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View the photo of ${label} at full size`}
        className={cn(
          'group relative shrink-0 cursor-zoom-in rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        {children}
        {/* Shown on hover only: a permanent badge over a 36px avatar would
            cover most of the face it is offering to enlarge. */}
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-primary/70 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden
        >
          <Expand className="size-3.5" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="wrap-break-word">{label}</DialogTitle>
            {caption && <DialogDescription>{caption}</DialogDescription>}
          </DialogHeader>

          <img
            src={photoUrl}
            alt={label}
            className="max-h-[70svh] w-full rounded-lg bg-muted/40 object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
