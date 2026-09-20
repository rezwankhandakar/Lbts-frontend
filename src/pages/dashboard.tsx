import { lazy } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { AccountsSummaryCard } from '@/features/accounts/components/accounts-summary-card'
import { canReadAccounts } from '@/features/accounts/types'
import { ChallanSummaryCard } from '@/features/challan/components/challan-summary-card'
import { canReadChallans } from '@/features/challan/types'
import { DeliverySummaryCard } from '@/features/delivery/components/delivery-summary-card'
import { canReadDeliveries } from '@/features/delivery/types'
import { GatePassSummaryCard } from '@/features/gate-pass/components/gate-pass-summary-card'
import { canReadGatePasses } from '@/features/gate-pass/types'
import { isVendorScopedRole } from '@/features/vendor/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * The one lazy import on an otherwise eager page, and it earns it.
 *
 * The dashboard is the app's only eager route, so anything reached from it
 * straight is downloaded by every account on first load. This branch is for one
 * role and pulls a chart, a detail sheet and the vendor trip vocabulary behind
 * it — none of which an Admin, a Manager, a CEO or an OpEx will ever render. It
 * resolves through the single `<Suspense>` inside `<main>`, so the sidebar and
 * header stay mounted while the chunk arrives.
 */
const VendorDashboard = lazy(() =>
  import('@/features/vendor/components/vendor-dashboard').then((m) => ({
    default: m.VendorDashboard,
  })),
)

/**
 * The overview across every module.
 *
 * Each module contributes its own summary once it exists, and contributes
 * nothing to a viewer whose role cannot reach it. Until more than a couple
 * have something to say, the rest of the page stays an honest empty state
 * rather than a wall of invented figures.
 *
 * **A Vendor account gets a different page entirely, and that is the honest
 * shape rather than a special case.** Every module that contributes a card here
 * is closed to a vendor — each one carries a customer's address and phone
 * number — so the cards would all be absent and the empty state would be the
 * whole of it. What a vendor has instead is their own trips, and those are a
 * page rather than a card among none.
 */
export function DashboardPage() {
  const role = useCurrentRole()

  if (isVendorScopedRole(role)) {
    return <VendorDashboard />
  }

  const hasGatePass = canReadGatePasses(role)
  const hasChallan = canReadChallans(role)
  const hasDelivery = canReadDeliveries(role)
  const hasAccounts = canReadAccounts(role)
  const hasAny = hasGatePass || hasChallan || hasDelivery || hasAccounts

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Dashboard"
        description="Your operational overview — a single view across every LBTS module."
      />

      {hasAny && (
        <div className="mb-6 space-y-4">
          {hasGatePass && <GatePassSummaryCard />}
          {hasChallan && <ChallanSummaryCard />}
          {hasDelivery && <DeliverySummaryCard />}
          {hasAccounts && <AccountsSummaryCard />}
        </div>
      )}

      <EmptyState
        icon={LayoutDashboard}
        badge="In preparation"
        title={hasAny ? 'More modules are on the way' : 'Dashboard is getting ready'}
        description="As each module is built, this space summarises what needs your attention across the platform."
        footnote={
          hasAny ? 'Gate Pass, Challan, Delivery and Accounts are the modules reporting here' : undefined
        }
      />
    </div>
  )
}
