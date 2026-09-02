import { AlertCircle } from 'lucide-react'

interface AuthErrorProps {
  message?: string
}

export function AuthError({ message }: AuthErrorProps) {
  if (!message) {
    return null
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-[13px] leading-snug text-destructive"
    >
      <AlertCircle className="mt-px size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  )
}
