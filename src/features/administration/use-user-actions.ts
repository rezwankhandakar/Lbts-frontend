import { useCallback, useState } from 'react'
import type { UserRole } from '@/lib/roles'
import { USER_ACTIONS } from './administration-actions'
import type { UserActionId } from './administration-actions'
import type { AdminUser } from './types'
import { useChangeUserRole, useChangeUserStatus, useDeleteUser } from './use-administration'

type OverlayView = 'details' | 'role' | 'confirm'

export interface UserActionsController {
  target: AdminUser | null
  view: OverlayView | null
  action: UserActionId | null
  isPending: boolean
  openDetails: (user: AdminUser) => void
  openRoleChange: (user: AdminUser) => void
  openAction: (user: AdminUser, action: UserActionId) => void
  close: () => void
  confirmRole: (role: UserRole) => void
  confirmAction: (note: string) => void
}

/**
 * Owns which overlay is open, for which user, and runs the mutation behind it.
 * Keeping this in one place is what stops the page from growing a tangle of
 * booleans — and it guarantees an overlay only closes once its write actually
 * succeeded, so a failed action leaves the operator looking at the dialog and
 * the error rather than at a list that silently did nothing.
 */
export function useUserActions(): UserActionsController {
  const [target, setTarget] = useState<AdminUser | null>(null)
  const [view, setView] = useState<OverlayView | null>(null)
  const [action, setAction] = useState<UserActionId | null>(null)

  const changeRole = useChangeUserRole()
  const changeStatus = useChangeUserStatus()
  const removeUser = useDeleteUser()

  const close = useCallback(() => {
    setView(null)
    setAction(null)
  }, [])

  const openDetails = useCallback((user: AdminUser) => {
    setTarget(user)
    setAction(null)
    setView('details')
  }, [])

  const openRoleChange = useCallback((user: AdminUser) => {
    setTarget(user)
    setAction(null)
    setView('role')
  }, [])

  const openAction = useCallback((user: AdminUser, next: UserActionId) => {
    setTarget(user)
    setAction(next)
    setView('confirm')
  }, [])

  const confirmRole = useCallback(
    (role: UserRole) => {
      if (!target) {
        return
      }
      changeRole.mutate({ id: target.id, role, name: target.name }, { onSuccess: close })
    },
    [target, changeRole, close],
  )

  const confirmAction = useCallback(
    (note: string) => {
      if (!target || !action) {
        return
      }

      const definition = USER_ACTIONS[action]

      if (definition.status === null) {
        removeUser.mutate({ id: target.id, name: target.name }, { onSuccess: close })
        return
      }

      changeStatus.mutate(
        {
          id: target.id,
          status: definition.status,
          note: note || undefined,
          name: target.name,
          successMessage: definition.success(target.name),
        },
        { onSuccess: close },
      )
    },
    [target, action, changeStatus, removeUser, close],
  )

  return {
    target,
    view,
    action,
    isPending: changeRole.isPending || changeStatus.isPending || removeUser.isPending,
    openDetails,
    openRoleChange,
    openAction,
    close,
    confirmRole,
    confirmAction,
  }
}
