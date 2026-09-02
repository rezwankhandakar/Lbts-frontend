import { Link } from 'react-router-dom'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { SignUpForm } from '@/features/auth/components/sign-up-form'

export function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get started with LBTS in less than a minute."
      footer={
        <span className="text-muted-foreground">
          Already have an account?{' '}
          <Link to="/sign-in" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <SignUpForm />
    </AuthLayout>
  )
}
