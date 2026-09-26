import { useMemo, useState } from 'react'
import { ArrowRight, Building2, ShieldAlert } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useVendorOptions } from '@/features/vendor/hooks/use-vendors'
import { useT } from '@/lib/i18n'
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
  onConfirm: (role: UserRole, vendorId: string | null) => void
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
  const t = useT()
  const [selected, setSelected] = useState<UserRole | null>(null)
  const [vendorId, setVendorId] = useState<string>('')

  // Clear the staged role whenever the dialog opens, or opens for a different
  // user, so a choice made for one account can never carry to the next.
  // Adjusted during render rather than in an effect — the same pattern as
  // app-layout.tsx — which avoids the extra render pass an effect would cost.
  const [session, setSession] = useState<string | null>(null)
  const currentSession = open ? (user?.id ?? '') : null
  if (currentSession !== session) {
    setSession(currentSession)
    setSelected(null)
    // Seeded from the existing link, so relinking a vendor account to a
    // different vendor starts from where it is rather than from blank.
    setVendorId(user?.vendor?.id ?? '')
  }

  /**
   * The vendor list, fetched only once `Vendor` is actually being considered.
   * Without the guard every role change in the system would pull the whole
   * vendor collection for a selector nobody was going to see.
   */
  const needsVendor = selected === 'Vendor'
  const vendors = useVendorOptions(false, open && needsVendor)

  /**
   * How the closed trigger names the linked vendor. Base UI's `Select.Value`
   * renders the raw value unless the root is told how to label it, and the
   * value here is a Mongo id.
   */
  const vendorOptions = useMemo(
    () =>
      (vendors.data ?? []).map((vendor) => ({
        value: vendor.id,
        label: `${vendor.name} · ${vendor.vendorCode}`,
      })),
    [vendors.data],
  )

  if (!user) {
    return null
  }

  const current = roleMeta(user.role, t)
  /**
   * Relinking a Vendor account to a different vendor is a real change even
   * though the role has not moved — which is why "already this role" is not the
   * only thing that counts as a change here, and why the server allows it too.
   */
  const relinking = needsVendor && user.role === 'Vendor' && vendorId !== (user.vendor?.id ?? '')
  const changed = (selected !== null && selected !== user.role) || relinking
  const ready = changed && (!needsVendor || vendorId !== '')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('administration.role.title')}</DialogTitle>
          <DialogDescription>{t('administration.role.description')}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
          <p className="truncate text-[13px] font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>

        <div
          role="group"
          aria-label={t('administration.role.selectAria')}
          className="grid gap-2 sm:grid-cols-2"
        >
          {USER_ROLES.map((role) => {
            const meta = ROLE_META[role]
            const words = roleMeta(role, t)
            const Icon = meta.icon
            /**
             * A Vendor account's own role is never disabled, because pressing
             * it again is how an Admin relinks it to a *different* vendor — the
             * one role whose choice carries a second decision with it.
             */
            const isCurrent = role === user.role && role !== 'Vendor'
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
                    {words.label}
                    {isCurrent && (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {t('administration.role.current')}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                    {words.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/**
         * The vendor a Vendor account will speak for.
         *
         * Required rather than optional, and the confirm button stays disabled
         * until it is answered: a Vendor account with no vendor behind it can
         * see nothing at all, and creating one is a support call waiting to
         * happen. The link is also the *whole* of that account's authority —
         * every read in the Vendor module is scoped from it — which is why it is
         * chosen here, by an Admin, and never sent by the account itself.
         */}
        {needsVendor && (
          <div className="space-y-1.5 rounded-lg border border-primary/25 bg-primary/5 p-3">
            <Label htmlFor="role-vendor" className="flex items-center gap-1.5 text-[13px]">
              <Building2 className="size-3.5 shrink-0" aria-hidden />
              {t('administration.role.linkedVendor')}
            </Label>

            <Select
              items={vendorOptions}
              value={vendorId}
              onValueChange={(value) => setVendorId(value ?? '')}
              disabled={isPending || vendors.isPending}
            >
              <SelectTrigger id="role-vendor" className="w-full">
                <SelectValue
                  placeholder={
                    vendors.isPending
                      ? t('common.states.loading')
                      : t('administration.role.chooseVendor')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(vendors.data ?? []).map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name} · {vendor.vendorCode}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <p className="text-[11.5px] leading-snug text-muted-foreground">
              {t('administration.role.vendorScopeNote')}
            </p>

            {!vendors.isPending && (vendors.data ?? []).length === 0 && (
              <p className="text-[11.5px] leading-snug text-tone-amber">
                {t('administration.role.noVendors')}
              </p>
            )}
          </div>
        )}

        {changed && (
          <div className="space-y-2.5 rounded-lg border border-primary/25 bg-primary/5 p-3">
            {/* One interpolated sentence: the two role names sit either side of
                the verb in English and before it in Bangla, so the emphasis
                spans that used to wrap them could not survive the move. The
                badges under it carry the same change visually. */}
            <p className="text-[13px] leading-snug">
              {t('administration.role.summary', {
                from: current.label,
                to: roleMeta(selected ?? user.role, t).label,
              })}
            </p>
            <div className="flex items-center gap-2">
              <UserRoleBadge role={user.role} />
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <UserRoleBadge role={selected ?? user.role} />
            </div>
            {selected === ADMIN_ROLE && (
              <p className="flex items-start gap-1.5 text-[11.5px] leading-snug text-tone-amber">
                <ShieldAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                {t('administration.role.adminWarning')}
              </p>
            )}
            {user.role === 'Vendor' && selected !== null && selected !== 'Vendor' && (
              <p className="flex items-start gap-1.5 text-[11.5px] leading-snug text-tone-amber">
                <ShieldAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                {t('administration.role.vendorUnlinkWarning', {
                  vendor: user.vendor?.name ?? t('administration.role.theirVendor'),
                })}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            disabled={!ready || isPending}
            onClick={() =>
              onConfirm(selected ?? user.role, needsVendor ? vendorId : null)
            }
          >
            {isPending ? t('common.states.saving') : t('administration.role.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
