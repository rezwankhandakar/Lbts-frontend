import { statusMeta } from '@/lib/roles'
import { cn } from '@/lib/utils'

interface UserStatusBadgeProps {
  status: string
  className?: string
}

/**
 * A filled indicator dot beside the word, rather than a coloured word alone —
 * status must survive both a monochrome screen and a colour-blind reader.
 */
export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const meta = statusMeta(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        meta.badge,
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}
