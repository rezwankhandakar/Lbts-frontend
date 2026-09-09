import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VendorAvatarProps {
  name: string
  photoUrl: string | null
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
export function VendorAvatar({ name, photoUrl, className }: VendorAvatarProps) {
  const initials = initialsOf(name)

  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-primary/15',
        className,
      )}
      aria-hidden
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      ) : initials ? (
        initials
      ) : (
        <Building2 className="size-4" />
      )}
    </span>
  )
}

interface DriverAvatarProps {
  name: string
  photoUrl: string | null
  className?: string
}

/** The same, for a person. Round rather than square, which is the shell's convention. */
export function DriverAvatar({ name, photoUrl, className }: DriverAvatarProps) {
  const initials = initialsOf(name)

  return (
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
}

interface VendorIdentityProps {
  name: string
  vendorCode: string
  photoUrl: string | null
}

/**
 * The name-and-code pair, as it appears in a table row.
 *
 * The code sits under the name rather than in a column of its own, because it
 * is how somebody *confirms* they have the right vendor rather than how they
 * find one — and a column of V-0001s down the middle of a table is a column
 * nobody reads.
 */
export function VendorIdentity({ name, vendorCode, photoUrl }: VendorIdentityProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <VendorAvatar name={name} photoUrl={photoUrl} />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium">{name}</p>
        <p className="truncate font-mono text-[11px] text-muted-foreground">{vendorCode}</p>
      </div>
    </div>
  )
}
