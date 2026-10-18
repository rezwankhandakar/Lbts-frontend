import { Eye, Hash, MapPin, Phone } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { vendorStatusMeta } from '../lib/vendor-meta'
import type { VendorMonthlyBill, VendorRecord } from '../types'
import { MyVendorBill } from './my-vendor-bill'
import { VendorAvatar } from './vendor-identity'
import { useT } from '@/lib/i18n'

interface MyVendorHeroProps {
  vendor: VendorRecord
  bill: VendorMonthlyBill | undefined
  period: string
  isFetching: boolean
}

/**
 * The head of a vendor's own page: who they are, and what they are owed.
 *
 * On the brand gradient the Delivery list and the trip page open with, so the
 * vendor's page reads as part of the same application rather than as a form
 * somebody was given. Its palette is `primary-foreground` at varying opacity,
 * the dashboard hero's rule, which holds in both themes because the brand layer
 * keeps that colour near-white in both.
 *
 * What it replaced was a grey "read-only" banner, a white identity card and the
 * bill as four small boxes inside the trip list's toolbar. The banner is now a
 * chip on the hero (with the full sentence as its tooltip and again under the
 * list, where a phone can read it), and the bill is the hero's second half,
 * because it is what a vendor opens this page to find out.
 */
export function MyVendorHero({ vendor, bill, period, isFetching }: MyVendorHeroProps) {
  const t = useT()
  const status = vendorStatusMeta(vendor.status, t)
  const StatusIcon = status.icon

  return (
    <section
      aria-label={vendor.name}
      className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-primary-foreground shadow-md ring-1 ring-primary-foreground/10"
    >
      <div
        className="pointer-events-none absolute -top-28 -right-16 size-72 rounded-full bg-primary-foreground/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-36 -left-24 size-80 rounded-full bg-primary-foreground/10 blur-3xl"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary-foreground/25" aria-hidden />

      <div className="relative p-4 sm:p-6">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <VendorAvatar
            name={vendor.name}
            photoUrl={vendor.photoUrl}
            caption={vendor.vendorCode}
            className="size-14 rounded-2xl bg-primary-foreground/15 text-lg text-primary-foreground ring-primary-foreground/30 sm:size-16 sm:text-xl"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <h1 className="text-xl leading-tight font-bold tracking-tight wrap-break-word sm:text-2xl">
                {vendor.name}
              </h1>
              <span
                className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-xs font-semibold ring-1 ring-primary-foreground/25"
                title={status.description}
              >
                <StatusIcon className="size-3.5" aria-hidden />
                {status.label}
              </span>
            </div>

            <div className="mt-2 flex flex-col gap-1.5 text-sm text-primary-foreground/85 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Hash className="size-4 shrink-0 opacity-80" aria-hidden />
                {vendor.vendorCode}
              </span>
              <a
                href={`tel:${vendor.mobile.replace(/\s/g, '')}`}
                aria-label={t('vendor.page.callAria', { phone: vendor.mobile })}
                className="inline-flex w-fit items-center gap-1.5 rounded-sm outline-none hover:text-primary-foreground hover:underline focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                <Phone className="size-4 shrink-0 opacity-80" aria-hidden />
                {vendor.mobile}
              </a>
              {vendor.address && (
                <span className="inline-flex items-start gap-1.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 opacity-80" aria-hidden />
                  <span className="wrap-break-word">{vendor.address}</span>
                </span>
              )}
            </div>
          </div>

          <span
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1 text-[13px] font-medium ring-1 ring-primary-foreground/20 sm:inline-flex"
            title={t('vendor.page.readOnlyNotice')}
          >
            <Eye className="size-4" aria-hidden />
            {t('vendor.page.readOnlyChip')}
          </span>
        </div>

        {vendor.statusNote && (
          <p className="mt-4 rounded-xl bg-primary-foreground/10 px-3.5 py-2.5 text-sm leading-relaxed ring-1 ring-primary-foreground/20">
            {vendor.statusNote}
          </p>
        )}

        <MyVendorBill bill={bill} period={period} isFetching={isFetching} />
      </div>
    </section>
  )
}

/** The hero's shape while the vendor record is still on its way. No layout jump. */
export function MyVendorHeroSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6" aria-busy="true">
      <div className="flex items-start gap-4">
        <Skeleton className="size-14 rounded-2xl sm:size-16" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-6 w-56 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>
      <div className="mt-6 border-t pt-5">
        <Skeleton className="h-5 w-40" />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((tile) => (
            <Skeleton key={tile} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
