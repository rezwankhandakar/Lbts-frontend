import { LayoutDashboard } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { GatePassSummaryCard } from '@/features/gate-pass/components/gate-pass-summary-card'
import { canReadGatePasses } from '@/features/gate-pass/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * The overview across every module.
 *
 * Each module contributes its own summary once it exists, and contributes
 * nothing to a viewer whose role cannot reach it. Until more than one has
 * something to say, the rest of the page stays an honest empty state rather
 * than a wall of invented figures.
 */
export function DashboardPage() {
  const role = useCurrentRole()
  const hasGatePass = canReadGatePasses(role)

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Dashboard"
        description="Your operational overview — a single view across every LBTS module."
      />

      {hasGatePass && (
        <div className="mb-6">
          <GatePassSummaryCard />
        </div>
      )}

      <EmptyState
        icon={LayoutDashboard}
        badge="In preparation"
        title={hasGatePass ? 'More modules are on the way' : 'Dashboard is getting ready'}
        description="As each module is built, this space summarises what needs your attention across the platform."
        footnote={hasGatePass ? 'Gate Pass is the first module reporting here' : undefined}
      />
    </div>
  )
}
