import { useAuthStore } from '@/stores/use-auth-store'
import type { UserRole } from '@/lib/roles'
import { ADMIN_ROLE } from '@/lib/roles'

/**
 * The signed-in user's role, or null while the profile request is still in
 * flight (or if it failed). Null is treated as "no privileges" everywhere, so
 * a failed profile fetch degrades closed rather than open.
 */
export function useCurrentRole(): UserRole | null {
  return useAuthStore((state) => state.profile?.role ?? null)
}

export function useIsAdmin(): boolean {
  return useCurrentRole() === ADMIN_ROLE
}
