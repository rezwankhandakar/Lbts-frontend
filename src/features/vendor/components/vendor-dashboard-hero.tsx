import { ArrowRight, CalendarDays, PackageCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { vendorStatusMeta } from '@/features/accounts/lib/accounts-meta'
import { taka } from '@/features/delivery/lib/delivery-meta'
import { formatDay } from '../lib/vendor-meta'
import type { VendorDashboard } from '../types'
import { VendorAvatar } from './vendor-identity'
import { countOf, useT } from '@/lib/i18n'

/**
 * The vendor's month, as the first thing they see.
 *
 * **The headline is what is still owed**, because that is what a vendor opens
 * this page for. Everything else on the dashboard describes the work; this one
 * figure is what the work came to and whether it has been settled — so it is
 * the largest thing on the screen and the three figures behind it (billed,
 * advanced, paid) sit under it as the arithmetic rather than beside it as
 * equals.
 *
 * Due is the **month's** figure and says so in its own label, because a vendor
 * payment names a month and never a trip — the same rule the Trips tab's
 * monthly bill follows, and the same figures the Vendor Bills page in Accounts
 * shows for that month.
 *
 * A surface that is dark in both themes — the auth panel's gradient, as the
 * Accounts balance hero uses — so it reads as the page's headline in either.
 */
export function VendorDashboardHero({ dashboard }: { dashboard: VendorDashboard }) {
  const t = useT()

  const { vendor, bill, figures } = dashboard
  const status = vendorStatusMeta(bill.status ?? 'No Bill', t)

  /**
   * Three different sentences, not one with a sign in front of it.
   *
   * A negative due is not "due −৳2,000", it is money paid ahead; and a zero is
   * not "৳0 due", it is a month that is settled. `DueAmount` in the Trips tab
   * makes the same three-way split for the same reason — an amount owed should
   * never need a minus sign read off it to be understood.
   */
  const headline =
    bill.due > 0
      ? { label: 'Due', value: taka(bill.due) }
      : bill.due < 0
        ? { label: 'Paid ahead', value: taka(-bill.due) }
        : { label: 'Due', value: bill.totalBill > 0 ? 'Settled' : taka(0) }

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-from to-brand-to p-5 text-primary-foreground shadow-xl ring-1 ring-primary-foreground/10 sm:p-7">
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
          <div className="flex min-w-0 items-center gap-3">
            <VendorAvatar
              name={vendor.name}
              photoUrl={vendor.photoUrl}
              caption={vendor.vendorCode}
              className="size-11 bg-primary-foreground/15 text-primary-foreground ring-primary-foreground/25"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight">{vendor.name}</p>
              <p className="truncate font-mono text-[11px] text-primary-foreground/70">
                {vendor.vendorCode}
                {figures.lifetime.since && (
                  <span className="font-sans">
                    {' · '}
                    {countOf(figures.lifetime.trips, 'nouns.trip', t)} since{' '}
                    {formatDay(figures.lifetime.since)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <p className="mt-6 text-[11px] font-medium tracking-[0.14em] text-primary-foreground/70 uppercase">
            {headline.label} · {bill.label}
          </p>
          <p className="mt-1.5 text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
            {headline.value}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/*
             * The word from the shared vendor-bill vocabulary rather than one
             * written here, so this says exactly what the Vendor Bills page in
             * Accounts says about the same month. The tone table's colours are
             * for a light surface, so on the gradient every pill wears the same
             * glass and the word carries the meaning on its own.
             */}
            <span className="inline-flex items-center rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium ring-1 ring-primary-foreground/20">
              {status.label}
            </span>
            {bill.blankBills > 0 && (
              <span className="inline-flex items-center rounded-full bg-primary-foreground/15 px-3 py-1 text-xs ring-1 ring-primary-foreground/20">
                {countOf(bill.blankBills, 'nouns.trip', t)} without a full bill
              </span>
            )}
          </div>

          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            <Amount label="Billed" value={bill.totalBill} />
            <Amount label="Advance" value={bill.advance} />
            <Amount label="Paid" value={bill.paid} />
          </dl>

          <Link
            to="/my-vendor?tab=trips"
            className="group mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary-foreground/15 px-3.5 py-2 text-xs font-medium ring-1 ring-primary-foreground/20 transition outline-none hover:bg-primary-foreground/25 focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
          >
            Every trip, month by month
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[26rem]">
          <Panel
            icon={CalendarDays}
            label={bill.label}
            primary={countOf(figures.month.trips, 'nouns.trip', t)}
            secondary={`${figures.month.qty.toLocaleString()} pcs carried`}
            share={figures.month.deliveryRate}
            note={
              figures.month.qty === 0
                ? 'Nothing has gone out this month yet'
                : `${figures.month.deliveryRate}% of what went out stayed delivered`
            }
          />
          <Panel
            icon={Truck}
            label="Today"
            primary={countOf(figures.todayTrips, 'nouns.trip', t)}
            secondary={`${figures.todayQty.toLocaleString()} pcs`}
            // The date under "Today" is not decoration: it is what says whose
            // day this is, on a page whose every other figure is a month.
            note={
              figures.todayTrips === 0
                ? `No lorry out yet on ${formatDay(figures.today)}`
                : `Out on ${formatDay(figures.today)}`
            }
          />
        </div>
      </div>
    </section>
  )
}

function Amount({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[11px] text-primary-foreground/65">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{taka(value)}</dd>
    </div>
  )
}

/**
 * One period's work. The bar is pieces delivered as a share of pieces carried —
 * a proportion is read down a page without being read, which a pair of figures
 * on their own is not. It is drawn only where a share means something: "today"
 * has no denominator worth a bar.
 */
function Panel({
  icon: Icon,
  label,
  primary,
  secondary,
  share,
  note,
}: {
  icon: typeof Truck
  label: string
  primary: string
  secondary: string
  share?: number
  note: string
}) {
  return (
    <div className="rounded-2xl bg-primary-foreground/10 p-4 ring-1 ring-primary-foreground/15">
      <p className="flex items-center gap-1.5 truncate text-[11px] font-medium tracking-wider text-primary-foreground/70 uppercase">
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {label}
      </p>

      <p className="mt-2.5 truncate text-2xl font-semibold tabular-nums">{primary}</p>
      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-primary-foreground/75">
        <PackageCheck className="size-3.5 shrink-0" aria-hidden />
        {secondary}
      </p>

      {share !== undefined && (
        <div
          className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-primary-foreground/15"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-primary-foreground/70 transition-[width]"
            style={{ width: `${share}%` }}
          />
        </div>
      )}
      <p className="mt-1.5 text-[11px] text-primary-foreground/65">{note}</p>
    </div>
  )
}
