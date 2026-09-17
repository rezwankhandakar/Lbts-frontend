import { ExternalLink, Phone, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { VendorAvatar } from '@/features/vendor/components/vendor-identity'
import { cn } from '@/lib/utils'
import { useEntryDialog } from '../hooks/use-entry-dialog'
import { signedTaka, taka } from '../lib/accounts-meta'
import type { VendorBillDetail } from '../types'
import { VendorBillBadge } from './account-atoms'

/**
 * The vendor's month as a sum: rent plus labour, less advances, less payments,
 * equals what is due. Written out left to right because that arithmetic is
 * exactly what the vendor will ask about.
 */
export function VendorBillHero({ detail, canWrite }: { detail: VendorBillDetail; canWrite: boolean }) {
  const dialog = useEntryDialog()
  const { vendor, figures, period } = detail

  const steps = [
    { label: 'Trip rent', value: taka(figures.tripRent) },
    { label: 'Labour bill', value: taka(figures.labourBill), op: '+' },
    { label: 'Trip advances', value: taka(figures.advance), op: '−' },
    { label: 'Paid', value: taka(figures.paid), op: '−' },
  ]

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3.5">
          <VendorAvatar name={vendor.name} photoUrl={vendor.photoUrl} caption={vendor.vendorCode} className="size-12 text-sm" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold tracking-tight">{vendor.name}</h2>
              <VendorBillBadge status={figures.status} />
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
              <span className="font-mono">{vendor.vendorCode}</span>
              {vendor.mobile && (
                <span className="flex items-center gap-1">
                  <Phone className="size-3" aria-hidden />
                  {vendor.mobile}
                </span>
              )}
              <Link to={`/vendors/${vendor.id}`} className="flex items-center gap-1 hover:text-primary">
                Vendor profile
                <ExternalLink className="size-3" aria-hidden />
              </Link>
            </p>
          </div>
        </div>

        {canWrite && figures.due > 0 && (
          <Button
            size="lg"
            onClick={() =>
              dialog.open({
                kind: 'VendorPayment',
                preset: { vendorId: vendor.id, year: period.year, month: period.month, amount: figures.due },
                locked: ['vendorId'],
              })
            }
          >
            <Wallet data-icon="inline-start" aria-hidden />
            Pay {taka(figures.due)}
          </Button>
        )}
      </div>

      <dl className="grid grid-cols-2 border-t sm:grid-cols-5">
        {steps.map((step) => (
          <div key={step.label} className="relative border-b px-4 py-3 sm:border-r sm:border-b-0 sm:px-5">
            <dt className="text-xs text-muted-foreground">
              {step.op && <span className="mr-1 font-semibold">{step.op}</span>}
              {step.label}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{step.value}</dd>
          </div>
        ))}
        <div className={cn('col-span-2 px-4 py-3 sm:col-span-1 sm:px-5', figures.due > 0 ? 'bg-tone-rose/5' : 'bg-tone-emerald/5')}>
          <dt className="text-xs text-muted-foreground">
            <span className="mr-1 font-semibold">=</span>
            {figures.due < 0 ? 'Overpaid' : 'Due'} · {period.label}
          </dt>
          <dd className={cn('mt-1 text-xl font-semibold tabular-nums', figures.due > 0 ? 'text-tone-rose' : 'text-tone-emerald')}>
            {signedTaka(Math.abs(figures.due))}
          </dd>
        </div>
      </dl>
    </section>
  )
}
