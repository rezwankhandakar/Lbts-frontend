import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  FileClock,
  Layers,
  MapPin,
  Receipt,
  RefreshCcw,
  ScanEye,
  ShieldCheck,
  TriangleAlert,
  Undo2,
  UserPlus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFormatters, useT } from '@/lib/i18n'
import type { Formatters, TranslationKey, Translator } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { StatusFilter as UserStatusFilter } from '@/features/administration/types'
import type { ChallanListParams } from '@/features/challan/types'
import type { TripListParams } from '@/features/delivery/types'
import type { GatePassListParams } from '@/features/gate-pass/types'
import type { VendorListParams } from '@/features/vendor/types'
import { attentionSummary } from '../lib/attention'
import type { AttentionIcon, AttentionRow, AttentionSeed } from '../lib/attention'
import type { DashboardData } from '../types'

/**
 * What each state key is allowed to carry, straight from the list that reads
 * it. This is the side of the mirror that *can* import, which is the whole
 * reason the translation lives here rather than beside the seeds.
 */
interface SeedShapes {
  gatePassFilters: Partial<GatePassListParams>
  challanFilters: Partial<ChallanListParams>
  tripFilters: Partial<TripListParams>
  vendorFilters: Partial<VendorListParams>
  userFilters: { status: UserStatusFilter }
}

/**
 * The seed as the router state its destination reads — and the place the
 * mirror is held to the original.
 *
 * `attention.ts` is import-free so `node --test` can load it, which means it
 * spells its filter values out as literals rather than importing the unions.
 * That is the ordinary mirroring this codebase does everywhere, and like every
 * mirror it needs something that fails when the two sides drift.
 *
 * This switch is that something. Each branch hands `seed.value` to a field
 * typed from the list that actually reads it, so a value no filter would
 * accept — `amount: 'blank'` against a union that says `'unpriced'`, which is
 * exactly the mistake that was here first — stops the build rather than
 * quietly landing somebody on an unfiltered page claiming to be a backlog.
 * A computed key (`{ [seed.key]: seed.value }`) would have type-checked and
 * caught nothing, which is why this is written out.
 */
function seedState(seed: AttentionSeed): Partial<SeedShapes> {
  switch (seed.key) {
    case 'gatePassFilters':
      return { gatePassFilters: seed.value }
    case 'challanFilters':
      return { challanFilters: seed.value }
    case 'tripFilters':
      return { tripFilters: seed.value }
    case 'vendorFilters':
      return { vendorFilters: seed.value }
    case 'userFilters':
      return { userFilters: seed.value }
  }
}

/** The icon names `attention.ts` uses, resolved here so that file stays import-free. */
const ICONS: Record<AttentionIcon, LucideIcon> = {
  clock: Clock,
  undo: Undo2,
  'map-pin': MapPin,
  'scan-eye': ScanEye,
  coins: Coins,
  'triangle-alert': TriangleAlert,
  'file-clock': FileClock,
  'user-plus': UserPlus,
  receipt: Receipt,
  layers: Layers,
}

/** Enough to meet the work without the page becoming a wall of it. */
const VISIBLE = 5

/**
 * What the operation has outstanding, and where to go about each of it.
 *
 * The centre of the page, and the reason a dashboard exists at all: not "how
 * much did we do" but "what is waiting". Every row is a link carrying the
 * filter that answers it, so pressing one lands on exactly the records it
 * counted — the rule the Challan backlog chips and the vendor overview's
 * `ComplianceAlert` both follow.
 *
 * **Nothing is drawn speculatively.** A row exists only where a real count is
 * above zero, and an operation with nothing outstanding gets the settled state
 * rather than eleven rows saying everything is fine. That is deliberately the
 * opposite of the hero above, where an absent figure would read as "no
 * information" rather than "nothing to do".
 *
 * The list is capped at five with the rest behind a press, because a backlog
 * is worked from the top and a page that has to be scrolled past to reach the
 * modules is a page people stop scrolling. Nothing is hidden — the count is on
 * the button.
 */
