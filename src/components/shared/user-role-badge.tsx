import { roleMeta } from '@/lib/roles'
import { cn } from '@/lib/utils'

interface UserRoleBadgeProps {
  role: string
  className?: string
}

/**
 * Icon plus label, never colour alone: the hue makes the table scannable, the
 * icon and the word carry the meaning for anyone who cannot use it.
 */
export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const meta = roleMeta(role)
  const Icon = meta.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        meta.badge,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {meta.label}
    </span>
  )
}
