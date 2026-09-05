import { ChallanWorkspace } from '@/features/challan/components/challan-workspace'

/**
 * The Challan Entry workspace: a WhatsApp PDF, opened here and nowhere else.
 *
 * Reaching this route requires a role that may file challans — the sidebar
 * hides it, `RoleRoute` guards the URL, and every request it makes is refused
 * server-side for anyone else. The last of those three is the only one that
 * counts as security; the other two are courtesy.
 */
export function ChallanNewPage() {
  return <ChallanWorkspace />
}
