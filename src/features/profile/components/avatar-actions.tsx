import { Camera, Check, Loader2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IMAGE_RULES_HINT, formatBytes } from '../profile-photo'

interface AvatarActionsProps {
  /** The staged file, before anything has been sent. */
  previewFile: File | null
  hasPhoto: boolean
  busy: boolean
  isUploading: boolean
  isRemoving: boolean
  onPick: () => void
  onSave: () => void
  onCancel: () => void
  onRemove: () => void
}

/**
 * The controls beneath the avatar. Split out from the uploader so each half
 * stays readable: this one is presentation only and holds no state, while the
 * uploader owns the file, the preview and the requests.
 *
 * There are two modes and never a mix of them. With a file staged the only
 * choices are Save and Cancel, because offering "Remove" against an image that
 * has not been uploaded yet would mean two different things at once.
 */
export function AvatarActions({
  previewFile,
  hasPhoto,
  busy,
  isUploading,
  isRemoving,
  onPick,
  onSave,
  onCancel,
  onRemove,
}: AvatarActionsProps) {
  if (previewFile) {
    return (
      <div className="space-y-2">
        <p className="text-[11.5px] leading-snug text-muted-foreground">
          <span className="font-medium text-foreground">Preview.</span> Not saved yet —{' '}
          {formatBytes(previewFile.size)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy} onClick={onSave}>
            {isUploading ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : (
              <Check data-icon="inline-start" aria-hidden />
            )}
            {isUploading ? 'Saving…' : 'Save photo'}
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={onCancel}>
            <X data-icon="inline-start" aria-hidden />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={busy} onClick={onPick}>
          <Camera data-icon="inline-start" aria-hidden />
          {hasPhoto ? 'Change photo' : 'Upload photo'}
        </Button>

        {hasPhoto ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            {isRemoving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : (
              <Trash2 data-icon="inline-start" aria-hidden />
            )}
            Remove
          </Button>
        ) : null}
      </div>

      <p className="text-[11.5px] leading-snug text-muted-foreground">{IMAGE_RULES_HINT}</p>
    </div>
  )
}
