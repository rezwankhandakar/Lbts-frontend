import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Loader2 } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpSchema } from '../auth-schemas'
import type { SignUpValues } from '../auth-schemas'
import { isDismissedPopup, toAuthMessage } from '../firebase-errors'
import { useAuthActions } from '../use-auth'
import { AuthDivider } from './auth-divider'
import { AuthError } from './auth-error'
import { FormField } from './form-field'
import { GoogleButton } from './google-button'
import { PasswordInput } from './password-input'
import { PasswordStrength } from './password-strength'

export function SignUpForm() {
  const navigate = useNavigate()
  const { signUpWithEmail, signInWithGoogle } = useAuthActions()
  const [googleBusy, setGoogleBusy] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as unknown as true,
    },
  })

  const password = useWatch({ control, name: 'password' })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUpWithEmail(values.name, values.email, values.password)
      toast.success('Account created. Welcome to LBTS!')
      navigate('/', { replace: true })
    } catch (error) {
      const message = toAuthMessage(error)
      setError('root', { message })
      toast.error(message)
    }
  })

  const onGoogle = async () => {
    setGoogleBusy(true)
    try {
      await signInWithGoogle()
      toast.success('Account ready. Welcome to LBTS!')
      navigate('/', { replace: true })
    } catch (error) {
      if (!isDismissedPopup(error)) {
        toast.error(toAuthMessage(error))
      }
    } finally {
      setGoogleBusy(false)
    }
  }

  const busy = isSubmitting || googleBusy

  return (
    <div className="space-y-5">
      <GoogleButton onClick={onGoogle} disabled={busy} label="Sign up with Google" />
      <AuthDivider label="or sign up with email" />

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <AuthError message={errors.root?.message} />

        <FormField id="name" label="Full name" error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Your full name"
            className="h-10"
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </FormField>

        <FormField id="email" label="Work email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="h-10"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <div className="space-y-2">
          <FormField id="password" label="Password" error={errors.password?.message}>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
          </FormField>
          <PasswordStrength value={password ?? ''} />
        </div>

        <FormField
          id="confirmPassword"
          label="Confirm password"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
        </FormField>

        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-start gap-2.5">
            <Controller
              control={control}
              name="acceptTerms"
              render={({ field }) => (
                <Checkbox
                  id="acceptTerms"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                  className="mt-0.5"
                  aria-invalid={Boolean(errors.acceptTerms)}
                />
              )}
            />
            <Label
              htmlFor="acceptTerms"
              className="text-[13px] leading-snug font-normal text-muted-foreground"
            >
              I agree to the <span className="font-medium text-foreground">Terms of Service</span>{' '}
              and <span className="font-medium text-foreground">Privacy Policy</span>
            </Label>
          </div>
          {errors.acceptTerms?.message && (
            <p role="alert" className="text-xs text-destructive">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-10 w-full font-medium shadow-sm transition-all active:translate-y-px"
          disabled={busy}
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>

        <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-snug text-muted-foreground">
          <Info className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            New accounts are created with the{' '}
            <span className="font-medium text-foreground">User</span> role. An administrator can
            change this later.
          </span>
        </div>
      </form>
    </div>
  )
}
