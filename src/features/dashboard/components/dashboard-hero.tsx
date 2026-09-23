import { ArrowRight, PackageCheck, Plus, ReceiptText, ScanLine, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { canWriteChallans } from '@/features/challan/types'
import { canWriteDeliveries } from '@/features/delivery/types'
import { canWriteGatePasses } from '@/features/gate-pass/types'
import { cn } from '@/lib/utils'
import { roleMeta } from '@/lib/roles'
import { greetingLine } from '../lib/greeting'
import type { DashboardData } from '../types'

/** "Monday, 21 September" — the day, in the viewer's own locale and calendar. */
const DAY_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/**
 * The top of the page: who is reading, what day it is, and what has moved
 * today.
 *
 * **The headline is pieces out today**, because that is what this operation
 * does. Everything else on the dashboard is a backlog or a total; this one
 * figure is the work itself, so it is the largest thing on the screen and the
 * three counts beside it sit as the detail rather than as equals.
 *
 * A quiet morning reads as a quiet morning rather than as a fault. Zero here
 * is information — the hero is a *reading* of the day, which is the rule the
 * vendor dashboard's tiles follow and the opposite of the one its attention
 * rows follow: an absent figure would say "no information" where a zero says
 * "nothing yet".
 *
 * A surface that is dark in **both** themes — the auth panel's gradient, as
 * the vendor hero and the Accounts balance card use — so it reads as the
 * page's headline either way. Its own palette is `primary-foreground` at
 * varying opacity rather than the tone table, whose colours are tuned for a
 * light surface.
 *
 * **It is two bands, and that is what keeps it short.** It was a two-column
 * block with the greeting, the date, the headline, a sentence and the actions
 * stacked down the left of it, which ran past 500px and took the whole fold
 * on a laptop — a banner that has to be scrolled past to reach the page is a
 * banner nobody is glad to have. So the identity line and the actions share
 * one row, a hairline closes it, and the measurements sit on a single band
 * beneath: the headline at the left of the instrument, the three module
 * counts as one strip to its right. **Nothing was dropped to get there** —
 * every figure, link and action that was here still is, and the saving is
 * entirely in what sits *beside* what rather than under it.
 */
export function DashboardHero({ dashboard, name }: { dashboard: DashboardData; name: string }) {
  const now = new Date()
  const role = dashboard.role ? roleMeta(dashboard.role) : null

  const trips = dashboard.delivery.data
  const gatePasses = dashboard.gatePass.data
  const challans = dashboard.challan.data

  /**
   * The one figure large enough to be read across a room, and it is
   * deliberately the pieces rather than the trips: two lorries carrying four
   * hundred pieces and two carrying six is the same trip count and a quite
   * different day.
   *
   * **It falls back rather than waiting forever.** A role that cannot read
   * Delivery has no `todayQty` coming — the query is never issued — so keying
   * the skeleton on "no data yet" alone would leave it pulsing for the rest of
   * the session. Every staff role reads Delivery today, so nothing hits this;
   * it is here because a headline that can never arrive is exactly the kind of
   * thing a later role would discover in production. Gate passes filed today
   * are the next-best reading of the same day.
   */
  const headline: { label: string; value: number | undefined } | null = dashboard.can.delivery
    ? { label: 'Pieces out today', value: trips?.todayQty }
    : dashboard.can.gatePass
      ? { label: 'Gate passes today', value: gatePasses?.today }
      : dashboard.can.challan
        ? { label: 'Challans filed today', value: challans?.today }
        : null

  /**
   * The sentence beside the figure, and it is deliberately short now that it
   * sits on the same line rather than under it.
   *
   * It used to end "everything filed and waiting is below", which was a
   * pointer at the attention list while that list sat directly beneath the
   * hero. It is the last panel on the page now, so the sentence would have
   * been quietly sending somebody past two sections to find it.
   */
  const note =
    headline === null
      ? ''
      : headline.value === undefined
        ? 'Counting what has gone out.'
        : headline.value === 0
          ? 'Nothing has left the gate yet today.'
          : dashboard.can.delivery
            ? `Carried on ${trips?.today === 1 ? 'one trip' : `${(trips?.today ?? 0).toLocaleString()} trips`} so far today.`
            : 'Filed today.'

  const panels: Panel[] = []
  if (dashboard.can.delivery) {
    panels.push({
      icon: Truck,
      label: 'Trips out',
      value: trips?.today,
      note: trips === undefined ? '' : trips.today === 0 ? 'No lorry out yet' : 'on the road today',
      to: '/delivery',
    })
  }
  if (dashboard.can.gatePass) {
    panels.push({
      icon: ScanLine,
      label: 'Gate passes',
      value: gatePasses?.today,
      note: gatePasses === undefined ? '' : 'dated today',
      to: '/gate-pass',
    })
  }
  if (dashboard.can.challan) {
    panels.push({
      icon: ReceiptText,
      label: 'Challans filed',
      value: challans?.today,
      note: challans === undefined ? '' : 'out of the office PDFs',
      to: '/challan',
    })
  }

  const actions: Action[] = []
  if (canWriteGatePasses(dashboard.role)) {
    actions.push({ to: '/gate-pass/new', label: 'File a gate pass', icon: ScanLine })
  }
  if (canWriteChallans(dashboard.role)) {
    actions.push({ to: '/challan/new', label: 'Open a source PDF', icon: ReceiptText })
  }
  if (canWriteDeliveries(dashboard.role)) {
    actions.push({ to: '/delivery/new', label: 'Start a trip', icon: PackageCheck })
  }

  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-brand-from to-brand-to px-4 py-4 text-primary-foreground shadow-lg ring-1 ring-primary-foreground/10 sm:px-6 sm:py-5">
      {/*
       * Depth without decoration. Two soft lights and a top hairline, sized
       * for a band rather than for a panel — the old pair were `size-80` on a
       * box twice this tall, so on a short one both centres fall outside it
       * and the gradient flattens into a wash.
       */}
      <div
        className="pointer-events-none absolute -top-20 -right-12 size-56 rounded-full bg-primary-foreground/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/4 size-48 rounded-full bg-primary-foreground/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary-foreground/25"
        aria-hidden
      />

      <div className="relative">
        {/*
         * Who is reading, and what they start from. The actions sit up here
         * rather than under the headline because that is where a page's own
         * actions belong, and because it costs the banner no height at all:
         * the identity line is one line whatever is beside it.
         */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-sm font-semibold tracking-tight sm:text-base">
              {greetingLine(name, now.getHours())}
            </h1>
            {role && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[11px] font-medium ring-1 ring-primary-foreground/20">
                <role.icon className="size-3" aria-hidden />
                {role.label}
              </span>
            )}
            <span className="text-primary-foreground/35" aria-hidden>
              •
            </span>
            <p className="truncate text-xs text-primary-foreground/70">{DAY_FORMAT.format(now)}</p>
          </div>

          {actions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {actions.map((action, index) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={cn(
                    'group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition outline-none',
                    'focus-visible:ring-2 focus-visible:ring-primary-foreground/60',
                    // The first action is the one this operation does most, so
                    // it carries the weight and the rest sit behind glass.
                    index === 0
                      ? 'bg-primary-foreground text-primary ring-primary-foreground/30 hover:bg-primary-foreground/90'
                      : 'bg-primary-foreground/15 ring-primary-foreground/20 hover:bg-primary-foreground/25',
                  )}
                >
                  {index === 0 ? (
                    <Plus className="size-3.5" aria-hidden />
                  ) : (
                    <action.icon className="size-3.5" aria-hidden />
                  )}
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/*
         * The measurements, as one band. The hairline is what makes it read as
         * an instrument rather than as more of the greeting, and it is the
         * only rule drawn on this surface, so it carries that job on its own.
         */}
        {(headline !== null || panels.length > 0) && (
          <div className="mt-3.5 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-primary-foreground/15 pt-3.5">
            {headline && (
              <div className="min-w-0">
                <p className="text-[10px] font-medium tracking-[0.16em] text-primary-foreground/60 uppercase">
                  {headline.label}
                </p>
                <div className="mt-0.5 flex items-baseline gap-2.5">
                  {/*
                   * A skeleton on the gradient rather than the shared one,
                   * which is built for a light card and disappears against
                   * this surface.
                   */}
                  {headline.value === undefined ? (
                    <div
                      className="h-9 w-20 animate-pulse rounded-lg bg-primary-foreground/20 sm:h-11"
                      aria-hidden
                    />
                  ) : (
                    <p className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                      {headline.value.toLocaleString()}
                    </p>
                  )}
                  <p className="max-w-[13rem] text-[11px] leading-snug text-pretty text-primary-foreground/65">
                    {note}
                  </p>
                </div>
              </div>
            )}

            {panels.length > 0 && (
              <div
                className={cn(
                  'grid min-w-0 flex-1 gap-2 sm:grid-cols-3',
                  panels.length === 1 && 'sm:grid-cols-1',
                  panels.length === 2 && 'sm:grid-cols-2',
                )}
              >
                {panels.map((panel) => (
                  <HeroPanel key={panel.label} panel={panel} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

interface Panel {
  icon: LucideIcon
  label: string
  value: number | undefined
  note: string
  to: string
}

interface Action {
  to: string
  label: string
  icon: LucideIcon
}

/**
 * One count, and a way into the module that owns it. A panel is a link
 * because the figure is the reason somebody would go there — a dashboard
 * whose numbers cannot be pressed is a poster.
 *
 * **It reads across rather than down**, which is what lets three of them sit
 * inside the band: the icon, then the label over its note, then the figure at
 * the end of the row. One layout serves every width — stacked on a phone,
 * three abreast from `sm` — because a card that is wide and short is the same
 * card in a narrow column and in a wide one.
 *
 * The note keeps its line while it is empty (`min-h-4`), or the card would
 * grow by a line the moment its query answered and shunt the band down under
 * somebody's cursor.
 */
function HeroPanel({ panel }: { panel: Panel }) {
  return (
    <Link
      to={panel.to}
      className="group flex items-center gap-2.5 rounded-xl bg-primary-foreground/10 px-2.5 py-2 ring-1 ring-primary-foreground/15 transition outline-none hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 ring-1 ring-primary-foreground/10"
        aria-hidden
      >
        <panel.icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[10px] font-medium tracking-wider text-primary-foreground/65 uppercase">
          {panel.label}
        </span>
        <span className="block min-h-4 truncate text-[11px] leading-4 text-primary-foreground/60">
          {panel.note}
        </span>
      </span>

      {panel.value === undefined ? (
        <span
          className="block h-6 w-7 shrink-0 animate-pulse rounded bg-primary-foreground/20"
          aria-hidden
        />
      ) : (
        <span className="shrink-0 text-xl font-semibold tabular-nums sm:text-2xl">
          {panel.value.toLocaleString()}
        </span>
      )}

      <ArrowRight
        className="size-3 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  )
}
