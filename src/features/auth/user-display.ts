import type { User as FirebaseUser } from 'firebase/auth'
import type { UserProfile } from '@/stores/use-auth-store'

export interface DisplayUser {
  name: string
  email: string
  photoUrl: string | null
  role: string | null
  initials: string
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return 'U'
  }
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase() || 'U'
}

/**
 * Prefers the MongoDB profile, falling back to the Firebase user while the
 * profile request is still in flight (or if it failed).
 */
export function toDisplayUser(
  profile: UserProfile | null,
  firebaseUser: FirebaseUser | null,
): DisplayUser {
  const name = profile?.name ?? firebaseUser?.displayName ?? 'Account'
  const email = profile?.email ?? firebaseUser?.email ?? ''

  return {
    name,
    email,
    photoUrl: profile?.photoUrl ?? firebaseUser?.photoURL ?? null,
    role: profile?.role ?? null,
    initials: getInitials(name),
  }
}
