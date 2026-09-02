import { useCallback, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { firebaseAuth, googleProvider } from '@/lib/firebase'
import { useAuthStore } from '@/stores/use-auth-store'
import { syncProfile } from './auth-api'

/**
 * Subscribes to Firebase's auth state for the lifetime of the app and keeps
 * the store in sync. Mounted once, in Providers.
 *
 * The profile sync lives here rather than in each form, so a session restored
 * on page load goes through exactly the same path as a fresh sign-in.
 */
export function useAuthListener(): void {
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (!firebaseUser) {
        clearSession()
        return
      }

      // The profile carries the role, so a failure here must not present the
      // user as fully authenticated with unknown permissions.
      syncProfile()
        .then((profile) => setSession(firebaseUser, profile))
        .catch(() => setSession(firebaseUser, null))
    })
  }, [setSession, clearSession])
}

export function useAuthActions() {
  const signUpWithEmail = useCallback(async (name: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    await updateProfile(credential.user, { displayName: name })
    // Sync explicitly with the name: the ID token's `name` claim is not
    // refreshed by updateProfile, so the listener alone would miss it.
    await syncProfile({ name })
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth, email, password)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(firebaseAuth, googleProvider)
  }, [])

  const sendReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(firebaseAuth, email)
  }, [])

  const logout = useCallback(async () => {
    await signOut(firebaseAuth)
  }, [])

  return { signUpWithEmail, signInWithEmail, signInWithGoogle, sendReset, logout }
}
