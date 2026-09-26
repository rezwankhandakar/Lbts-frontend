import { AlertCircle } from 'lucide-react'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

interface AuthErrorProps {
  message?: string
}

/** Translates a key or passes a server sentence through — see `FormField`. */
export function AuthError({ message }: AuthErrorProps) {
  const t = useT()

  if (!message) {
    return null
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-[13px] leading-snug text-destructive"
    >
      <AlertCircle className="mt-px size-4 shrink-0" aria-hidden />
      <span>{t(message as TranslationKey)}</span>
    </div>
  )
}
