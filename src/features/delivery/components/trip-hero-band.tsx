import type { ReactNode } from 'react'
import { CalendarDays } from 'lucide-react'
import { countOf, useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { completionMeta, shortTripNumber, tripStatusMeta } from '../lib/delivery-meta'
import type { TripRecord } from '../types'

interface TripHeroBandProps {
  trip: TripRecord
  /** The trip's own actions — print, edit, delete — drawn on the band. */
  actions: ReactNode
  /** Drawn between the headline and the progress strip: who ran the trip. */
  children?: ReactNode
}

/**
 * The headline of a trip, on the brand gradient: its number, where it stands,
 * the day it ran, who ran it, and one segment per challan saying which
 * deliveries are done.
 *
 * Kept to three short rows because the whole head of the page has to fit a
 * laptop screen: the number, status and date share one line with the actions,
 * the parties are one row of chips beneath, and the progress strip carries its
 * own count at its end rather than on a line of its own.
 *
 * Its palette is `primary-foreground` at varying opacity rather than the tone
 * table, for the reason the dashboard hero gives: the tones are tuned for a
 * light card and wash out against this surface. The one exception is each
 * status dot, which is the same dot the badge everywhere else draws.
 *
 * The progress strip is a segment per challan rather than one bar, because
 * "1 of 3" says how far and the segments say *which* — a returned load and a
 * copy declared lost each keep their own colour.
 */
export function TripHeroBand({ trip, actions, children }: TripHeroBandProps) {
  const t = useT()
  const format = useFormatters()

  const meta = tripStatusMeta(trip.status, t)
  const challans = trip.challans ?? []
  const open = trip.status !== 'Completed'
  const Icon = meta.icon

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-brand-from to-brand-to px-4 py-3 text-primary-foreground sm:px-5">
      <div
        className="pointer-events-none absolute -top-20 -right-10 size-56 rounded-full bg-primary-foreground/15 blur-3xl"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary-foreground/25" aria-hidden />

      <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
            <Icon className="size-4" aria-hidden />
          </span>
          <h1 className="font-mono text-xl leading-none font-bold tracking-tight sm:text-2xl">
            {shortTripNumber(trip.tripNumber)}
          </h1>
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-primary-foreground/25"
            title={meta.description}
          >
            <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
            {meta.label}
            {open && trip.challanCount > 0 && (
              <span className="font-medium tabular-nums opacity-80">
                · {format.number(trip.completedChallans)}/{format.number(trip.challanCount)}
              </span>
            )}
          </span>
          <span className="flex flex-wrap items-center gap-x-2 text-xs text-primary-foreground/80">
            <span className="inline-flex items-center gap-1" title={t('delivery.summary.tripDate')}>
              <CalendarDays className="size-3.5" aria-hidden />
              {format.calendarDay(trip.tripDate)}
            </span>
            <span className="text-primary-foreground/40" aria-hidden>
              •
            </span>
            <span>{countOf(trip.challanCount, 'nouns.challan', t)}</span>
            <span className="text-primary-foreground/40" aria-hidden>
              •
            </span>
            <span>{countOf(trip.totalQty, 'nouns.pc', t)}</span>
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">{actions}</div>
      </div>

      {children && <div className="relative mt-2.5">{children}</div>}

      {challans.length > 0 && (
        <div className="relative mt-2.5 flex items-center gap-3">
          <div className="flex min-w-0 flex-1 gap-1" aria-hidden>
            {challans.map((challan) => {
              const done = challan.outcome === 'Complete'
              const segment = completionMeta(challan, t)

              return (
                <span
                  key={challan.challanId}
                  title={`${challan.challanNumber} · ${segment.label}`}
                  className={cn(
                    'h-1.5 min-w-1 flex-1 rounded-full',
                    done ? segment.dot : 'bg-primary-foreground/20',
                  )}
                />
              )
            })}
          </div>
          <p className="shrink-0 text-[11px] text-primary-foreground/80 tabular-nums">
            {t('delivery.hero.progress', {
              done: format.number(trip.completedChallans),
              total: format.number(trip.challanCount),
            })}
          </p>
        </div>
      )}
    </div>
  )
}
