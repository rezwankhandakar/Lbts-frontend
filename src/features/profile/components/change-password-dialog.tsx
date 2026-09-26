import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AuthError } from '@/features/auth/components/auth-error'
import { FormField } from '@/features/auth/components/form-field'
import { PasswordInput } from '@/features/auth/components/password-input'
import { PasswordStrength } from '@/features/auth/components/password-strength'
import { changePasswordSchema } from '../profile-schemas'
import type { ChangePasswordValues } from '../profile-schemas'
import { useT } from '@/lib/i18n'
import { useChangePassword } from '../use-change-password'

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Changing the password is a Firebase operation from start to finish. Nothing
 * typed here is sent to the LBTS API, and nothing is kept after the dialog
 * closes — the form is reset on every open precisely so a password cannot sit
 * in a field on a shared machine.
 *
 * The current password is not a formality: Firebase reauthenticates with it
 * before it will accept a new one, which is what stops an unattended session
 * from being taken over.
 */
export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const t = useT()
  const { changePassword, isPending } = useChangePassword()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  useEffect(() => {
    reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }, [open, reset])

  const newPassword = useWatch({ control, name: 'newPassword' })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePassword(values.currentPassword, values.newPassword)
      toast.success(t('profile.changePassword.changed'), {
        description: t('profile.changePassword.changedNote'),
      })
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('profile.changePassword.failed')
      setError('root', { message })
      toast.error(message)
    }
  })

  const busy = isSubmitting || isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) {
          onOpenChange(next)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-tone-emerald" aria-hidden />
            {t('profile.changePasswordTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('profile.changePasswordHint')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <AuthError message={errors.root?.message} />

          <FormField
            id="current-password"
            label={t('profile.changePassword.currentLabel')}
            error={errors.currentPassword?.message}
          >
            <PasswordInput
              id="current-password"
              autoComplete="current-password"
              placeholder={t('profile.changePassword.currentPlaceholder')}
              disabled={busy}
              aria-invalid={Boolean(errors.currentPassword)}
              {...register('currentPassword')}
            />
          </FormField>

          <div className="space-y-2">
            <FormField
              id="new-password"
              label={t('profile.changePassword.newLabel')}
              error={errors.newPassword?.message}
            >
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                placeholder={t('profile.changePassword.newPlaceholder')}
                disabled={busy}
                aria-invalid={Boolean(errors.newPassword)}
                {...register('newPassword')}
              />
            </FormField>
            <PasswordStrength value={newPassword ?? ''} />
          </div>

          <FormField
            id="confirm-new-password"
            label={t('profile.changePassword.confirmLabel')}
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirm-new-password"
              autoComplete="new-password"
              placeholder={t('profile.changePassword.confirmPlaceholder')}
              disabled={busy}
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
          </FormField>

          <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-snug text-muted-foreground">
            <ShieldCheck className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>
              {t('profile.passwordsNotStored')}
            </span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {busy ? t('profile.changePassword.updating') : t('profile.changePassword.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
