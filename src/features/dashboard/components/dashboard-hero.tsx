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
 * three counts behind it sit beside it as the detail rather than as equals.
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
    <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-from to-brand-to p-5 text-primary-foreground shadow-xl ring-1 ring-primary-foreground/10 sm:p-7">
      {/* Depth without decoration — two soft lights and a top hairline. */}
      <div
        className="pointer-events-none absolute -top-32 -right-20 size-80 rounded-full bg-primary-foreground/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-24 size-80 rounded-full bg-primary-foreground/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary-foreground/25"
        aria-hidden
      />

      <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">
              {greetingLine(name, now.getHours())}
            </h1>
            {role && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-primary-foreground/20">
                <role.icon className="size-3" aria-hidden />
                {role.label}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-primary-foreground/70">{DAY_FORMAT.format(now)}</p>

          {headline && (
            <>
              <p className="mt-6 text-[11px] font-medium tracking-[0.14em] text-primary-foreground/70 uppercase">
                {headline.label}
              </p>
              {/*
               * A skeleton on the gradient rather than the shared one, which is
               * built for a light card and disappears against this surface.
               */}
              {headline.value === undefined ? (
                <div
                  className="mt-2 h-12 w-40 animate-pulse rounded-lg bg-primary-foreground/20 sm:h-14"
                  aria-hidden
                />
              ) : (
                <p className="mt-1.5 text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
                  {headline.value.toLocaleString()}
                </p>
              )}
              <p className="mt-2 max-w-md text-xs leading-relaxed text-pretty text-primary-foreground/70">
                {headline.value === undefined
                  ? 'Counting what has gone out.'
                  : headline.value === 0
                    ? 'Nothing has left the gate yet today. Everything filed and waiting is below.'
                    : dashboard.can.delivery
                      ? `Carried on ${trips?.today === 1 ? 'one trip' : `${(trips?.today ?? 0).toLocaleString()} trips`} so far today, across every vendor.`
                      : 'Filed today. Everything waiting is below.'}
              </p>
            </>
          )}

          {actions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {actions.map((action, index) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={cn(
                    'group inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium ring-1 transition outline-none',
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

        {panels.length > 0 && (
          <div
            className={cn(
              'grid gap-3 sm:grid-cols-3 lg:w-[30rem]',
              panels.length === 1 && 'sm:grid-cols-1 lg:w-[16rem]',
              panels.length === 2 && 'sm:grid-cols-2 lg:w-[22rem]',
            )}
          >
            {panels.map((panel) => (
              <HeroPanel key={panel.label} panel={panel} />
            ))}
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
 */
function HeroPanel({ panel }: { panel: Panel }) {
  return (
    <Link
      to={panel.to}
      className="group rounded-2xl bg-primary-foreground/10 p-4 ring-1 ring-primary-foreground/15 transition outline-none hover:bg-primary-foreground/15 focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
    >
      <p className="flex items-center gap-1.5 truncate text-[11px] font-medium tracking-wider text-primary-foreground/70 uppercase">
        <panel.icon className="size-3.5 shrink-0" aria-hidden />
        {panel.label}
      </p>

      {panel.value === undefined ? (
        <div
          className="mt-2.5 h-7 w-12 animate-pulse rounded bg-primary-foreground/20"
          aria-hidden
        />
      ) : (
        <p className="mt-2.5 truncate text-2xl font-semibold tabular-nums">
          {panel.value.toLocaleString()}
        </p>
      )}

      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-primary-foreground/65">
        {panel.note}
        <ArrowRight
          className="size-3 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
          aria-hidden
        />
      </p>
    </Link>
  )
}
