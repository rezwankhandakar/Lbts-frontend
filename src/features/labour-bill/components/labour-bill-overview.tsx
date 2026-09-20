import { FileCheck2, FilePen, HardHat, TriangleAlert, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatTaka } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { LabourBillFilterPatch, LabourBillListParams, LabourBillPageMeta } from '../types'

interface LabourBillOverviewProps {
  meta: LabourBillPageMeta | undefined
  isLoading: boolean
  params: LabourBillListParams
  onChange: (patch: LabourBillFilterPatch) => void
}

interface Tile {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  chip: string
  filter?: { pressed: boolean; apply: LabourBillFilterPatch; clear: LabourBillFilterPatch }
}

/**
 * What the labour bills under the current filters add up to. Every figure
 * answers the filters rather than the page, and the two status tiles are
 * buttons: "which of these are still drafts" is a question somebody sits down
 * with.
 *
 * The blank-rows tile is drawn only when there are some. It is a to-do rather
 * than a reading — a zero there would be a number to scroll past, where a zero
 * on a status tile is an honest answer.
 */
export function LabourBillOverview({ meta, isLoading, params, onChange }: LabourBillOverviewProps) {
  if (isLoading || !meta) {
    return (
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[5.75rem] rounded-xl" />
        ))}
      </div>
    )
  }

  const tiles: Tile[] = [
    {
      label: 'Labour charged',
      value: formatTaka(meta.totalAmount),
      hint: `${formatTaka(meta.labourTotal)} labour · ${formatTaka(meta.floorTotal)} floor`,
      icon: Wallet,
      chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    },
    {
      label: 'Labour bills',
      value: meta.total.toLocaleString(),
      hint: `${meta.totalQty.toLocaleString()} pcs handled`,
      icon: HardHat,
      chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    },
    {
      label: 'Drafts',
      value: meta.draftBills.toLocaleString(),
      hint: 'still being prepared',
      icon: FilePen,
      chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
      filter: {
        pressed: params.status === 'Draft',
        apply: { status: 'Draft' },
        clear: { status: 'all' },
      },
    },
    meta.unpricedLines > 0
      ? {
          label: 'Rows with no amount',
          value: meta.unpricedLines.toLocaleString(),
          hint: 'nothing typed, so nothing charged',
          icon: TriangleAlert,
          chip: 'bg-tone-orange/10 text-tone-orange ring-tone-orange/20',
        }
      : {
          label: 'Finalized',
          value: meta.finalizedBills.toLocaleString(),
          hint: 'signed off and sent',
          icon: FileCheck2,
          chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
          filter: {
            pressed: params.status === 'Finalized',
            apply: { status: 'Finalized' },
            clear: { status: 'all' },
          },
        },
  ]

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => {
        const body = (
          <>
            <span
              className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg ring-1', tile.chip)}
            >
              <tile.icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-2xl leading-tight font-semibold tracking-tight tabular-nums">
                {tile.value}
              </span>
              <span className="mt-0.5 block text-[13px] font-medium">{tile.label}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{tile.hint}</span>
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
