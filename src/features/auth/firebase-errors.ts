/**
 * Firebase error codes are not user-facing. Anything unmapped falls back to a
 * generic message rather than leaking an internal code to the screen.
 */
const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  // Firebase refuses sensitive changes — a new password, a new email — on a
  // session that has been open too long.
  'auth/requires-recent-login': 'For security, sign in again before changing this.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'Sign-in window closed before finishing.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups and try again.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase.',
  'auth/account-exists-with-different-credential':
    'This email is already registered with a different sign-in method.',
}

function hasCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  )
}

export function toAuthMessage(error: unknown): string {
  if (hasCode(error) && MESSAGES[error.code]) {
    return MESSAGES[error.code]
  }

  // Errors from our own API are already normalized to { message, statusCode }.
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string' && message.length > 0 && !message.startsWith('Firebase:')) {
      return message
    }
  }

  return 'Something went wrong. Please try again.'
}

/** A popup the user closed is not worth showing an error toast for. */
export function isDismissedPopup(error: unknown): boolean {
  return (
    hasCode(error) &&
    (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request')
  )
}
