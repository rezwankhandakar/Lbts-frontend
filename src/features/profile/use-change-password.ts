import { useCallback, useState } from 'react'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { toAuthMessage } from '@/features/auth/firebase-errors'
import { firebaseAuth } from '@/lib/firebase'

/**
 * Reauthentication failures are about the *current* password, so the shared
 * sign-in wording ("Incorrect email or password") would point at the wrong
 * field. Everything else falls through to the shared mapper.
 */
const REAUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Your current password is incorrect.',
  'auth/wrong-password': 'Your current password is incorrect.',
  'auth/missing-password': 'Enter your current password.',
}

function hasCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  )
}

export interface ChangePasswordController {
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  isPending: boolean
}

/**
 * Changes the password through Firebase, which is the only thing that stores
 * one. No password is ever sent to the LBTS API, written to MongoDB or kept in
 * any client state beyond the form field it was typed into.
 *
 * Firebase treats a password change as a sensitive operation and refuses it on
 * a stale session, which is why the current password is reauthenticated first
 * rather than merely checked. That step is what makes this safe on a machine
 * someone walked away from — and it doubles as the verification that the
 * person at the keyboard knows the password they are replacing.
 *
 * Rejects with a message that is already fit to show the user.
 */
export function useChangePassword(): ChangePasswordController {
  const [isPending, setIsPending] = useState(false)

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const user = firebaseAuth.currentUser

    if (!user?.email) {
      throw new Error('Your session has expired. Sign in again to change your password.')
    }

    setIsPending(true)

    try {
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, currentPassword),
      ).catch((error: unknown) => {
        const message = hasCode(error) ? REAUTH_MESSAGES[error.code] : undefined
        throw new Error(message ?? toAuthMessage(error))
      })

      await updatePassword(user, newPassword).catch((error: unknown) => {
        throw new Error(toAuthMessage(error))
      })
    } finally {
      setIsPending(false)
    }
  }, [])

  return { changePassword, isPending }
}
