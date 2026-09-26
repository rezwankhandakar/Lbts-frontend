import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useT } from '@/lib/i18n'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export function ForgotPasswordPage() {
  const t = useT()

  return (
    <AuthLayout
      title={t('auth.pages.forgotTitle')}
      subtitle={t('auth.pages.forgotSubtitle')}
      footer={
        <Link
          to="/sign-in"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          {t('auth.pages.backToSignIn')}
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
