import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/features/auth/user-display'
import { cn } from '@/lib/utils'
import { ACCEPTED_IMAGE_ATTRIBUTE, validateImageFile } from '../profile-photo'
import { useRemoveProfilePhoto, useUploadProfilePhoto } from '../use-profile'
import { AvatarActions } from './avatar-actions'
import { RemovePhotoDialog } from './remove-photo-dialog'

interface AvatarUploaderProps {
  name: string
  photoUrl: string | null
  /** Smaller presentation for inside a dialog. */
  compact?: boolean
}

interface Preview {
  file: File
  url: string
}

/**
 * The profile photo, and everything that can be done to it.
 *
 * Choosing an image only stages it: the preview replaces the avatar in place
 * so the user sees the actual result before anything is sent, and cancelling
 * costs nothing — no request is made until Save is pressed. That is the whole
 * reason this holds a preview rather than uploading on selection.
 *
 * The avatar itself is the control. It is a real button, so it is reachable by
 * keyboard and announces what it does; the camera overlay appears on hover and
 * on focus alike, because an affordance only visible to a mouse is not one.
 */
export function AvatarUploader({ name, photoUrl, compact = false }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  const upload = useUploadProfilePhoto(() => setPreview(null))
  const remove = useRemoveProfilePhoto()

  // An object URL is a live handle into memory; releasing it on replacement and
  // on unmount is what keeps repeated previews from leaking.
  useEffect(() => {
    if (!preview) {
      return
    }
    return () => URL.revokeObjectURL(preview.url)
  }, [preview])

  const busy = upload.isUploading || remove.isPending

  const selectFile = (file: File | undefined) => {
    if (!file) {
      return
    }

    const problem = validateImageFile(file)
    if (problem) {
      toast.error('That image cannot be used', { description: problem })
      return
    }

    setPreview({ file, url: URL.createObjectURL(file) })
  }

  const displayedUrl = preview?.url ?? photoUrl
  const size = compact ? 'size-16' : 'size-24 sm:size-28'
  const progress = upload.progress ?? 0

  return (
    <div className={cn('flex flex-col', compact ? 'items-start gap-3 sm:flex-row' : 'items-start')}>
      <div className="relative shrink-0">
        {/* Progress reads around the avatar rather than beside it, so the
            thing being uploaded is the thing showing its own state. */}
        {upload.isUploading ? (
          <span
            className="absolute -inset-1 rounded-full"
            style={{ background: `conic-gradient(var(--primary) ${progress}%, var(--border) 0)` }}
            aria-hidden
          />
        ) : null}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label={photoUrl ? 'Change profile photo' : 'Upload a profile photo'}
          className={cn(
            'group relative block rounded-full outline-none',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
            'disabled:cursor-not-allowed',
          )}
        >
          <Avatar className={cn(size, 'relative ring-2 ring-card')}>
            {displayedUrl ? <AvatarImage src={displayedUrl} alt="" /> : null}
            <AvatarFallback
              className={cn(
                'bg-gradient-to-br from-brand-from to-brand-to font-semibold text-primary-foreground',
                compact ? 'text-base' : 'text-2xl sm:text-3xl',
              )}
            >
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          <span
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full',
              // A scrim has to stay dark under a light icon in both themes,
              // which rules out the foreground token — it inverts. The brand
              // primary is dark enough in either theme and stays on-palette.
              'bg-primary/75 text-primary-foreground transition-opacity duration-150',
              upload.isUploading
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
            )}
            aria-hidden
          >
            {upload.isUploading ? (
              <>
                <Loader2 className={cn('animate-spin', compact ? 'size-4' : 'size-5')} />
                {!compact && <span className="text-[11px] font-semibold">{progress}%</span>}
              </>
            ) : (
              <Camera className={compact ? 'size-4' : 'size-5'} />
            )}
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_ATTRIBUTE}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            selectFile(event.target.files?.[0])
            // Reset, so choosing the same file twice still fires a change.
            event.target.value = ''
          }}
        />
      </div>

      <div className={cn(compact ? 'min-w-0 flex-1' : 'mt-3 w-full')}>
        <AvatarActions
          previewFile={preview?.file ?? null}
          hasPhoto={Boolean(photoUrl)}
          busy={busy}
          isUploading={upload.isUploading}
          isRemoving={remove.isPending}
          onPick={() => inputRef.current?.click()}
          onSave={() => preview && void upload.upload(preview.file)}
          onCancel={() => setPreview(null)}
          onRemove={() => setConfirmingRemove(true)}
        />
      </div>

      <RemovePhotoDialog
        open={confirmingRemove}
        isPending={remove.isPending}
        onOpenChange={setConfirmingRemove}
        onConfirm={() => remove.mutate(undefined, { onSuccess: () => setConfirmingRemove(false) })}
      />
    </div>
  )
}
