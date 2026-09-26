import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { forgotPasswordSchema } from '../auth-schemas'
import type { ForgotPasswordValues } from '../auth-schemas'
import { toAuthMessage } from '../firebase-errors'
import { useAuthActions } from '../use-auth'
import { FormField } from './form-field'

export function ForgotPasswordForm() {
  const t = useT()
  const { sendReset } = useAuthActions()
  const [sentTo, setSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await sendReset(values.email)
      setSentTo(values.email)
    } catch (error) {
      toast.error(t(toAuthMessage(error) as TranslationKey))
    }
  })

  if (sentTo) {
    return (
      <div className="space-y-4 rounded-xl border border-success/25 bg-success/10 p-6 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-success/15 text-success">
          <MailCheck className="size-5" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{t('auth.forgotPassword.sentTitle')}</p>
          {/* One interpolated sentence: the address sits mid-clause in English
              and elsewhere in Bangla, so the emphasis span that used to wrap it
              could not have survived the move. */}
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {t('auth.forgotPassword.sentBody', { email: sentTo })}
          </p>
        </div>
        <Button variant="outline" className="h-10 w-full" onClick={() => setSentTo(null)}>
          {t('auth.forgotPassword.useDifferent')}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField id="email" label={t('auth.forgotPassword.emailLabel')} error={errors.email?.message}>
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

      <Button
        type="submit"
        className="h-10 w-full font-medium shadow-sm transition-all active:translate-y-px"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isSubmitting ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
      </Button>
    </form>
  )
}
