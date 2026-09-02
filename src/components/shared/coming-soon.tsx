import type { LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'

interface ComingSoonProps {
  title: string
  description: string
  icon: LucideIcon
}

/** Standard presentation for a module that has not been built yet. */
export function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        badge="Coming soon"
        title={`${title} is not available yet`}
        description="This module has been reserved in the navigation, but none of its screens have been built."
        footnote="This module is under development"
      />
    </div>
  )
}
