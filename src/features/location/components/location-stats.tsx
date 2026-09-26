import { CircleSlash, MapPinned, Sparkles, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useFormatters, useT } from '@/lib/i18n'
import type { Translator } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { LocationStats as Stats } from '../types'

interface LocationStatsProps {
  stats: Stats | undefined
  isLoading: boolean
}

interface Tile {
  label: string
  hint: string
  value: string
  icon: LucideIcon
  chip: string
}

/**
 * What the master list currently holds, and how the assisted step has been
 * behaving.
 *
 * The second half is the reason this panel exists. Location resolution is
 * quiet by design — a challan that could not be resolved simply files with a
 * blank — so without a figure somewhere, "assisted resolution stopped working
 * a fortnight ago" is a thing nobody would ever notice. These are real counts
 * from the running instance, never placeholders.
 */
export function LocationStatsPanel({ stats, isLoading }: LocationStatsProps) {
  const t = useT()
  const format = useFormatters()

  if (isLoading || !stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[5.5rem] rounded-xl" />
        ))}
      </div>
    )
  }

  const tiles: Tile[] = [
    {
      label: t('location.stats.inUse'),
      hint: `${stats.districts} districts`,
      value: String(stats.active),
      icon: MapPinned,
      chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    },
    {
      label: t('location.stats.deactivated'),
      hint: t('location.stats.deactivatedHint'),
      value: String(stats.inactive),
      icon: CircleSlash,
      chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    },
    {
      label: t('location.stats.byType'),
      hint: t('location.stats.byTypeHint', {
        isd: format.number(stats.byType.ISD),
        metro: format.number(stats.byType['OSD-Metro']),
        thana: format.number(stats.byType['OSD-Thana']),
      }),
      value: String(stats.total),
      icon: MapPinned,
      chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
    },
    assistedTile(stats, t),
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl border bg-card p-4">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
                tile.chip,
              )}
            >
              <tile.icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xl leading-tight font-semibold tabular-nums">{tile.value}</p>
              <p className="mt-0.5 truncate text-[13px] font-medium">{tile.label}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{tile.hint}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * The assisted step, in one tile.
 *
 * Three states worth telling apart: not set up at all — which is a perfectly
 * good way to run this system, so it is stated plainly rather than as a
 * warning; paused after repeated failures; and working, with what it has done
 * since this instance started.
 */
/**
 * The assisted-resolution tile.
 *
 * Takes the translator rather than reaching for the store, the arrangement
 * every other tolerant lookup in this codebase uses: the caller holds
 * `useT()`, which is the subscription that makes the tile follow a language
 * change.
 */
function assistedTile(stats: Stats, t: Translator): Tile {
  const { gemini } = stats

  if (!gemini.configured) {
    return {
      label: t('location.stats.assisted'),
      hint: t('location.stats.assistedOff'),
      value: 'Off',
      icon: Sparkles,
      chip: 'bg-muted text-muted-foreground ring-border',
    }
  }

  if (gemini.pausedUntil) {
    return {
      label: t('location.stats.assisted'),
      hint: t('location.stats.assistedPaused'),
      value: t('location.stats.paused'),
      icon: TriangleAlert,
      chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    }
  }

  return {
    label: t('location.stats.assisted'),
    hint: `${gemini.calls} call${gemini.calls === 1 ? '' : 's'} · ${gemini.cacheHits} cached · ${
      gemini.rejected + gemini.lowConfidence
    } declined · ${gemini.errors} failed`,
    value: String(gemini.accepted),
    icon: Sparkles,
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  }
}