export function DashboardAttention({ dashboard }: { dashboard: DashboardData }) {
  const t = useT()
  const format = useFormatters()
  const [expanded, setExpanded] = useState(false)

  const rows = dashboard.attention
  const summary = attentionSummary(rows)
  const shown = expanded ? rows : rows.slice(0, VISIBLE)
  const hidden = rows.length - shown.length

  return (
    <section aria-labelledby="attention-heading" className="space-y-2.5">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="attention-heading" className="text-[13px] font-semibold tracking-tight">
          {t('dashboard.attention.heading')}
        </h2>
        {summary.total > 0 && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {summary.critical > 0 && (
              <span className="font-medium text-destructive">
                {t('dashboard.attention.urgent', { n: format.number(summary.critical) })}
              </span>
            )}
            {summary.critical > 0 && summary.warning > 0 && ' · '}
            {summary.warning > 0 &&
              t('dashboard.attention.toWorkThrough', { n: format.number(summary.warning) })}
          </p>
        )}
      </header>

      {dashboard.isPending && rows.length === 0 ? (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-[4.5rem] rounded-xl" />
          ))}
        </div>
      ) : dashboard.hasError && rows.length === 0 ? (
        <ErrorRow onRetry={dashboard.refetchFailed} />
      ) : rows.length === 0 ? (
        <SettledRow asked={dashboard.asked} />
      ) : (
        <>
          {/*
           * Two columns from xl and one below it. A backlog row is a sentence
           * rather than a figure, so it wants width — stacking them past a
           * certain screen size would leave a line of text in a column and
           * half the page empty beside it.
           */}
          <div className="grid gap-2 xl:grid-cols-2">
            {shown.map((row) => (
              <AttentionCard key={row.id} row={row} />
            ))}
          </div>

          {(hidden > 0 || expanded) && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setExpanded((open) => !open)}
            >
              <ChevronDown
                data-icon="inline-start"
                aria-hidden
                className={cn('transition-transform', expanded && 'rotate-180')}
              />
              {expanded
                ? t('common.actions.showLess')
                : t('dashboard.attention.showMore', { n: format.number(hidden) })}
            </Button>
          )}

          {/* One retry for every panel that failed, rather than one per panel. */}
          {dashboard.hasError && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-muted-foreground">
              <TriangleAlert className="size-3.5 shrink-0 text-destructive" aria-hidden />
              {t('dashboard.attention.partialFailure')}
              <button
                type="button"
                onClick={dashboard.refetchFailed}
                className="font-medium text-foreground underline underline-offset-2 outline-none hover:no-underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('common.actions.retry')}
              </button>
            </p>
          )}
        </>
      )}
    </section>
  )
}

function AttentionCard({ row }: { row: AttentionRow }) {
  const t = useT()
  const format = useFormatters()
  const Icon = ICONS[row.icon]
  const critical = row.severity === 'critical'

  const title = rowTitle(row, t, format)
  const detail = t(row.detailKey as TranslationKey)
  const action = t(row.actionKey as TranslationKey)

  return (
    <Link
      to={row.to}
      /*
       * The filter travels as router state, which is how every list in this
       * app carries one — so the row lands on the records it counted rather
       * than on the whole collection. The destination seeds its first render
       * from it and Clear still clears.
       */
      state={row.seed ? seedState(row.seed) : undefined}
      aria-label={t('dashboard.attention.rowAria', { title, action })}
      className={cn(
        'group flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring',
        critical
          ? 'border-destructive/25 bg-destructive/[0.06] hover:bg-destructive/10'
          : 'border-tone-amber/25 bg-tone-amber/[0.06] hover:bg-tone-amber/10',
      )}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
          critical
            ? 'bg-destructive/10 text-destructive ring-destructive/20'
            : 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
        )}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-pretty">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-pretty text-muted-foreground">{detail}</p>
      </div>

      <ChevronRight
        className="size-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  )
}

/**
 * Nothing outstanding — and the wording turns on whether anything was
 * actually asked for.
 *
 * An empty list means two quite different things. An operation with a clear
 * backlog has earned "everything is caught up"; an account that reads no
 * module at all has not, and telling it so would be an outright lie about
 * records it cannot see.
 */
function SettledRow({ asked }: { asked: boolean }) {
  const t = useT()

  return (
    <div className="flex items-start gap-3 rounded-xl border border-tone-emerald/25 bg-tone-emerald/[0.06] p-4">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-emerald/10 text-tone-emerald ring-1 ring-tone-emerald/20"
        aria-hidden
      >
        <ShieldCheck className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium">
          {asked
            ? t('dashboard.attention.settledTitle')
            : t('dashboard.attention.unaskedTitle')}
        </p>
        <p className="mt-0.5 text-xs leading-snug text-pretty text-muted-foreground">
          {asked
            ? t('dashboard.attention.settledBody')
            : t('dashboard.attention.unaskedBody')}
        </p>
      </div>
    </div>
  )
}

function ErrorRow({ onRetry }: { onRetry: () => void }) {
  const t = useT()

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2.5 text-sm text-muted-foreground">
        <TriangleAlert className="mt-px size-4 shrink-0 text-destructive" aria-hidden />
        {t('dashboard.attention.nothingLoaded')}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0">
        <RefreshCcw data-icon="inline-start" aria-hidden />
        {t('common.actions.retry')}
      </Button>
    </div>
  )
}

/**
 * A row's title, with the figure it states put back into it.
 *
 * `attention.ts` carries the number and the key and decides nothing about
 * how either reads. Here is where they meet: `count` chooses the plural and
 * `n` is the shaped figure that gets printed, which are the same number doing
 * two jobs that cannot share a placeholder. A money row states `{amount}`
 * instead and has no plural at all.
 */
function rowTitle(row: AttentionRow, t: Translator, format: Formatters): string {
  const key = row.titleKey as TranslationKey

  if (row.taka !== undefined) {
    return t(key, { amount: format.taka(row.taka) })
  }

  const count = row.count ?? 0
  return t(key, { count, n: format.number(count) })
}
