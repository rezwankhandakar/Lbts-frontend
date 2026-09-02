import type { UserActionsController } from '../use-user-actions'
import { ChangeRoleDialog } from './change-role-dialog'
import { ConfirmActionDialog } from './confirm-action-dialog'
import { UserDetailsSheet } from './user-details-sheet'

interface AdministrationOverlaysProps {
  actions: UserActionsController
  currentUserId: string | null
}

/**
 * The three surfaces that sit above the directory. Grouped so the page reads
 * as page-level composition rather than a stack of dialog wiring.
 */
export function AdministrationOverlays({ actions, currentUserId }: AdministrationOverlaysProps) {
  const isSelf = actions.target?.id === currentUserId

  /**
   * Only close when the overlay that reported the change is still the active
   * one. Opening the role dialog from the details sheet flips the sheet to
   * closed, and without this guard that would tear down the dialog it just
   * opened.
   */
  const closeIf = (view: string) => (open: boolean) => {
    if (!open && actions.view === view) {
      actions.close()
    }
  }

  return (
    <>
      <UserDetailsSheet
        user={actions.target}
        open={actions.view === 'details'}
        isSelf={isSelf}
        onOpenChange={closeIf('details')}
        onChangeRole={actions.openRoleChange}
      />

      <ChangeRoleDialog
        user={actions.target}
        open={actions.view === 'role'}
        isPending={actions.isPending}
        onOpenChange={closeIf('role')}
        onConfirm={actions.confirmRole}
      />

      <ConfirmActionDialog
        user={actions.target}
        action={actions.action}
        open={actions.view === 'confirm'}
        isPending={actions.isPending}
        onOpenChange={closeIf('confirm')}
        onConfirm={actions.confirmAction}
      />
    </>
  )
}
