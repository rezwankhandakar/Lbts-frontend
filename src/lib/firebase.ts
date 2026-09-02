import { initializeApp, getApps } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import type { Auth } from 'firebase/auth'
import { config } from '@/app/config'

const app = getApps()[0] ?? initializeApp(config.firebase)

export const firebaseAuth: Auth = getAuth(app)

export const googleProvider = new GoogleAuthProvider()
// Always show the chooser, so a shared machine cannot silently reuse an account.
googleProvider.setCustomParameters({ prompt: 'select_account' })

/**
 * Current user's ID token, or null when signed out. Firebase refreshes the
 * token automatically when it is close to expiry, so this is safe to call on
 * every request.
 */
export async function getIdToken(): Promise<string | null> {
  const user = firebaseAuth.currentUser
  if (!user) {
    return null
  }
  return user.getIdToken()
}
