import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { AuthError } from '@/features/auth/components/auth-error'
import { FormField } from '@/features/auth/components/form-field'
import type { UserProfile } from '@/stores/use-auth-store'
import { editProfileSchema } from '../profile-schemas'
import type { EditProfileValues } from '../profile-schemas'
import { useUpdateProfile } from '../use-profile'
import { AvatarUploader } from './avatar-uploader'

interface EditProfileDialogProps {
  profile: UserProfile
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * A dialog rather than a separate route: editing two fields is a decision made
 * while looking at the profile, and sending the user to another screen would
 * lose the context they are editing against.
 *
 * The form carries only what the account owner may change. Role, status and
 * email are not disabled inputs here — they are simply not fields, because a
 * disabled input still suggests a value that could be sent.
 */
export function EditProfileDialog({ profile, open, onOpenChange }: EditProfileDialogProps) {
  const update = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { name: profile.name, phone: profile.phone ?? '' },
  })

  /**
   * Refill from the profile every time the dialog opens, so a cancelled edit
   * is genuinely discarded rather than waiting in the field for next time.
   * `reset` also clears the dirty flag, which is what the submit button reads.
   */
  useEffect(() => {
    if (open) {
      reset({ name: profile.name, phone: profile.phone ?? '' })
    }
  }, [open, profile.name, profile.phone, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync(values)
      onOpenChange(false)
    } catch {
      // The mutation already reported this as a toast; this keeps the message
      // in front of the user beside the form they still have open.
      setError('root', {
        message: 'Your changes were not saved. Check the details and try again.',
      })
    }
  })

  const busy = isSubmitting || update.isPending

  return (
    // A save in flight must not be dismissed by a stray Escape or backdrop
    // click, or the user is left unsure whether it landed.
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) {
          onOpenChange(next)
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update how you appear across LBTS. Your role and account status are not affected.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/30 p-3">
          <AvatarUploader name={profile.name} photoUrl={profile.photoUrl} compact />
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <AuthError message={errors.root?.message} />

          <FormField id="profile-name" label="Full name" error={errors.name?.message}>
            <Input
              id="profile-name"
              autoComplete="name"
              placeholder="Your full name"
              className="h-10"
              disabled={busy}
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
          </FormField>

          <FormField
            id="profile-phone"
            label="Phone number"
            error={errors.phone?.message}
            hint="Optional. Leave empty to remove the number on file."
          >
            <Input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+880 1712 345678"
              className="h-10"
              disabled={busy}
              aria-invalid={Boolean(errors.phone)}
              {...register('phone')}
            />
          </FormField>

          <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-snug text-muted-foreground">
            <Lock className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>
              <span className="font-medium text-foreground">{profile.email}</span> is managed by the
              sign-in provider, and your role is set by an administrator. Neither can be changed
              here.
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
            <Button type="submit" disabled={busy || !isDirty}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {busy ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
