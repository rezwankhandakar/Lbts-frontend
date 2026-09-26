import { Suspense, lazy } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'
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
 * that is the whole point of the local boundary: the one inside `<main>` swaps
 * the entire page for a skeleton, so suspending against it would blank the
 * hero above it and the modules and attention list below while a chunk
 * arrives. That matters more now the panel sits second rather than last: a
 * boundary this high up the page is exactly the one that must not take the
 * rest of the page down with it, and the skeleton holds its own space until
 * the chunk lands.
 */
const DashboardMoney = lazy(() =>
  import('./dashboard-money').then((m) => ({ default: m.DashboardMoney })),
)

/**
 * The operational overview, for every role but `Vendor`.
 *
 * **Read top to bottom it is one question answered four times, widening out
 * and then back down to what is left to do.** The hero is *what is happening
 * now* — the day's work, at a glance, with the things somebody starts from.
 * For the roles that keep the books, the money panel under it is *what it all
 * came to*, which is the figure those roles open this page for and is why it
 * reads before the operating detail rather than after it. The module cards are
 * *where everything is*, with the totals that say whether a module is worth
 * opening. And the attention list closes the page with *what is waiting*,
 * which is the one section somebody is meant to act on — it sits last because
 * it is where the reading ends and the work starts.
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
  const t = useT()
  const dashboard = useDashboard()
  const name = useAuthStore((state) => state.profile?.name ?? '')

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <DashboardHero dashboard={dashboard} name={name} />

      {dashboard.can.accounts && (
        <Suspense fallback={<Skeleton className="h-[34rem] rounded-xl lg:h-96" />}>
          <DashboardMoney dashboard={dashboard} />
        </Suspense>
      )}

      <DashboardModules dashboard={dashboard} />

      <DashboardAttention dashboard={dashboard} />

      {/*
       * An account whose role reaches nothing at all. It should not be
       * reachable — every role in the system reads at least Gate Pass — but a
       * role added later and not yet wired into any module would land here,
       * and an honest empty state beats a page of four headings above nothing.
       */}
      {!dashboard.asked && (
        <EmptyState
          icon={LayoutDashboard}
          title={t('dashboard.noModules.title')}
          description={t('dashboard.noModules.description')}
          footnote={t('dashboard.noModules.footnote')}
        />
      )}
    </div>
  )
}
