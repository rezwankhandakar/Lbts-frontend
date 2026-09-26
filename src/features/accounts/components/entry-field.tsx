import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface EntryFieldProps {
  id: string
  label: string
  optional?: boolean
  error?: string
  hint?: ReactNode
  className?: string
  children: ReactNode
}

/**
 * A labelled control with its error or hint beneath. No placeholders anywhere
 * in this form — what a field wants is said in its label, as CLAUDE.md asks of
 * every entry form.
 */
export function EntryField({ id, label, optional, error, hint, className, children }: EntryFieldProps) {
  const t = useT()

  return (
    <div className={cn('grid content-start gap-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {optional && (
          <span className="font-normal text-muted-foreground">
            {' '}
            {t('common.labels.optionalSuffix')}
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{t(error as TranslationKey)}</p>
      ) : (
        hint && <div className="text-xs text-muted-foreground">{hint}</div>
      )}
    </div>
  )
}

/** A value the caller fixed, drawn as a read-only summary instead of a control. */
export function LockedValue({ label, value, detail }: { label: string; value: ReactNode; detail?: ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
      {detail && <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>}
    </div>
  )
}
