import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  value: string
  /** Named in the button's accessible label, e.g. "user ID". */
  label: string
}

/**
 * Copies a value and says so in place rather than through a toast: an account
 * identifier is usually copied to paste into a support ticket, and a
 * notification for every copy would be noise.
 *
 * The clipboard API is unavailable over plain HTTP and can be refused by
 * permission, so a failure leaves the button unchanged rather than claiming a
 * copy that did not happen.
 */
export function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = () => {
    navigator.clipboard
      ?.writeText(value)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={cn('text-muted-foreground', copied && 'text-tone-emerald')}
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
    </Button>
  )
}
