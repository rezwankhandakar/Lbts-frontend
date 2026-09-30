import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import {
  assignmentStatusMeta,
  documentStatusMeta,
  driverStatusMeta,
  ownershipMeta,
  vehicleStatusMeta,
  vendorStatusMeta,
} from '../lib/vendor-meta'
import type { StatusMeta } from '../lib/vendor-meta'
import { DOCUMENT_EXPIRY_SOON_DAYS } from '../types'

const BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap'

interface BadgeProps {
  value: string
  className?: string
}

/**
 * One badge, five vocabularies.
 *
 * A filled indicator dot beside the word rather than a coloured word alone —
 * every status in this module has to survive a monochrome screen and a
 * colour-blind reader. The same shape every other badge in the app uses, and
 * the colours all come from `vendor-meta.ts` rather than from any component.
 */
function Badge({ meta, className }: { meta: StatusMeta; className?: string }) {
  return (
    <span className={cn(BASE, meta.badge, className)} title={meta.description}>
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}

export function VendorStatusBadge({ value, className }: BadgeProps) {
  return <Badge meta={vendorStatusMeta(value, useT())} className={className} />
}

export function VehicleStatusBadge({ value, className }: BadgeProps) {
  return <Badge meta={vehicleStatusMeta(value, useT())} className={className} />
}

export function DriverStatusBadge({ value, className }: BadgeProps) {
  return <Badge meta={driverStatusMeta(value, useT())} className={className} />
}

export function AssignmentStatusBadge({ value, className }: BadgeProps) {
  return <Badge meta={assignmentStatusMeta(value, useT())} className={className} />
}

/**
 * A document's state.
 *
 * Drawn in all three states, never only the bad two. A document table is a list
 * of facts, and an absent badge there would read as "no information" rather
 * than "nothing wrong" — the same rule the Location module's status badge
 * follows, and the opposite of the alert row on the overview, where an absent
 * alert correctly means there is nothing to do.
 */
export function DocumentStatusBadge({ value, className }: BadgeProps) {
  return <Badge meta={documentStatusMeta(value, useT())} className={className} />
}

export function OwnershipBadge({ value, className }: BadgeProps) {
  return <Badge meta={ownershipMeta(value, useT())} className={className} />
}

/**
 * A compliance count for one subject, as a compact pair of numbers.
 *
 * Only the two states worth acting on are drawn, and only when they are
 * non-zero: a row whose papers are all in order says so by having nothing here,
 * and a fleet table with twelve green ticks down it is twelve pieces of ink
 * saying nothing. The total is the fallback, so a subject with documents always
 * reports something.
 *
 * The amber chip reads **"1 expiring"** rather than "1 due", and the word was
 * changed because "due" is ambiguous in exactly the wrong direction: it reads
 * as "one document is still owed" — something nobody has filed yet — when what
 * it counts is a document that *is* filed and lapses soon. Somebody who has
 * just attached a scan and still sees "1 due" concludes the upload failed. Both
 * chips carry a title saying the same thing in full, because a bare number and
 * a word in a narrow column is the least room this module has to explain
 * anything in.
 */
export function ComplianceChips({
  tally,
  className,
}: {
  tally: { total: number; expiringSoon: number; expired: number }
  className?: string
}) {
  const t = useT()
  const expired = documentStatusMeta('Expired', t)
  const expiring = documentStatusMeta('Expiring Soon', t)

  if (tally.total === 0) {
    return (
      <span className={cn('text-xs text-muted-foreground', className)}>
        {t('vendor.compliance.noneFiled')}
      </span>
    )
  }

  if (tally.expired === 0 && tally.expiringSoon === 0) {
    return (
      <span className={cn('text-xs text-muted-foreground', className)}>
        {t('vendor.compliance.allValid', { n: formatNumber(tally.total) })}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1.5', className)}>
      {tally.expired > 0 && (
        <span
          className={cn(BASE, expired.badge)}
          title={t('vendor.compliance.expiredTitle', {
            count: tally.expired,
            n: formatNumber(tally.expired),
            total: formatNumber(tally.total),
          })}
        >
          <span className={cn('size-1.5 shrink-0 rounded-full', expired.dot)} aria-hidden />
          {t('vendor.compliance.expired', { n: formatNumber(tally.expired) })}
        </span>
      )}
      {tally.expiringSoon > 0 && (
        <span
          className={cn(BASE, expiring.badge)}
          title={t('vendor.compliance.expiringTitle', {
            count: tally.expiringSoon,
            n: formatNumber(tally.expiringSoon),
            total: formatNumber(tally.total),
            days: formatNumber(DOCUMENT_EXPIRY_SOON_DAYS),
          })}
        >
          <span className={cn('size-1.5 shrink-0 rounded-full', expiring.dot)} aria-hidden />
          {t('vendor.compliance.expiring', { n: formatNumber(tally.expiringSoon) })}
        </span>
      )}
    </span>
  )
}
