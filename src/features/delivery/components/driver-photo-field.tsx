import { useEffect, useMemo, useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ALLOWED_PHOTO_EXTENSIONS, isAllowedPhoto } from '@/features/vendor/lib/photo-rules'
import { useT } from '@/lib/i18n'

interface DriverPhotoFieldProps {
  file: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
}

/**
 * An optional portrait for a driver added from a trip.
 *
 * Held in the browser until the driver exists — the photo's storage key
 * contains the driver's id, so it is uploaded straight after the record is
 * made, the same two-step the fleet tab takes. The same rules as every photo
 * here: JPG, PNG or WEBP under 5 MB, checked before a slow upload rather than
 * after one.
 */
export function DriverPhotoField({ file, onChange, disabled }: DriverPhotoFieldProps) {
  const t = useT()

  const fileInput = useRef<HTMLInputElement>(null)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  return (
    <fieldset className="space-y-3">
      <legend className="w-full border-b pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {t('delivery.driver.photo')}
      </legend>

      <div className="flex items-center gap-3 pt-1">
        <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-border">
          {preview ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <Camera className="size-5 text-muted-foreground" aria-hidden />
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => fileInput.current?.click()}
            >
              {file ? t('delivery.driver.chooseAnotherPhoto') : t('delivery.driver.choosePhoto')}
            </Button>
            {file && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => onChange(null)}
              >
                <X data-icon="inline-start" aria-hidden />
                {t('common.actions.remove')}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Optional. {ALLOWED_PHOTO_EXTENSIONS}, up to 5 MB.
          </p>
        </div>

        <input
          ref={fileInput}
          type="file"
          aria-label={t('delivery.driver.photoAria')}
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            const chosen = event.target.files?.[0] ?? null
            event.target.value = ''
            if (chosen && isAllowedPhoto(chosen)) {
              onChange(chosen)
            }
          }}
        />
      </div>
    </fieldset>
  )
}
