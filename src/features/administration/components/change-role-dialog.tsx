import { useState } from 'react'
import { ArrowRight, ShieldAlert } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ADMIN_ROLE, ROLE_META, USER_ROLES, roleMeta } from '@/lib/roles'
import type { UserRole } from '@/lib/roles'
import { cn } from '@/lib/utils'
import type { AdminUser } from '../types'
import { UserRoleBadge } from '@/components/shared/user-role-badge'

interface ChangeRoleDialogProps {
  user: AdminUser | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (role: UserRole) => void
}

/**
 * The role set is fixed, so this is a choice between five known options — not
 * a free-text field. Picking one only stages it; the summary line below spells
 * out the change and the operator still has to confirm, so no role ever moves
 * on a single stray click.
 */
export function ChangeRoleDialog({
  user,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: ChangeRoleDialogProps) {
  const [selected, setSelected] = useState<UserRole | null>(null)

  // Clear the staged role whenever the dialog opens, or opens for a different
  // user, so a choice made for one account can never carry to the next.
  // Adjusted during render rather than in an effect — the same pattern as
  // app-layout.tsx — which avoids the extra render pass an effect would cost.
  const [session, setSession] = useState<string | null>(null)
  const currentSession = open ? (user?.id ?? '') : null
  if (currentSession !== session) {
    setSession(currentSession)
    setSelected(null)
  }

  if (!user) {
    return null
  }

  const current = roleMeta(user.role)
  const changed = selected !== null && selected !== user.role

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            A role decides who someone is to the business. What each role may do inside a module is
            configured by that module.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
          <p className="truncate text-[13px] font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>

        <div role="group" aria-label="Select a role" className="grid gap-2 sm:grid-cols-2">
          {USER_ROLES.map((role) => {
            const meta = ROLE_META[role]
            const Icon = meta.icon
            const isCurrent = role === user.role
            const isSelected = role === selected

            return (
              <button
                key={role}
                type="button"
                aria-pressed={isSelected}
                disabled={isCurrent || isPending}
                onClick={() => setSelected(role)}
                className={cn(
                  'flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all duration-150 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected
                    ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/25'
                    : 'hover:border-primary/35 hover:bg-primary/[0.03]',
                  isCurrent &&
                    'cursor-not-allowed opacity-55 hover:border-border hover:bg-transparent',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-lg ring-1',
                    meta.chip,
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                    {meta.label}
                    {isCurrent && (
                      <span className="text-[10px] font-medium text-muted-foreground">current</span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                    {meta.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {changed && (
          <div className="space-y-2.5 rounded-lg border border-primary/25 bg-primary/[0.05] p-3">
            <p className="text-[13px] leading-snug">
              You're changing this user's role from{' '}
              <span className="font-semibold">{current.label}</span> to{' '}
              <span className="font-semibold">{ROLE_META[selected].label}</span>.
            </p>
            <div className="flex items-center gap-2">
              <UserRoleBadge role={user.role} />
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <UserRoleBadge role={selected} />
            </div>
            {selected === ADMIN_ROLE && (
              <p className="flex items-start gap-1.5 text-[11.5px] leading-snug text-tone-amber">
                <ShieldAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                Admin grants full access to Administration, including the ability to change every
                other account.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!changed || isPending} onClick={() => selected && onConfirm(selected)}>
            {isPending ? 'Saving…' : 'Confirm change'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
