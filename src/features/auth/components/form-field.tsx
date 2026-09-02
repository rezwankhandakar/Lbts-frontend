import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  children: ReactNode
  /** Trailing control on the label row, e.g. a "Forgot password?" link. */
  action?: ReactNode
  hint?: string
}

export function FormField({ id, label, error, children, action, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-[13px] font-medium">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs leading-snug text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
