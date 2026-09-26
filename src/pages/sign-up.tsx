import { Link } from 'react-router-dom'
import { useT } from '@/lib/i18n'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { SignUpForm } from '@/features/auth/components/sign-up-form'

export function SignUpPage() {
  const t = useT()

  return (
    <AuthLayout
      title={t('auth.pages.signUpTitle')}
      subtitle={t('auth.pages.signUpSubtitle')}
      footer={
        <span className="text-muted-foreground">
          {t('auth.pages.haveAccount')}{' '}
          <Link to="/sign-in" className="font-medium text-foreground hover:underline">
            {t('auth.pages.signIn')}
          </Link>
        </span>
      }
    >
      <SignUpForm />
    </AuthLayout>
  )
}
