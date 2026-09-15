import { ArrowUpRight, Link2, RefreshCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGatePassTripDoStatus } from '../hooks/use-trip-do'
import { ProductStatusBadge } from './trip-do-badges'
import { GatePassProductLineCard } from './gate-pass-product-line'

/**
 * The gate pass side of the Trip DO sheet: for each product line on this gate
 * pass, which challan rows came out on it and where those goods are now.
 *
 * Lives in the Trip DO feature and is composed into the gate pass page by
 * import — it renders this module's links, the way Delivery composes the
 * Vendor module's badges rather than copying them.
 */
export function GatePassTripDoPanel({ gatePassId, tripDo }: { gatePassId: string; tripDo: string }) {
  const query = useGatePassTripDoStatus(gatePassId)
  const status = query.data

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <header className="flex flex-wrap items-center gap-2.5 border-b bg-muted/30 px-4 py-3 sm:px-5">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-emerald/10 text-tone-emerald ring-1 ring-tone-emerald/20"
          aria-hidden
        >
          <Link2 className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold tracking-tight">Challans on this Trip DO</h2>
          <p className="text-xs text-muted-foreground">
            {status
              ? `${status.linkedQty} of ${status.totalQty} pcs linked to challans`
              : 'Where the goods on this gate pass went, as the challans say.'}
          </p>
        </div>
        {status && <ProductStatusBadge status={status.status} />}
        <Button
          variant="ghost"
          size="sm"
          render={<Link to={`/trip-do?q=${encodeURIComponent(tripDo)}`} />}
        >
          Open sheet
          <ArrowUpRight data-icon="inline-end" aria-hidden />
        </Button>
      </header>

      {query.isPending ? (
        <div className="space-y-3 p-4 sm:p-5" aria-busy="true">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ) : query.isError || !status ? (
        <div className="flex flex-col items-center px-6 py-8 text-center" role="alert">
          <p className="text-sm text-muted-foreground">
            {query.error?.message ?? 'The linked challans could not be loaded.'}
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void query.refetch()}>
            <RefreshCcw data-icon="inline-start" aria-hidden />
            Try again
          </Button>
        </div>
      ) : (
        <div className="divide-y">
          {status.lines.map((line) => (
            <GatePassProductLineCard key={`${line.productName}-${line.model}`} line={line} />
          ))}
        </div>
      )}
    </section>
  )
}
