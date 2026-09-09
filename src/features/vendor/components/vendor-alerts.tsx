import { ChevronRight, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ComplianceAlert, VendorTab } from '../types'

interface VendorAlertsProps {
  alerts: ComplianceAlert[]
  moreAlerts: number
  isLoading: boolean
  /** Opens the tab the alert is about, with its filter already applied. */
  onOpen: (tab: VendorTab, filter: Record<string, string>) => void
}

/**
 * What needs doing about this vendor, and where to go about it.
 *
 * **Every alert is a button.** A count nobody can act on is a number to scroll
 * past, so pressing one opens the tab it counted with its filter already
 * applied — "2 documents expiring soon" lands on the documents tab filtered to
 * *Expiring Soon*, not on a tab somebody then has to narrow by hand. The same
 * reasoning the Challan backlog chips follow.
 *
 * Nothing here is invented. Every row comes from a real count on the summary
 * endpoint, and a vendor with nothing wrong gets the settled state below rather
 * than a row saying everything is fine — a panel that always has content is one
 * people stop reading. That is deliberately the opposite of the rule a status
 * badge on a *row* follows, where an absent chip would wrongly read as "no
 * information": here an absent alert means there is nothing to do, which is
 * exactly what it looks like.
 */
export function VendorAlerts({ alerts, moreAlerts, isLoading, onOpen }: VendorAlertsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-tone-emerald/25 bg-tone-emerald/[0.06] p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-emerald/10 text-tone-emerald ring-1 ring-tone-emerald/20">
          <ShieldCheck className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium">Nothing needs attention</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            Every document on file is in date, and no vehicle or driver is out of service.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const critical = alert.severity === 'critical'

        return (
          <button
            key={alert.id}
            type="button"
            onClick={() => onOpen(alert.tab, alert.filter)}
            className={cn(
              'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring',
              critical
                ? 'border-tone-rose/25 bg-tone-rose/[0.06] hover:bg-tone-rose/[0.1]'
                : 'border-tone-amber/25 bg-tone-amber/[0.06] hover:bg-tone-amber/[0.1]',
            )}
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
                critical
                  ? 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20'
                  : 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
              )}
            >
              <TriangleAlert className="size-4" aria-hidden />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium wrap-break-word">{alert.title}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                {alert.detail}
              </span>
            </span>

            <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        )
      })}

      {moreAlerts > 0 && (
        <p className="px-1 text-xs text-muted-foreground">
          {moreAlerts} more {moreAlerts === 1 ? 'alert is' : 'alerts are'} not shown. The documents
          tab, filtered, is where the rest are worked through.
        </p>
      )}
    </div>
  )
}
