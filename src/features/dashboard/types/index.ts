import type { UseQueryResult } from '@tanstack/react-query'
import type { AccountsOverview } from '@/features/accounts/types'
import type { UserStats } from '@/features/administration/types'
import type { ChallanStats } from '@/features/challan/types'
import type { TripStats } from '@/features/delivery/types'
import type { GatePassStats } from '@/features/gate-pass/types'
import type { VendorStats } from '@/features/vendor/types'
import type { ApiError } from '@/lib/axios'
import type { UserRole } from '@/lib/roles'
import type { AttentionRow } from '../lib/attention'

/**
 * What the dashboard module can reach, per the viewer's role.
 *
 * Presentation only, exactly as `visibleNavSections` is: every one of these is
 * a mirror of a module's own `canRead*`, and the API is what actually refuses.
 * Kept as a flat object rather than recomputed in each component, so a panel
 * can never come to disagree with the hook about whether its data was even
 * asked for.
 */
export interface DashboardAccess {
  gatePass: boolean
  challan: boolean
  delivery: boolean
  vendor: boolean
  accounts: boolean
  administration: boolean
}

/**
 * The whole page's data, as `useDashboard` assembles it.
 *
 * The queries are handed on **whole** rather than unwrapped into their data,
 * because each panel degrades on its own: a failed accounts overview must not
 * blank the operating figures beside it, and a panel that can retry needs the
 * query to retry with.
 */
export interface DashboardData {
  role: UserRole | null
  can: DashboardAccess
  gatePass: UseQueryResult<GatePassStats, ApiError>
  challan: UseQueryResult<ChallanStats, ApiError>
  delivery: UseQueryResult<TripStats, ApiError>
  vendor: UseQueryResult<VendorStats, ApiError>
  accounts: UseQueryResult<AccountsOverview, ApiError>
  users: UseQueryResult<UserStats, ApiError>
  attention: AttentionRow[]
  isPending: boolean
  /** Whether the viewer's role reaches any module at all. */
  asked: boolean
  hasError: boolean
  refetchFailed: () => void
}
