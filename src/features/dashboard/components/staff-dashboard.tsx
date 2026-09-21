import { Suspense, lazy } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/use-auth-store'
import { useDashboard } from '../hooks/use-dashboard'
import { DashboardAttention } from './dashboard-attention'
import { DashboardHero } from './dashboard-hero'
import { DashboardModules } from './dashboard-modules'

/**
 * The money panel is lazy for the reason the vendor dashboard is.
 *
 * This is the app's only eager route, so anything imported straight into it is
 * downloaded by **every** account on first load. The panel draws Accounts'
 * `TrendChart` and the taka vocabulary behind it, and it is rendered by three
 * roles out of five — an `OpEx` would have carried a column chart they can
 * never see. Imported eagerly it measured about 12 KB gzipped in the entry
 * bundle, which is a real cost paid by the role that files the most gate
 * passes.
 *
 * It resolves through its **own** `<Suspense>` rather than the route's, and
 * that is the whole point of the local boundary: the one inside `<main>`
 * swaps the entire page for a skeleton, so suspending against it would blank
 * the hero and the attention list somebody is already reading while a chunk
 * arrives at the bottom of the page.
 */
const DashboardMoney = lazy(() =>
  import('./dashboard-money').then((m) => ({ default: m.DashboardMoney })),
)

/**
 * The operational overview, for every role but `Vendor`.
 *
 * **Read top to bottom it is one question answered three times, narrowing.**
 * The hero is *what is happening now* — the day's work, at a glance, with the
 * things somebody starts from. The attention list is *what is waiting*, which
 * is the reason a dashboard exists at all: not how much was done but what has
 * not been. The module cards are *where everything is*, with the totals that
 * say whether a module is worth opening. And for the roles that keep the
 * books, the money panel is *what it all came to*.
 *
 * Three rules hold the whole page together, and every one of them is stated
 * elsewhere in this codebase because every one of them was learned somewhere
 * else first:
 *
 * - **No figure is ever invented.** Every number is a real aggregation from
 *   the module that owns it, read through that module's own endpoint. A
 *   module with no stats endpoint gets a link rather than a placeholder.
 * - **A reading is drawn at zero; a job is not.** The hero and the module
 *   cards show zero, because an absent figure there would read as "no
 *   information" rather than "nothing yet". The attention rows are absent at
 *   zero, because a panel that always has content is one people stop reading.
 * - **Every figure is a link.** A count nobody can act on is a number to
 *   scroll past, so each one carries the filter that answers it.
 *
 * **Each panel degrades on its own.** A failed accounts overview must not
 * blank the operating figures beside it, so nothing here waits for everything
 * — each section renders as soon as its own query answers, with a skeleton
 * where the rest has not.
 */
export function StaffDashboard() {
  const dashboard = useDashboard()
  const name = useAuthStore((state) => state.profile?.name ?? '')

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <DashboardHero dashboard={dashboard} name={name} />

      <DashboardAttention dashboard={dashboard} />

      <DashboardModules dashboard={dashboard} />

      {dashboard.can.accounts && (
        <Suspense fallback={<Skeleton className="h-[34rem] rounded-xl lg:h-96" />}>
          <DashboardMoney dashboard={dashboard} />
        </Suspense>
      )}

      {/*
       * An account whose role reaches nothing at all. It should not be
       * reachable — every role in the system reads at least Gate Pass — but a
       * role added later and not yet wired into any module would land here,
       * and an honest empty state beats a page of four headings above nothing.
       */}
      {!dashboard.asked && (
        <EmptyState
          icon={LayoutDashboard}
          title="No modules are open to this account yet"
          description="Your role does not reach any module that reports figures. An administrator can tell you what this account is meant to cover."
          footnote="Nothing is missing — there is simply nothing this role is allowed to summarise."
        />
      )}
    </div>
  )
}
