/**
 * Firebase error codes are not user-facing. Anything unmapped falls back to a
 * generic message rather than leaking an internal code to the screen.
 *
 * The values are **translation keys** rather than sentences, for the reason
 * `auth-schemas.ts` gives: this table is evaluated once and the wording has to
 * be resolved wherever the message is finally drawn. Several codes deliberately
 * share one key — a wrong password and an unknown account must read the same,
 * or the form becomes a way of finding out which addresses are registered.
 */
const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'auth.firebase.invalidCredential',
  'auth/invalid-email': 'auth.firebase.invalidEmail',
  'auth/user-disabled': 'auth.firebase.userDisabled',
  'auth/user-not-found': 'auth.firebase.invalidCredential',
  'auth/wrong-password': 'auth.firebase.invalidCredential',
  'auth/email-already-in-use': 'auth.firebase.emailAlreadyInUse',
  'auth/weak-password': 'auth.firebase.weakPassword',
  'auth/too-many-requests': 'auth.firebase.tooManyRequests',
  // Firebase refuses sensitive changes — a new password, a new email — on a
  // session that has been open too long.
  'auth/requires-recent-login': 'auth.firebase.requiresRecentLogin',
  'auth/network-request-failed': 'auth.firebase.networkRequestFailed',
  'auth/popup-closed-by-user': 'auth.firebase.popupClosed',
  'auth/cancelled-popup-request': 'auth.firebase.popupCancelled',
  'auth/popup-blocked': 'auth.firebase.popupBlocked',
  'auth/operation-not-allowed': 'auth.firebase.operationNotAllowed',
  'auth/account-exists-with-different-credential': 'auth.firebase.differentCredential',
}

function hasCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  )
}

/**
 * A translation key for a Firebase failure, or the API's own sentence.
 *
 * Both come back as a plain string and both are handed to `t()` by the caller:
 * a key resolves, and a sentence the server already wrote passes through
 * unchanged because an unknown key resolves to itself. That is what lets one
 * call site handle a locally-known failure and a server message identically.
 */
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

  return 'auth.firebase.generic'
}

/** A popup the user closed is not worth showing an error toast for. */
export function isDismissedPopup(error: unknown): boolean {
  return (
    hasCode(error) &&
    (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request')
  )
}
