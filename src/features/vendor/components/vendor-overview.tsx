import { ArrowRight, CalendarClock, FileClock, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/lib/format'
import { formatDay, formatPeriod } from '../lib/vendor-meta'
import type { VendorSummary, VendorTab } from '../types'
import { AssignmentStatusBadge, DocumentStatusBadge } from './status-badges'
import { PanelError } from './panel-states'
import { VendorAlerts } from './vendor-alerts'
import { VendorKpiCards } from './vendor-kpi-cards'

interface VendorOverviewProps {
  summary: VendorSummary | undefined
  isLoading: boolean
  isError: boolean
  errorMessage: string
  isFetching: boolean
  onRetry: () => void
  onOpenTab: (tab: VendorTab, filter?: Record<string, string>) => void
}

/**
 * A section on the overview: a heading, an optional way through to the tab that
 * owns it, and either rows or a sentence saying there are none.
 */
function Section({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string
  icon: typeof History
  action?: { label: string; onClick: () => void }
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h3 className="flex items-center gap-2 text-[13px] font-semibold">
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {title}
        </h3>
        {action && (
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={action.onClick}>
            {action.label}
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
        )}
      </header>
      {children}
    </section>
  )
}

function Nothing({ children }: { children: string }) {
  return <p className="px-4 py-6 text-center text-xs text-muted-foreground">{children}</p>
}

/**
 * The overview tab.
 *
 * The hierarchy is the design: the numbers first, then what needs doing about
 * them, then the two lists that answer "what has been happening" — recent
 * assignments and recent activity — with the expiring documents between them
 * because that is the one list somebody acts on today.
 *
 * All of it comes from one request. The whole reason the server has a summary
 * endpoint is that six separate calls against a sleeping Render instance are
 * six cold starts stacked one behind the other.
 */
export function VendorOverview({
  summary,
  isLoading,
  isError,
  errorMessage,
  isFetching,
  onRetry,
  onOpenTab,
}: VendorOverviewProps) {
  if (isError) {
    return (
      <div className="rounded-xl border bg-card shadow-sm">
        <PanelError
          title="Could not load the overview"
          message={errorMessage}
          onRetry={onRetry}
          isRetrying={isFetching}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <VendorKpiCards
        vehicles={summary?.vehicles}
        drivers={summary?.drivers}
        documents={summary?.documents}
        isLoading={isLoading}
      />

      <VendorAlerts
        alerts={summary?.alerts ?? []}
        moreAlerts={summary?.moreAlerts ?? 0}
        isLoading={isLoading}
        onOpen={(tab, filter) => onOpenTab(tab, filter)}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section
          title="Expiring documents"
          icon={FileClock}
          action={{ label: 'All documents', onClick: () => onOpenTab('documents') }}
        >
          {isLoading ? (
            <div className="space-y-3 p-4" aria-busy="true">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (summary?.expiringDocuments.length ?? 0) === 0 ? (
            <Nothing>Nothing is due for renewal in the next 30 days.</Nothing>
          ) : (
            <ul className="divide-y">
              {summary?.expiringDocuments.map((document) => (
                <li key={document.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{document.documentType}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {document.ownerLabel} · {document.expiryPhrase}
                    </p>
                  </div>
                  <DocumentStatusBadge value={document.status} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Recent assignments"
          icon={CalendarClock}
          action={{ label: 'All assignments', onClick: () => onOpenTab('assignments') }}
        >
          {isLoading ? (
            <div className="space-y-3 p-4" aria-busy="true">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (summary?.recentAssignments.length ?? 0) === 0 ? (
            <Nothing>No driver has been assigned to a vehicle yet.</Nothing>
          ) : (
            <ul className="divide-y">
              {summary?.recentAssignments.map((assignment) => (
                <li
                  key={assignment.id}
                  className="flex items-start justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">
                      {assignment.driver?.name ?? 'Removed driver'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {assignment.vehicle?.registrationNo ?? 'Removed vehicle'} ·{' '}
                      {formatPeriod(assignment.assignedFrom, assignment.assignedUntil)}
                    </p>
                  </div>
                  <AssignmentStatusBadge value={assignment.status} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section
        title="Recent activity"
        icon={History}
        action={{ label: 'Full history', onClick: () => onOpenTab('activity') }}
      >
        {isLoading ? (
          <div className="space-y-3 p-4" aria-busy="true">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (summary?.recentActivity.length ?? 0) === 0 ? (
          <Nothing>Nothing has been changed on this vendor yet.</Nothing>
        ) : (
          <ul className="divide-y">
            {summary?.recentActivity.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                <p className="min-w-0 text-[13px] wrap-break-word">{entry.summary}</p>
                <p className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                  {entry.actor ? `${entry.actor.name} · ` : ''}
                  {formatRelative(entry.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {summary && summary.activeAssignments > 0 && (
        <p className="px-1 text-xs text-muted-foreground">
          {summary.activeAssignments} of this vendor&apos;s {summary.vehicles.total}{' '}
          {summary.vehicles.total === 1 ? 'vehicle' : 'vehicles'}{' '}
          {summary.activeAssignments === 1 ? 'has' : 'have'} a driver assigned right now. Assignment
          history is kept in full, so a vehicle can always say who was driving it on a given day —
          the last one is {formatDay(summary.recentAssignments[0]?.assignedFrom ?? null)}.
        </p>
      )}
    </div>
  )
}
