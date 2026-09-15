import { Link } from 'react-router-dom'
import { shortTripNumber } from '@/features/delivery/lib/cart'
import { cn } from '@/lib/utils'
import { gatePassProductStatusMeta } from '../lib/trip-do-meta'
import type { GatePassProductLine } from '../types'
import { KindTag, ProductStatusBadge, RowStatusBadge } from './trip-do-badges'

/**
 * One product line on the gate pass: how much of it is linked to challans,
 * where those goods are, and the challan rows themselves — so "five on the gate
 * pass, three on this challan and two on that one" is read in one place.
 */
export function GatePassProductLineCard({ line }: { line: GatePassProductLine }) {
  const meta = gatePassProductStatusMeta(line.status)
  const percent = line.qty > 0 ? Math.min(100, Math.round((line.linkedQty / line.qty) * 100)) : 0

  return (
    <div className="px-4 py-3.5 sm:px-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">{line.productName}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{line.model}</p>
        </div>
        <ProductStatusBadge status={line.status} />
        <p className="w-28 text-right text-xs text-muted-foreground">
          <span className="text-[13px] font-semibold text-foreground tabular-nums">{line.linkedQty}</span>{' '}
          of {line.qty} linked
          <span className="block text-[11px] tabular-nums">
            {line.deliveredQty} delivered · {line.qty - line.deliveredQty} not
          </span>
          {line.remainingQty > 0 && (
            <span className="block text-[11px] text-tone-amber">{line.remainingQty} not on a challan</span>
          )}
        </p>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className={cn('h-full rounded-full', meta.bar)} style={{ width: `${percent}%` }} />
      </div>

      {line.rows.length === 0 ? (
        <p className="mt-2.5 text-xs text-muted-foreground">
          No challan row has this line as its Trip DO yet.
        </p>
      ) : (
        <ul className="mt-2.5 space-y-1">
          {line.rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-muted/20 px-2.5 py-1.5 text-xs"
            >
              <Link
                to={`/challan/${row.challanId}`}
                className="font-mono font-semibold tabular-nums hover:text-primary hover:underline"
                title={row.challanNumber}
              >
                SL {row.slNumber}
              </Link>
              <KindTag kind={row.kind} />
              <span className="min-w-0 flex-1 truncate" title={row.customerName}>
                {row.customerName}
                {(row.thana || row.district) && (
                  <span className="text-muted-foreground">
                    {' · '}
                    {[row.thana, row.district].filter(Boolean).join(', ')}
                  </span>
                )}
              </span>
              {row.tripNumbers.length > 0 && (
                <span className="font-mono text-[11px] text-muted-foreground" title={row.tripNumbers.join(', ')}>
                  {row.tripNumbers.map(shortTripNumber).join(', ')}
                </span>
              )}
              <span className="font-semibold tabular-nums">{row.qty} pcs</span>
              <RowStatusBadge status={row.deliveryStatus} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
