import { cn } from '@/lib/utils'
import { locationStatusMeta, locationTypeMeta } from '../lib/location-meta'

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
