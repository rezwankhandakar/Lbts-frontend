import { cn } from '@/lib/utils'
import {
  LOCATION_REVIEW_META,
  locationSourceLabel,
  locationStatusMeta,
  locationTypeMeta,
} from '../lib/location-meta'
import type { LocationSource } from '../types'

interface BadgeProps {
  value: string
  className?: string
}

const BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap'

/**
 * What kind of place a district/thana pair is.
 *
 * A filled indicator dot beside the word rather than a coloured word alone —
 * the classification has to survive a monochrome screen and a colour-blind
 * reader. The same shape as every other badge in the app.
 */
export function LocationTypeBadge({ value, className }: BadgeProps) {
  const meta = locationTypeMeta(value)

  return (
    <span className={cn(BASE, meta.badge, className)} title={meta.description}>
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}

/**
 * Whether a challan's location has been settled.
 *
 * Drawn in both states, never only one. A challan whose location is still
 * unknown is precisely the one somebody is looking for, and an absent chip
 * reads as "no information" rather than "not yet".
 */
export function LocationStatusBadge({ value, className }: BadgeProps) {
  const meta = locationStatusMeta(value)

  return (
    <span className={cn(BASE, meta.badge, className)} title={meta.description}>
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}

/**
 * A location that was inferred and not yet read by anybody.
 *
 * Carries the source in its title rather than on its face: a list needs to
 * know *that* this one wants checking, and only somebody who has opened it
 * needs to know whether a spelling was normalised or Gemini chose. The badge
 * is drawn only on records where that is true, so unlike the status pair there
 * is no "everything is fine" variant of it — an absent one here means the
 * location was read off the master list exactly or set by a person, and both
 * of those the district column already reports.
 */
export function LocationReviewBadge({
  source,
  className,
}: {
  source: LocationSource
  className?: string
}) {
  return (
    <span
      className={cn(BASE, LOCATION_REVIEW_META.badge, className)}
      title={`${locationSourceLabel(source)}. Nobody has confirmed it yet.`}
    >
      <span
        className={cn('size-1.5 shrink-0 rounded-full', LOCATION_REVIEW_META.dot)}
        aria-hidden
      />
      {LOCATION_REVIEW_META.label}
    </span>
  )
}
