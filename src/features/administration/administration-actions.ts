import { CircleCheck, CircleSlash, PauseCircle, RotateCcw, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TranslationKey } from '@/lib/i18n'
import type { UserStatus } from '@/lib/roles'

export type UserActionId = 'approve' | 'reject' | 'suspend' | 'reactivate' | 'delete'

export interface UserActionDef {
  icon: LucideIcon
  /** Target lifecycle state, or null for delete, which removes the account. */
  status: UserStatus | null
  /** Colour lives on the icon and label; the menu row itself stays neutral. */
  menuClass: string
  /** Only genuinely irreversible actions get the destructive confirm button. */
  destructive: boolean
  /** Reject and suspend accept a short reason, recorded on the account. */
  notable: boolean
  /**
   * The wording moved to the message tree; what is left here is the shape of
   * the action — what it does, what it looks like, and whether it is the sort
   * of thing that wants a reason or a red button.
   *
   * `body` and `success` used to be functions of a name and are now messages
   * carrying a `{name}` placeholder. That is the substantive change rather
   * than a mechanical one: a function pinned the name to one position in one
   * language, and Bangla does not put it there.
   */
  labelKey: TranslationKey
  confirmLabelKey: TranslationKey
  titleKey: TranslationKey
  bodyKey: TranslationKey
  successKey: TranslationKey
}

/**
 * The account lifecycle, as the UI presents it. Each entry maps to the one
 * status endpoint (or the delete endpoint); the server re-checks that the move
 * is legal, so a stale menu cannot force an illegal transition.
 */
export const USER_ACTIONS: Record<UserActionId, UserActionDef> = {
  approve: {
    icon: CircleCheck,
    status: 'Active',
    menuClass: 'text-tone-emerald focus:bg-tone-emerald/10 focus:text-tone-emerald',
    destructive: false,
    notable: false,
    labelKey: 'administration.actions.approve.label',
    confirmLabelKey: 'administration.actions.approve.confirmLabel',
    titleKey: 'administration.actions.approve.title',
    bodyKey: 'administration.actions.approve.body',
    successKey: 'administration.actions.approve.success',
  },
  reject: {
    icon: CircleSlash,
    status: 'Rejected',
    menuClass: 'text-tone-rose focus:bg-tone-rose/10 focus:text-tone-rose',
    destructive: false,
    notable: true,
    labelKey: 'administration.actions.reject.label',
    confirmLabelKey: 'administration.actions.reject.confirmLabel',
    titleKey: 'administration.actions.reject.title',
    bodyKey: 'administration.actions.reject.body',
    successKey: 'administration.actions.reject.success',
  },
  suspend: {
    icon: PauseCircle,
    status: 'Suspended',
    menuClass: 'text-tone-orange focus:bg-tone-orange/10 focus:text-tone-orange',
    destructive: false,
    notable: true,
    labelKey: 'administration.actions.suspend.label',
    confirmLabelKey: 'administration.actions.suspend.confirmLabel',
    titleKey: 'administration.actions.suspend.title',
    bodyKey: 'administration.actions.suspend.body',
    successKey: 'administration.actions.suspend.success',
  },
  reactivate: {
    icon: RotateCcw,
    status: 'Active',
    menuClass: 'text-tone-emerald focus:bg-tone-emerald/10 focus:text-tone-emerald',
    destructive: false,
    notable: false,
    labelKey: 'administration.actions.reactivate.label',
    confirmLabelKey: 'administration.actions.reactivate.confirmLabel',
    titleKey: 'administration.actions.reactivate.title',
    bodyKey: 'administration.actions.reactivate.body',
    successKey: 'administration.actions.reactivate.success',
  },
  delete: {
    icon: Trash2,
    status: null,
    menuClass: 'text-destructive focus:bg-destructive/10 focus:text-destructive',
    destructive: true,
    notable: false,
    labelKey: 'administration.actions.delete.label',
    confirmLabelKey: 'administration.actions.delete.confirmLabel',
    titleKey: 'administration.actions.delete.title',
    bodyKey: 'administration.actions.delete.body',
    successKey: 'administration.actions.delete.success',
  },
}

/**
 * Which actions make sense for an account in a given state. Mirrors the
 * server's transition table, so the menu never offers a move the API rejects.
 * Delete is always last and always available.
 */
const ACTIONS_BY_STATUS: Record<UserStatus, readonly UserActionId[]> = {
  Pending: ['approve', 'reject', 'delete'],
  Active: ['suspend', 'delete'],
  Rejected: ['reactivate', 'delete'],
  Suspended: ['reactivate', 'delete'],
}

export function actionsForStatus(status: UserStatus): readonly UserActionId[] {
  return ACTIONS_BY_STATUS[status] ?? ['delete']
}

/**
 * The one action worth surfacing outside the overflow menu. Only a pending
 * account has an obvious next step; everything else stays in the menu so the
 * table does not turn into a wall of buttons.
 */
export function primaryActionFor(status: UserStatus): UserActionId | null {
  return status === 'Pending' ? 'approve' : null
}
