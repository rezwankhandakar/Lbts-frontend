import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'

export function NotFoundPage() {
  const t = useT()

  return (
    <div className="mx-auto w-full max-w-5xl">
      <EmptyState
        icon={Compass}
        badge="404"
        title={t('errors.notFoundPageTitle')}
        description={t('errors.notFoundPageBody')}
        action={
          <Button render={<Link to="/" />} className="font-medium shadow-sm">
            {t('common.actions.goToDashboard')}
          </Button>
        }
      />
    </div>
  )
}
