import { Boxes, Wallet } from 'lucide-react'
import { formatTaka } from '@/lib/format'
import type { PageMeta } from '../types'

function Separator() {
  return <span className="size-1 shrink-0 rounded-full bg-border" aria-hidden />
}

/**
 * What the filtered set adds up to — the whole set, not the ten rows on
 * screen: how many challans, how many units, and what they were charged.
 */
export function ChallanListSummary({ summary, meta }: { summary: string; meta?: PageMeta }) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground"
      aria-live="polite"
    >
      <span className="font-medium text-foreground">{summary}</span>

      {/* A count of records answers how many challans; this answers how many
          units were moved, which is the figure a reconciliation is after. */}
      {meta?.totalQty !== undefined && (
        <>
          <Separator />
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Boxes className="size-3.5 text-tone-indigo" aria-hidden />
            <span className="font-medium text-foreground">{meta.totalQty.toLocaleString()}</span>
            units
          </span>
        </>
      )}

      {/* And what those units were charged. Zero is not shown: a filtered set
          that nothing could price has no total, and printing "৳0" would be a
          figure rather than the absence of one. */}
      {meta?.totalAmount !== undefined && meta.totalAmount > 0 && (
        <>
          <Separator />
          <span
            className="inline-flex items-center gap-1 tabular-nums"
            title={
              meta.unpricedChallans
                ? `${meta.unpricedChallans} of these challans carry a line that is not on the rate card, so this total does not include them.`
                : undefined
            }
          >
            <Wallet className="size-3.5 text-tone-emerald" aria-hidden />
            <span className="font-medium text-foreground">{formatTaka(meta.totalAmount)}</span>
            {Boolean(meta.unpricedChallans) && (
              <span className="text-tone-amber" aria-hidden>
                *
              </span>
            )}
          </span>
        </>
      )}
    </div>
  )
}
