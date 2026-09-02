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
      toast.success('Password changed', {
        description: 'Use your new password the next time you sign in.',
      })
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Your password could not be changed.'
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
            Change password
          </DialogTitle>
          <DialogDescription>
            Confirm your current password, then choose a new one. You stay signed in on this device.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <AuthError message={errors.root?.message} />

          <FormField
            id="current-password"
            label="Current password"
            error={errors.currentPassword?.message}
          >
            <PasswordInput
              id="current-password"
              autoComplete="current-password"
              placeholder="Your current password"
              disabled={busy}
              aria-invalid={Boolean(errors.currentPassword)}
              {...register('currentPassword')}
            />
          </FormField>

          <div className="space-y-2">
            <FormField id="new-password" label="New password" error={errors.newPassword?.message}>
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                disabled={busy}
                aria-invalid={Boolean(errors.newPassword)}
                {...register('newPassword')}
              />
            </FormField>
            <PasswordStrength value={newPassword ?? ''} />
          </div>

          <FormField
            id="confirm-new-password"
            label="Confirm new password"
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirm-new-password"
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              disabled={busy}
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
          </FormField>

          <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-snug text-muted-foreground">
            <ShieldCheck className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>
              Passwords are held by the authentication provider. LBTS never stores or receives them.
            </span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {busy ? 'Updating…' : 'Update password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
