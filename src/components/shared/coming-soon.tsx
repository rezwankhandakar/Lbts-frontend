import type { LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { useT } from '@/lib/i18n'

interface ComingSoonProps {
  title: string
  description: string
  icon: LucideIcon
}

/** Standard presentation for a module that has not been built yet. */
export function ComingSoon({ title, description, icon }: ComingSoonProps) {
  const t = useT()

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        badge={t('shared.comingSoon.badge')}
        title={t('shared.comingSoon.title', { module: title })}
        description={t('shared.comingSoon.description')}
        footnote={t('shared.comingSoon.footnote')}
      />
    </div>
  )
}
