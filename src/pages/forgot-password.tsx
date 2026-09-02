import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to set a new password."
      footer={
        <Link
          to="/sign-in"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
