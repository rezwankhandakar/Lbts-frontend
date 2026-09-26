import { Link } from 'react-router-dom'
import { useT } from '@/lib/i18n'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { SignInForm } from '@/features/auth/components/sign-in-form'

export function SignInPage() {
  const t = useT()

  return (
    <AuthLayout
      title={t('auth.pages.signInTitle')}
      subtitle={t('auth.pages.signInSubtitle')}
      footer={
        <span className="text-muted-foreground">
          {t('auth.pages.noAccount')}{' '}
          <Link to="/sign-up" className="font-medium text-foreground hover:underline">
            {t('auth.pages.createOne')}
          </Link>
        </span>
      }
    >
      <SignInForm />
    </AuthLayout>
  )
}
