import { Link } from 'react-router-dom'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { SignInForm } from '@/features/auth/components/sign-in-form'

export function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your LBTS account to continue."
      footer={
        <span className="text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/sign-up" className="font-medium text-foreground hover:underline">
            Create one
          </Link>
        </span>
      }
    >
      <SignInForm />
    </AuthLayout>
  )
}
