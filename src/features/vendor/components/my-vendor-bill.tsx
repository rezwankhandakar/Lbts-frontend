import type { ReactNode } from 'react'
import { BadgeCheck, CircleDashed, HandCoins, ReceiptText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { VendorMonthlyBill } from '../types'
import { dueReading } from '../lib/trip-figures'
import { BillStatusBadge } from './vendor-trip-money'
import { countOf, useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface MyVendorBillProps {
  /** Absent until the trip list has answered. */
  bill: VendorMonthlyBill | undefined
  /** The months the bill covers, already in the viewer's language. */
  period: string
  /** A filter change is being fetched; the old figures stay, dimmed. */
  isFetching: boolean
}

/** A figure on the gradient: glass, white text, the label above the number. */
function GlassFigure({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-xl bg-primary-foreground/10 px-3.5 py-3 ring-1 ring-primary-foreground/15 sm:px-4">
      <dt className="flex items-center gap-1.5 text-[13px] font-medium text-primary-foreground/80">
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-1.5 text-lg leading-tight font-bold tracking-tight wrap-break-word tabular-nums sm:text-xl">
        {children}
      </dd>
    </div>
  )
}

function Placeholder() {
  return <span className="block h-6 w-20 animate-pulse rounded-md bg-primary-foreground/20" aria-hidden />
}

/**
 * What the vendor is owed, on the hero of their own page — the figure they open
 * it for.
 *
 * The period follows the trip list below it: pressing *Last month* there makes
 * this last month's bill, which is why the heading names the months rather than
 * saying "this month". Three glass figures and one solid card, because due is
 * the answer and the other three are how it was reached. The card is `bg-card`
 * rather than a lighter glass: Accounts' status colours are tuned for that
 * surface in both themes, and on the gradient they would not read.
 */
export function MyVendorBill({ bill, period, isFetching }: MyVendorBillProps) {
  const t = useT()
  const format = useFormatters()
  const due = bill ? dueReading(bill.due, t) : null

  return (
    <section
      aria-label={t('vendor.trip.monthlyBillAria')}
      className="mt-5 border-t border-primary-foreground/15 pt-4 sm:mt-6 sm:pt-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">
          {t('vendor.trip.billFor', { period })}
        </h2>
        {bill && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-primary-foreground/85">{countOf(bill.tripCount, 'nouns.trip', t)}</span>
            {bill.blankBills > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-[13px] font-medium ring-1 ring-primary-foreground/25">
                <CircleDashed className="size-3.5" aria-hidden />
                {t('vendor.trip.withoutFullBill', {
                  trips: countOf(bill.blankBills, 'nouns.trip', t),
                })}
              </span>
            )}
          </div>
        )}
      </div>

      <dl
        className={cn(
          'mt-3 grid grid-cols-2 gap-2 transition-opacity sm:gap-3 lg:grid-cols-4',
          isFetching && 'opacity-75',
        )}
        aria-busy={!bill}
      >
        <GlassFigure icon={ReceiptText} label={t('vendor.trip.totalAmount')}>
          {bill ? format.taka(bill.totalBill) : <Placeholder />}
        </GlassFigure>
        <GlassFigure icon={HandCoins} label={t('vendor.trip.advance')}>
          {bill ? format.taka(bill.advance) : <Placeholder />}
        </GlassFigure>
        <GlassFigure icon={BadgeCheck} label={t('vendor.trip.paid')}>
          {bill ? format.taka(bill.paid) : <Placeholder />}
        </GlassFigure>

        <div className="min-w-0 rounded-xl bg-card px-3.5 py-3 text-card-foreground shadow-md ring-1 ring-primary-foreground/30 sm:px-4">
          <dt className="text-[13px] font-medium text-muted-foreground">
            {due?.label ?? t('vendor.trip.due')}
          </dt>
          <dd className="mt-1.5">
            {bill && due ? (
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                  className={cn(
                    'text-lg leading-tight font-bold tracking-tight tabular-nums sm:text-xl',
                    due.tone,
                  )}
                >
                  {format.taka(due.amount)}
                </span>
                <BillStatusBadge status={bill.status} />
              </span>
            ) : (
              <span className="block h-6 w-20 animate-pulse rounded-md bg-muted" aria-hidden />
            )}
          </dd>
        </div>
      </dl>
    </section>
  )
}
