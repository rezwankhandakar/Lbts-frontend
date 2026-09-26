import { ChevronRight, FileClock, ReceiptText, ShieldCheck, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { formatDay } from '../lib/vendor-meta'
import type { VendorDashboard } from '../types'
import { countOf, useT } from '@/lib/i18n'

interface AttentionRow {
  id: string
  severity: 'critical' | 'warning'
  icon: LucideIcon
  title: string
  detail: string
  count: number
  /** Where pressing it lands, with the tab that answers it. */
  to: string
}

/**
 * What this vendor has outstanding, and where to go about it.
 *
 * **Every row is a link**, the rule `ComplianceAlert` on the vendor overview
 * already follows and the Challan backlog chips before it: a count nobody can
 * act on is a number to scroll past. Pressing one opens the tab that holds the
 * records it counted.
 *
 * Nothing here is invented and nothing is drawn speculatively. A row exists
 * only where a real count is above zero, and a vendor with nothing outstanding
 * gets the settled state rather than three rows saying everything is fine — a
 * panel that always has content is a panel people stop reading. That is
 * deliberately the opposite of the rule the tiles above follow, where an absent
 * figure would read as "no information" rather than "nothing to do".
 *
 * Read-only, like everything a vendor account sees: these say what LBTS is
 * waiting for, and the doing of it happens at a desk rather than in a browser.
 */
export function VendorDashboardAttention({ dashboard }: { dashboard: VendorDashboard }) {
  const t = useT()

  const { figures, bill, fleet } = dashboard

  const rows: AttentionRow[] = []

  if (figures.backlog.trips > 0) {
    rows.push({
      id: 'copies',
      severity: 'warning',
      icon: FileClock,
      title: `${countOf(figures.backlog.awaitingCopies, 'nouns.signedCopy', t)} still to come back`,
      detail: `On ${countOf(figures.backlog.trips, 'nouns.trip', t)}${
        figures.backlog.oldest ? `, the oldest run on ${formatDay(figures.backlog.oldest)}` : ''
      }. A trip closes when every receiver's signed challan is scanned in.`,
      count: figures.backlog.awaitingCopies,
      to: '/my-vendor?tab=trips',
    })
  }

  if (bill.blankBills > 0) {
    rows.push({
      id: 'bills',
      severity: 'warning',
      icon: ReceiptText,
      title: `${countOf(bill.blankBills, 'nouns.trip', t)} without a full bill`,
      detail: `Rent or labour has not been entered against ${
        bill.blankBills === 1 ? 'it' : 'them'
      } yet, so ${bill.label}'s total is lower than what is actually owed.`,
      count: bill.blankBills,
      to: '/my-vendor?tab=trips',
    })
  }

  if (fleet.expiredDocuments > 0) {
    rows.push({
      id: 'expired',
      severity: 'critical',
      icon: TriangleAlert,
      title: `${countOf(fleet.expiredDocuments, 'nouns.document', t)} expired`,
      detail:
        'A lorry whose papers have lapsed cannot be sent out. Send the renewed certificate to LBTS to have it filed.',
      count: fleet.expiredDocuments,
      to: '/my-vendor?tab=documents',
    })
  }

  if (fleet.expiringDocuments > 0) {
    rows.push({
      id: 'expiring',
      severity: 'warning',
      icon: FileClock,
      title: `${countOf(fleet.expiringDocuments, 'nouns.document', t)} expiring soon`,
      detail: 'Renew before the date passes and the vehicle or driver stops being assignable.',
      count: fleet.expiringDocuments,
      to: '/my-vendor?tab=documents',
    })
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-tone-emerald/25 bg-tone-emerald/[0.06] p-4">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-emerald/10 text-tone-emerald ring-1 ring-tone-emerald/20"
          aria-hidden
        >
          <ShieldCheck className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium">Nothing outstanding</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            Every signed copy is in, every trip carries its bill, and every document on file is in
            date.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const critical = row.severity === 'critical'

        return (
          <Link
            key={row.id}
            to={row.to}
            className={cn(
              'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring',
              critical
                ? 'border-destructive/25 bg-destructive/[0.06] hover:bg-destructive/10'
                : 'border-tone-amber/25 bg-tone-amber/[0.06] hover:bg-tone-amber/10',
            )}
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
                critical
                  ? 'bg-destructive/10 text-destructive ring-destructive/20'
                  : 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
              )}
              aria-hidden
            >
              <row.icon className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium">{row.title}</p>
              <p className="mt-0.5 text-xs leading-snug text-pretty text-muted-foreground">
                {row.detail}
              </p>
            </div>

            <ChevronRight
              className="mt-1 size-4 shrink-0 self-center text-muted-foreground"
              aria-hidden
            />
          </Link>
        )
      })}
    </div>
  )
}
