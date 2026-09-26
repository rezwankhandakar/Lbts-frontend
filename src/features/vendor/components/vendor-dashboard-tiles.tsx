import {
  CircleCheckBig,
  FileClock,
  IdCard,
  PackageCheck,
  ShieldCheck,
  Truck,
  Undo2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { formatDay } from '../lib/vendor-meta'
import type { VendorDashboard } from '../types'
import { countOf, useT } from '@/lib/i18n'

interface Tile {
  key: string
  icon: LucideIcon
  label: string
  value: number
  note: string
  /** The icon tile's colour, in the `TRIP_STATUS_META` shape. */
  tone: string
}

/**
 * What happened to the goods and to the paper.
 *
 * Deliberately four things the hero above does not already say. The hero
 * carries the money, the trips and the pieces that went; these carry what
 * became of them — what arrived, what came back, what is still waiting to be
 * signed for, and how many trips are finished.
 *
 * **Every tile is drawn at zero**, unlike the attention rows below it. A tile
 * is a reading of the month, and an absent one would read as "no information"
 * rather than "nothing came back" — the same distinction a status badge on a
 * row makes against a backlog chip.
 */
export function VendorDashboardTiles({ dashboard }: { dashboard: VendorDashboard }) {
  const t = useT()

  const { month, backlog } = dashboard.figures

  const tiles: Tile[] = [
    {
      key: 'delivered',
      icon: PackageCheck,
      label: 'Delivered this month',
      value: month.delivered,
      note:
        month.qty === 0
          ? 'Nothing carried yet'
          : `of ${month.qty.toLocaleString()} pcs carried · ${month.deliveryRate}%`,
      tone: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    },
    {
      key: 'returned',
      icon: Undo2,
      label: 'Back at depot',
      value: month.returned,
      note:
        month.returned === 0
          ? 'Nothing came back this month'
          : 'pieces returned off a trip this month',
      tone: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
    },
    {
      key: 'awaiting',
      icon: FileClock,
      label: 'Awaiting signed copy',
      value: backlog.awaitingCopies,
      note:
        backlog.trips === 0
          ? 'Every copy is in'
          : `across ${countOf(backlog.trips, 'nouns.trip', t)}${
              backlog.oldest ? ` · oldest ${formatDay(backlog.oldest)}` : ''
            }`,
      tone: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    },
    {
      key: 'completed',
      icon: CircleCheckBig,
      label: 'Trips completed',
      value: month.completedTrips,
      note:
        month.trips === 0
          ? 'No trips this month yet'
          : `of ${countOf(month.trips, 'nouns.trip', t)} this month`,
      tone: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.key}
          className="min-w-0 rounded-xl border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md sm:p-4"
        >
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-lg ring-1',
              tile.tone,
            )}
            aria-hidden
          >
            <tile.icon className="size-4" />
          </span>
          <dt className="mt-3 text-xs text-muted-foreground">{tile.label}</dt>
          <dd className="mt-1 text-2xl leading-none font-semibold tracking-tight tabular-nums">
            {tile.value.toLocaleString()}
          </dd>
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{tile.note}</p>
        </div>
      ))}
    </dl>
  )
}

/**
 * The fleet behind the trips, as a strip rather than a panel.
 *
 * A vendor knows their own lorries; what this answers is "does LBTS have them
 * on record, and is anything out of date" — so each figure is a way into the
 * tab that holds it rather than a number to look at. The compliance figure is
 * the only one that changes colour, because it is the only one that can be
 * wrong.
 */
export function VendorDashboardFleet({ dashboard }: { dashboard: VendorDashboard }) {
  const { fleet } = dashboard
  const lapsing = fleet.expiredDocuments + fleet.expiringDocuments

  const links = [
    {
      to: '/my-vendor?tab=vehicles',
      icon: Truck,
      label: 'Vehicles',
      value: fleet.vehicles.toLocaleString(),
      tone: '',
    },
    {
      to: '/my-vendor?tab=drivers',
      icon: IdCard,
      label: 'Drivers',
      value: fleet.drivers.toLocaleString(),
      tone: '',
    },
    /**
     * A settled fleet reads "In date" rather than "0", because a zero here
     * looks like a count of documents rather than a count of problems — and
     * "0 documents" is precisely the wrong thing to tell somebody whose papers
     * are all filed and all valid.
     */
    lapsing > 0
      ? {
          to: '/my-vendor?tab=documents',
          icon: FileClock,
          label: 'Documents lapsing',
          value: lapsing.toLocaleString(),
          tone: 'text-tone-amber',
        }
      : {
          to: '/my-vendor?tab=documents',
          icon: ShieldCheck,
          label: 'Documents',
          value: 'In date',
          tone: 'text-tone-emerald',
        },
  ]

  return (
    <section
      aria-label="Fleet on record"
      className="grid grid-cols-3 divide-x overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      {links.map((link) => (
        <Link
          key={link.label}
          to={link.to}
          className="group min-w-0 px-3 py-3.5 transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/40 sm:px-4"
        >
          <p className="flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
            <link.icon className={cn('size-3.5 shrink-0', link.tone)} aria-hidden />
            {link.label}
          </p>
          <p
            className={cn(
              'mt-1 truncate text-xl font-semibold tabular-nums group-hover:underline',
              link.tone,
            )}
          >
            {link.value}
          </p>
        </Link>
      ))}
    </section>
  )
}
