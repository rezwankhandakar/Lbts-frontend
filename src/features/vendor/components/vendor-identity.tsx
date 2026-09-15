import { Building2, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PhotoLightbox } from './photo-lightbox'

interface VendorAvatarProps {
  name: string
  photoUrl: string | null
  /** A vendor code or a driver code, shown under the title in the big view. */
  caption?: string
  className?: string
}

/** The initials a vendor falls back to. Two at most — three reads as an acronym. */
function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)

  if (parts.length === 0) {
    return ''
  }

  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

/**
 * A vendor's mark.
 *
 * Three fallbacks deep on purpose: the photo, then the initials, then an icon.
 * A fleet directory is scanned down the left edge, so a row with no picture
 * still has to have something the eye can lock on to — an empty square would
 * make every unphotographed vendor look identical.
 *
 * The photo is served from the public bucket and needs no authenticated fetch,
 * unlike a compliance document. `loading="lazy"` because a page of ten of these
 * is ten requests that can wait for the scroll.
 */
export function VendorAvatar({ name, photoUrl, caption, className }: VendorAvatarProps) {
  const initials = initialsOf(name)

  const mark = (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-primary/15',
        className,
      )}
      aria-hidden
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" loading="lazy" className="size-full object-cover" />
      ) : initials ? (
        initials
      ) : (
        <Building2 className="size-4" />
      )}
    </span>
  )

  // Only a real photo is worth enlarging. Initials and an icon are the same at
  // any size, and a button over them would promise something that never comes.
  return photoUrl ? (
    <PhotoLightbox label={name} caption={caption} photoUrl={photoUrl}>
      {mark}
    </PhotoLightbox>
  ) : (
    mark
  )
}

interface DriverAvatarProps {
  name: string
  photoUrl: string | null
  caption?: string
  className?: string
}

/** The same, for a person. Round rather than square, which is the shell's convention. */
export function DriverAvatar({ name, photoUrl, caption, className }: DriverAvatarProps) {
  const initials = initialsOf(name)

  const portrait = (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tone-cyan/10 text-[11px] font-semibold text-tone-cyan ring-1 ring-tone-cyan/20',
        className,
      )}
      aria-hidden
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  )

  return photoUrl ? (
    <PhotoLightbox label={name} caption={caption} photoUrl={photoUrl} className="rounded-full">
      {portrait}
    </PhotoLightbox>
  ) : (
    portrait
  )
}

interface VehicleAvatarProps {
  photoUrl: string | null
  /** The plate, which is what a picture of a lorry is enlarged to check. */
  label?: string
  caption?: string
  className?: string
}

/**
 * A vehicle's picture, or the icon that stood there before there was one.
 *
 * No initials tier, unlike a vendor and a driver: a registration number reduces
 * to two characters that mean nothing, and `DM` down the left edge of a fleet
 * would be worse than the icon it replaced — the plate is already written in
 * full beside it. So this is two deep rather than three, and the square shape
 * and indigo tone are the ones the truck icon already used in this module.
 */
export function VehicleAvatar({ photoUrl, label, caption, className }: VehicleAvatarProps) {
  const picture = (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-tone-indigo/10 text-tone-indigo ring-1 ring-tone-indigo/20',
        className,
      )}
      aria-hidden
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <Truck className="size-4" />
      )}
    </span>
  )

  return photoUrl ? (
    <PhotoLightbox label={label ?? 'This vehicle'} caption={caption} photoUrl={photoUrl}>
      {picture}
    </PhotoLightbox>
  ) : (
    picture
  )
}

interface VendorIdentityProps {
  name: string
  vendorCode: string
  photoUrl: string | null
  /** Wraps the name and the code, and deliberately not the mark. See below. */
  render: (children: React.ReactNode) => React.ReactNode
}

/**
 * The name-and-code pair, as it appears in a table row.
 *
 * The code sits under the name rather than in a column of its own, because it
 * is how somebody *confirms* they have the right vendor rather than how they
 * find one — and a column of V-0001s down the middle of a table is a column
 * nobody reads.
 *
 * `render` exists because the mark is now a button that enlarges the photo, and
 * a button inside the row's own link is invalid markup and an ambiguous click
 * besides. So the caller's link wraps the words while the mark sits beside it:
 * the name opens the vendor, the photo opens the photo.
 */
export function VendorIdentity({ name, vendorCode, photoUrl, render }: VendorIdentityProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <VendorAvatar name={name} photoUrl={photoUrl} caption={vendorCode} />
      {render(
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium">{name}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{vendorCode}</p>
        </div>,
      )}
    </div>
  )
}
