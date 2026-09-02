import type { User as FirebaseUser } from 'firebase/auth'
import { create } from 'zustand'
import type { UserRole, UserStatus } from '@/lib/roles'

/**
 * The signed-in user's own account, exactly as `GET /users/me` returns it.
 * Mirrors `PublicUser` in `LBTS-Backend/src/modules/user/user.serializer.ts`.
 * The profile module reads every field it shows from here — there is no second
 * profile request and no second copy of the user.
 */
export interface UserProfile {
  id: string
  firebaseUid: string
  email: string
  name: string
  phone: string | null
  photoUrl: string | null
  emailVerified: boolean
  role: UserRole
  status: UserStatus
  createdAt: string
  lastLoginAt: string | null
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  firebaseUser: FirebaseUser | null
  profile: UserProfile | null
  setSession: (firebaseUser: FirebaseUser, profile: UserProfile | null) => void
  setProfile: (profile: UserProfile) => void
  clearSession: () => void
}

/**
 * Deliberately NOT persisted. Firebase already persists the session in
 * IndexedDB, and the profile — which carries the role — is refetched from the
 * API on every load. Caching a role in localStorage would let a stale or
 * hand-edited value linger in the UI.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  firebaseUser: null,
  profile: null,
  setSession: (firebaseUser, profile) => set({ status: 'authenticated', firebaseUser, profile }),
  setProfile: (profile) => set({ profile }),
  clearSession: () => set({ status: 'unauthenticated', firebaseUser: null, profile: null }),
}))
