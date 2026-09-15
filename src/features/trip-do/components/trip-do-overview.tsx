import { FileSpreadsheet, Hourglass, Link2, Repeat } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatTaka } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TripDoFilterPatch, TripDoListParams, TripDoPageMeta } from '../types'

interface TripDoOverviewProps {
  meta: TripDoPageMeta | undefined
  isLoading: boolean
  params: TripDoListParams
  onChange: (patch: TripDoFilterPatch) => void
}

interface Tile {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  chip: string
  /** Pressing the tile applies this filter, and pressing it again clears it. */
  filter?: { pressed: boolean; apply: TripDoFilterPatch; clear: TripDoFilterPatch }
  progress?: number
}

/**
 * What the sheet under the current filters adds up to.
 *
 * Every figure answers the filters rather than the page, like every total in
 * this app, and the three backlog tiles are buttons: "waiting for a Trip DO"
 * is the question somebody sits down with, and a count nobody can act on is a
 * number to scroll past.
 */
export function TripDoOverview({ meta, isLoading, params, onChange }: TripDoOverviewProps) {
  if (isLoading || !meta) {
    return (
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[6.25rem] rounded-xl" />
        ))}
      </div>
    )
  }

  const percent = meta.totalQty > 0 ? Math.round((meta.linkedQty / meta.totalQty) * 100) : 0

  const tiles: Tile[] = [
    {
      label: 'Rows on the sheet',
      value: meta.total.toLocaleString(),
      hint: `${meta.totalQty.toLocaleString()} pcs · ${formatTaka(meta.totalAmount)}`,
      icon: FileSpreadsheet,
      chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    },
    {
      label: 'Trip DO set',
      value: `${percent}%`,
      hint: `${meta.linkedQty.toLocaleString()} of ${meta.totalQty.toLocaleString()} pcs · ${meta.linkedRows} rows`,
      icon: Link2,
      chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
      progress: percent,
      filter: { pressed: params.link === 'linked', apply: { link: 'linked' }, clear: { link: 'all' } },
    },
    {
      label: 'Waiting for Trip DO',
      value: meta.unlinkedRows.toLocaleString(),
      hint: `${meta.unlinkedQty.toLocaleString()} pcs not matched to a gate pass`,
      icon: Hourglass,
      chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
      filter: { pressed: params.link === 'unlinked', apply: { link: 'unlinked' }, clear: { link: 'all' } },
    },
    {
      label: 'Returns & re-sends',
      value: (meta.returnRows + meta.resentRows).toLocaleString(),
      hint: `${meta.returnRows} came back · ${meta.resentRows} went out again`,
      icon: Repeat,
      chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
      filter: { pressed: params.kind === 'Return', apply: { kind: 'Return' }, clear: { kind: 'all' } },
    },
  ]

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => {
        const body = (
          <>
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg ring-1', tile.chip)}>
              <tile.icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-2xl leading-tight font-semibold tracking-tight tabular-nums">
                {tile.value}
              </span>
              <span className="mt-0.5 block text-[13px] font-medium">{tile.label}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{tile.hint}</span>
              {tile.progress !== undefined && (
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-tone-emerald transition-[width] duration-500"
                    style={{ width: `${tile.progress}%` }}
                  />
                </span>
              )}
            </span>
          </>
        )

        const base = 'flex items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-xs'

        if (!tile.filter) {
          return (
            <div key={tile.label} className={base}>
              {body}
            </div>
          )
        }

        const { pressed, apply, clear } = tile.filter
        return (
          <button
            key={tile.label}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(pressed ? clear : apply)}
            className={cn(
              base,
              'transition outline-none hover:-translate-y-px hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50',
              pressed && 'border-primary/50 ring-2 ring-primary/15',
            )}
          >
            {body}
          </button>
        )
      })}
    </div>
  )
}
