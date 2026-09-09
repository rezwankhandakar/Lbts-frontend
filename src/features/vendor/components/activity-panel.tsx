import {
  Activity,
  Building2,
  FileText,
  Route,
  Truck,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useVendorActivity } from '../hooks/use-vendors'
import type { ActivityRecord, VendorRecord } from '../types'
import { Panel, PanelEmpty, PanelError } from './panel-states'

/** Which icon a row gets, from what the entry is about. */
const ICONS: Record<string, LucideIcon> = {
  Vendor: Building2,
  Vehicle: Truck,
  Driver: UserRound,
  Assignment: Route,
  Document: FileText,
}

/**
 * A tinted chip per entity kind, using the same hues the rest of the module
 * does — a vehicle is indigo wherever it appears, a driver cyan.
 */
const CHIPS: Record<string, string> = {
  Vendor: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
  Vehicle: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  Driver: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
  Assignment: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  Document: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
}

function Entry({ entry, isLast }: { entry: ActivityRecord; isLast: boolean }) {
  const Icon = ICONS[entry.entityType] ?? Activity

  return (
    <li className="relative flex gap-3 px-4 py-3">
      {/* The thread down the left, stopping at the last entry so the list does
          not appear to continue past its end. */}
      {!isLast && (
        <span className="absolute top-11 bottom-0 left-[2.1rem] w-px bg-border" aria-hidden />
      )}

      <span
        className={cn(
          'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
          CHIPS[entry.entityType] ?? 'bg-muted text-muted-foreground ring-border',
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug wrap-break-word">{entry.summary}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {entry.actor ? `${entry.actor.name} · ` : ''}
          <time dateTime={entry.createdAt} title={formatDateTime(entry.createdAt)}>
            {formatRelative(entry.createdAt)}
          </time>
        </p>
      </div>
    </li>
  )
}

/**
 * What has happened to this vendor.
 *
 * The system has no general audit module — CLAUDE.md says so, and the user
 * document keeps provenance rather than a log — so this reads a small
 * append-only collection written only by the Vendor module's own services.
 * Nothing in the module branches on it, which is what makes it safe for the
 * writer never to throw: a missing entry costs a gap in this list and nothing
 * else.
 *
 * Each row names the thing it happened to as a **copy** rather than a link, so
 * "Vehicle DHAKA METRO-TA-11-1234 removed" still reads afterwards. A link to a
 * deleted record is not a sentence.
 */
export function ActivityPanel({ vendor }: { vendor: VendorRecord }) {
  const query = useVendorActivity(vendor.id)
  const entries = query.data ?? []

  return (
    <Panel label="Activity">
      {query.isPending ? (
        <ul className="divide-y" aria-busy="true">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className="flex gap-3 px-4 py-3">
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-32" />
              </div>
            </li>
          ))}
        </ul>
      ) : query.isError ? (
        <PanelError
          title="Could not load the activity"
          message={query.error?.message ?? 'Something went wrong.'}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : entries.length === 0 ? (
        <PanelEmpty
          icon={Activity}
          title="Nothing recorded yet"
          description="Adding a vehicle, assigning a driver, filing a document or changing a status all appear here, with who did it and when."
          isFiltered={false}
        />
      ) : (
        <ul>
          {entries.map((entry, index) => (
            <Entry key={entry.id} entry={entry} isLast={index === entries.length - 1} />
          ))}
        </ul>
      )}
    </Panel>
  )
}
