import { useAdminUserStats } from '@/features/administration/use-administration'
import { useAccountsOverview } from '@/features/accounts/hooks/use-accounts'
import { todayString } from '@/features/accounts/lib/accounts-meta'
import { canReadAccounts } from '@/features/accounts/types'
import { useChallanStats } from '@/features/challan/hooks/use-challans'
import { canReadChallans } from '@/features/challan/types'
import { useTripStats } from '@/features/delivery/hooks/use-deliveries'
import { canReadDeliveries } from '@/features/delivery/types'
import { useGatePassStats } from '@/features/gate-pass/hooks/use-gate-passes'
import { canReadGatePasses } from '@/features/gate-pass/types'
import { canReadVendors } from '@/features/vendor/types'
import { useVendorStats } from '@/features/vendor/hooks/use-vendors'
import { useCurrentRole } from '@/hooks/use-current-role'
import { ADMIN_ROLE } from '@/lib/roles'
import { attentionRows } from '../lib/attention'
import type { AttentionRow } from '../lib/attention'
import type { DashboardData } from '../types'

/**
 * Everything the staff dashboard reads, in one hook.
 *
 * **Each module answers for itself, from the aggregation its own page already
 * uses.** There is deliberately no `/dashboard` endpoint stitching them
 * together: a second aggregation over the same collections is a second place
 * for "how many gate passes are awaiting a check" to be worked out, and the
 * two would eventually disagree — which on an overview is the worst possible
 * failure, because nothing on the page says which one is lying. The vendor
 * dashboard takes the opposite shape for a reason that does not apply here:
 * it is one vendor's scoped figures, none of which any other page computes.
 *
 * **The calls go out together, not one after another.** That is the whole
 * cold-start answer. Render spins the instance down after fifteen minutes and
 * the next request pays most of a minute waking it up; six requests issued in
 * parallel share that one wake-up, where six issued in sequence would stack
 * six of them. Every one of them is a cheap indexed aggregation once the
 * instance is up, and TanStack Query caches them under the same keys the
 * module pages use — so arriving at Gate Pass from here finds its stats
 * already warm rather than fetching them again.
 *
 * **Nothing is fetched for a module the viewer cannot read.** The `enabled`
 * gate is on the hook rather than on the component, because a component that
 * calls a hook and then returns null has already made the request — which is
 * how the old summary cards asked the API for figures they were about to be
 * refused.
 */
export function useDashboard(): DashboardData {
  const role = useCurrentRole()

  const canGatePass = canReadGatePasses(role)
  const canChallan = canReadChallans(role)
  const canDelivery = canReadDeliveries(role)
  const canVendor = canReadVendors(role)
  const canAccounts = canReadAccounts(role)
  const isAdmin = role === ADMIN_ROLE

  const gatePass = useGatePassStats(canGatePass)
  const challan = useChallanStats(canChallan)
  const delivery = useTripStats(canDelivery)
  const vendor = useVendorStats(canVendor)
  /**
   * `today` is the **viewer's** calendar day, as Delivery's stats and the
   * vendor dashboard both take it: a trip date is a day, and the server's UTC
   * midnight is six hours out of step with Dhaka's.
   */
  const accounts = useAccountsOverview(todayString(), canAccounts)
  const users = useAdminUserStats(isAdmin)

  const queries = [gatePass, challan, delivery, vendor, accounts, users]
  const asked = [canGatePass, canChallan, canDelivery, canVendor, canAccounts, isAdmin]

  /**
   * The rows are built only from what actually arrived.
   *
   * A module still loading contributes nothing rather than a zero, which is
   * what stops the settled state flashing up for a second before the real
   * backlog lands on top of it — the one thing on this page that would be an
   * outright lie, however briefly.
   */
  const attention: AttentionRow[] = attentionRows({
    gatePass: gatePass.data && {
      draft: gatePass.data.draft,
      submitted: gatePass.data.submitted,
      rejected: gatePass.data.rejected,
    },
    challan: challan.data && {
      batchesProcessing: challan.data.batchesProcessing,
      locationPending: challan.data.locationPending,
      locationReview: challan.data.locationReview,
      blankAmount: challan.data.blankAmount,
      partialAmount: challan.data.partialAmount,
      returnedAtDepot: challan.data.returnedAtDepot,
    },
    delivery: delivery.data && { open: delivery.data.open },
    vendor: vendor.data && {
      expiredDocuments: vendor.data.expiredDocuments,
      expiringDocuments: vendor.data.expiringDocuments,
    },
    accounts: accounts.data && {
      vendorDue: accounts.data.vendorDue.total,
      vendorDueBlankBills: accounts.data.vendorDue.blankBills,
      receivableOutstanding: accounts.data.receivable.outstanding,
      pendingFinalBills: accounts.data.pendingFinalBills,
      advancesOutstanding: accounts.data.advances.outstanding,
    },
    users: users.data && { pending: users.data.pending },
  })

  return {
    role,
    can: {
      gatePass: canGatePass,
      challan: canChallan,
      delivery: canDelivery,
      vendor: canVendor,
      accounts: canAccounts,
      administration: isAdmin,
    },
    gatePass,
    challan,
    delivery,
    vendor,
    accounts,
    users,
    attention,
    /** True until every module the viewer may read has answered once. */
    isPending: queries.some((query, index) => asked[index] && query.isPending),
    /**
     * Whether anything was asked for at all. An empty attention list means two
     * quite different things — nothing is outstanding, or nothing was
     * readable — and only the first of them may draw a settled state.
     */
    asked: asked.some(Boolean),
    /** Every failure at once: one Retry rather than one per panel. */
    refetchFailed: () => {
      for (const [index, query] of queries.entries()) {
        if (asked[index] && query.isError) {
          void query.refetch()
        }
      }
    },
    hasError: queries.some((query, index) => asked[index] && query.isError),
  }
}
