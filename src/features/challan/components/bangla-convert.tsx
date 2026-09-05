import { useState } from 'react'
import { Check, Languages, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { canOfferConversion, forceBanglaConversion, isLikelyLegacyBangla } from '../lib/bangla-text'

interface BanglaConvertControlProps {
  value: string
  onApply: (converted: string) => void
  /** Names the field in the preview, so a screen reader knows which one. */
  label: string
  disabled?: boolean
}

/**
 * Converting a pasted value from legacy Bijoy to Unicode, with the operator's
 * eyes on it.
 *
 * The rule this implements is the one the business was firm about: no silent
 * destructive conversion. Pressing the button does not change the field — it
 * opens a preview of what the value *would* become, and the field only changes
 * when the operator accepts it. If the conversion came out wrong they close
 * the preview and nothing has happened, and they can still type over it by
 * hand.
 *
 * Two ways in, because there are two situations. Text that is confidently
 * legacy — the `‡`, `¯`, `©` characters no English string contains — announces
 * itself, because it looks like gibberish on screen and an operator who does
 * not know what Bijoy is would otherwise retype the whole address. Everything
 * else keeps the control available but quiet, for the case detection cannot
 * solve: legacy Bijoy written entirely in plain ASCII, where `XvKv` and an
 * English word are indistinguishable to any algorithm and only a person can
 * tell.
 *
 * Nothing here runs on its own. The server normalises confidently-legacy text
 * on the way into storage as a backstop, but the value an operator sees and
 * accepts is the value that is filed.
 */
export function BanglaConvertControl({
  value,
  onApply,
  label,
  disabled,
}: BanglaConvertControlProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const offer = canOfferConversion(value)
  const looksLegacy = isLikelyLegacyBangla(value)

  if (!offer) {
    return null
  }

  const open = () => setPreview(forceBanglaConversion(value))
  const close = () => setPreview(null)

  return (
    <div className="mt-1.5">
      {preview === null ? (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={disabled}
          onClick={open}
          className={cn(
            'gap-1.5 px-1.5',
            looksLegacy
              ? 'text-tone-amber hover:bg-tone-amber/10 hover:text-tone-amber'
              : 'text-muted-foreground',
          )}
        >
          <Languages data-icon="inline-start" aria-hidden />
          {looksLegacy ? 'This looks like Bijoy text — convert' : 'Convert to Unicode'}
        </Button>
      ) : (
        <div
          className="rounded-lg border border-tone-amber/30 bg-tone-amber/5 p-2.5"
          role="group"
          aria-label={`Unicode preview for ${label}`}
        >
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Unicode preview
          </p>

          <p className="mt-1.5 truncate text-xs text-muted-foreground line-through" title={value}>
            {value}
          </p>
          <p className="mt-0.5 text-sm leading-snug font-medium break-words" title={preview}>
            {preview}
          </p>

          <div className="mt-2.5 flex items-center gap-1.5">
            <Button
              type="button"
              size="xs"
              onClick={() => {
                onApply(preview)
                close()
              }}
            >
              <Check data-icon="inline-start" aria-hidden />
              Use this
            </Button>
            <Button type="button" variant="ghost" size="xs" onClick={close}>
              <X data-icon="inline-start" aria-hidden />
              Keep what I typed
            </Button>
          </div>

          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            If the preview is wrong, keep what you typed and correct it by hand.
          </p>
        </div>
      )}
    </div>
  )
}
