import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homePathFor } from '@/app/nav-config'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useT } from '@/lib/i18n'

export function NotFoundPage() {
  const t = useT()
  const home = homePathFor(useCurrentRole())

  return (
    <div className="mx-auto w-full max-w-5xl">
      <EmptyState
        icon={Compass}
        badge="404"
        title={t('errors.notFoundPageTitle')}
        description={t('errors.notFoundPageBody')}
        action={
          <Button render={<Link to={home} />} className="font-medium shadow-sm">
            {home === '/' ? t('common.actions.goToDashboard') : t('common.actions.goToMyVendor')}
          </Button>
        }
      />
    </div>
  )
}
