import { GatePassWorkspace } from '@/features/gate-pass/components/gate-pass-workspace'

/**
 * A blank gate pass, scanned and transcribed in one workspace.
 *
 * Reaching this route requires a role that may file gate passes — the sidebar
 * hides it, `RoleRoute` guards the URL, and every request it makes is refused
 * server-side for anyone else. The last of those three is the only one that
 * counts as security; the other two are courtesy.
 */
export function GatePassNewPage() {
  return <GatePassWorkspace initialRecord={null} />
}
