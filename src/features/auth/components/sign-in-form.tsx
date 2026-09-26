import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { signInSchema } from '../auth-schemas'
import type { SignInValues } from '../auth-schemas'
import { isDismissedPopup, toAuthMessage } from '../firebase-errors'
import { useAuthActions } from '../use-auth'
import { AuthDivider } from './auth-divider'
import { AuthError } from './auth-error'
import { FormField } from './form-field'
import { GoogleButton } from './google-button'
import { PasswordInput } from './password-input'

interface LocationState {
  from?: string
}

export function SignInForm() {
  const t = useT()
  const navigate = useNavigate()
  const location = useLocation()
  const { signInWithEmail, signInWithGoogle } = useAuthActions()
  const [googleBusy, setGoogleBusy] = useState(false)

  const redirectTo = (location.state as LocationState | null)?.from ?? '/'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signInWithEmail(values.email, values.password)
      toast.success(t('auth.signIn.welcomeBack'))
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message = toAuthMessage(error)
      setError('root', { message })
      toast.error(t(message as TranslationKey))
    }
  })

  const onGoogle = async () => {
    setGoogleBusy(true)
    try {
      await signInWithGoogle()
      toast.success(t('auth.signIn.welcomeBack'))
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (!isDismissedPopup(error)) {
        toast.error(t(toAuthMessage(error) as TranslationKey))
      }
    } finally {
      setGoogleBusy(false)
    }
  }

  const busy = isSubmitting || googleBusy

  return (
    <div className="space-y-5">
      <GoogleButton onClick={onGoogle} disabled={busy} label={t('auth.signIn.googleButton')} />
      <AuthDivider label={t('auth.signIn.divider')} />

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <AuthError message={errors.root?.message} />

        <FormField id="email" label={t('auth.signIn.emailLabel')} error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('auth.signIn.emailPlaceholder')}
            className="h-10"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <FormField
          id="password"
          label={t('auth.signIn.passwordLabel')}
          error={errors.password?.message}
          action={
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t('auth.signIn.forgotPassword')}
            </Link>
          }
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder={t('auth.signIn.passwordPlaceholder')}
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>

        <Button
          type="submit"
          className="h-10 w-full font-medium shadow-sm transition-all active:translate-y-px"
          disabled={busy}
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {isSubmitting ? t('auth.signIn.submitting') : t('auth.signIn.submit')}
        </Button>
      </form>
    </div>
  )
}
