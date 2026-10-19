import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { gatePassProductStatusMeta, kindMeta, rowKind, rowStatusMeta } from '../lib/trip-do-meta'
import type { KindedRow, ToneMeta } from '../lib/trip-do-meta'

const PILL =
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap'

/**
 * A dot beside the word rather than a coloured word alone, so a status
 * survives a monochrome screen and a colour-blind reader — the shape every
 * status badge in the app has.
 */
function ToneBadge({ meta, className }: { meta: ToneMeta; className?: string }) {
  return (
    <span className={cn(PILL, meta.badge, className)} title={meta.description}>
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}

/** Where a row's goods are. Drawn in every state: absent would read as "unknown". */
export function RowStatusBadge({ status, className }: { status: string; className?: string }) {
  const t = useT()

  return <ToneBadge meta={rowStatusMeta(status, t)} className={className} />
}

/** Where a gate pass line's goods are, as the challans linked to it say. */
export function ProductStatusBadge({ status, className }: { status: string; className?: string }) {
  const t = useT()

  return <ToneBadge meta={gatePassProductStatusMeta(status, t)} className={className} />
}

/**
 * "Return" or "Re-sent" beside the SL. An order row needs no tag — unless it
 * went out on pieces another challan sent back, when it is tagged Re-sent with
 * how many, if that is not all of it (`rowKind`).
 */
export function KindTag({ row, className }: { row: KindedRow; className?: string }) {
  const t = useT()

  const fromReturn = row.kind === 'Order' ? (row.fromReturnQty ?? 0) : 0
  const meta = kindMeta(rowKind(row), t)
  if (!meta.icon) {
    return null
  }
  const Icon = meta.icon
  const partial = fromReturn > 0 && fromReturn < row.qty

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase',
        meta.tag,
        className,
      )}
      title={
        fromReturn === 0
          ? meta.description
          : partial
            ? t('tripDo.reused.some', { qty: formatNumber(fromReturn) })
            : t('tripDo.reused.all')
      }
    >
      <Icon className="size-3" aria-hidden />
      {meta.label}
      {partial && <span className="tabular-nums">{formatNumber(fromReturn)}</span>}
    </span>
  )
}
