import { CircleCheck, CircleSlash, PauseCircle, RotateCcw, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserStatus } from '@/lib/roles'

export type UserActionId = 'approve' | 'reject' | 'suspend' | 'reactivate' | 'delete'

export interface UserActionDef {
  label: string
  icon: LucideIcon
  /** Target lifecycle state, or null for delete, which removes the account. */
  status: UserStatus | null
  /** Colour lives on the icon and label; the menu row itself stays neutral. */
  menuClass: string
  /** Only genuinely irreversible actions get the destructive confirm button. */
  destructive: boolean
  /** Reject and suspend accept a short reason, recorded on the account. */
  notable: boolean
  confirmLabel: string
  title: string
  body: (name: string) => string
  success: (name: string) => string
}

/**
 * The account lifecycle, as the UI presents it. Each entry maps to the one
 * status endpoint (or the delete endpoint); the server re-checks that the move
 * is legal, so a stale menu cannot force an illegal transition.
 */
export const USER_ACTIONS: Record<UserActionId, UserActionDef> = {
  approve: {
    label: 'Approve',
    icon: CircleCheck,
    status: 'Active',
    menuClass: 'text-tone-emerald focus:bg-tone-emerald/10 focus:text-tone-emerald',
    destructive: false,
    notable: false,
    confirmLabel: 'Approve account',
    title: 'Approve this account?',
    body: (name) => `${name} will be able to sign in and use LBTS with their assigned role.`,
    success: (name) => `${name}'s account was approved`,
  },
  reject: {
    label: 'Reject',
    icon: CircleSlash,
    status: 'Rejected',
    menuClass: 'text-tone-rose focus:bg-tone-rose/10 focus:text-tone-rose',
    destructive: false,
    notable: true,
    confirmLabel: 'Reject account',
    title: 'Reject this account?',
    body: (name) =>
      `${name} will be refused access. The account stays on record, and an Admin can approve it later.`,
    success: (name) => `${name}'s account was rejected`,
  },
  suspend: {
    label: 'Suspend',
    icon: PauseCircle,
    status: 'Suspended',
    menuClass: 'text-tone-orange focus:bg-tone-orange/10 focus:text-tone-orange',
    destructive: false,
    notable: true,
    confirmLabel: 'Suspend account',
    title: 'Suspend this account?',
    body: (name) =>
      `${name} will lose access immediately and cannot sign in until the account is reactivated.`,
    success: (name) => `${name}'s account was suspended`,
  },
  reactivate: {
    label: 'Reactivate',
    icon: RotateCcw,
    status: 'Active',
    menuClass: 'text-tone-emerald focus:bg-tone-emerald/10 focus:text-tone-emerald',
    destructive: false,
    notable: false,
    confirmLabel: 'Reactivate account',
    title: 'Reactivate this account?',
    body: (name) => `${name} will regain access to LBTS with their current role.`,
    success: (name) => `${name}'s account was reactivated`,
  },
  delete: {
    label: 'Delete',
    icon: Trash2,
    status: null,
    menuClass: 'text-destructive focus:bg-destructive/10 focus:text-destructive',
    destructive: true,
    notable: false,
    confirmLabel: 'Delete user',
    title: 'Delete this user?',
    body: (name) =>
      `This permanently removes ${name}'s account from LBTS and from the sign-in provider. This action cannot be undone.`,
    success: (name) => `${name}'s account was deleted`,
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
