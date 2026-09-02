import { LayoutDashboard } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'

export function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Dashboard"
        description="Your operational overview will live here — a single view across every LBTS module."
      />
      <EmptyState
        icon={LayoutDashboard}
        badge="In preparation"
        title="Dashboard is getting ready"
        description="Once the first modules are in place, this space will summarise what needs your attention across the platform."
        footnote="Nothing to action right now"
      />
    </div>
  )
}
