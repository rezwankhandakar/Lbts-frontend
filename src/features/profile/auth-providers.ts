import type { User as FirebaseUser } from 'firebase/auth'

/**
 * Firebase owns identity, so what a user may change about their sign-in
 * depends on how they signed in. Someone who arrived through Google has no
 * password here to change — their credential lives with Google — and offering
 * them a password form would be a dead end.
 */
export const PASSWORD_PROVIDER = 'password'

const PROVIDER_LABELS: Record<string, string> = {
  password: 'Email and password',
  'google.com': 'Google',
}

export function hasPasswordProvider(user: FirebaseUser | null): boolean {
  return Boolean(user?.providerData.some((provider) => provider.providerId === PASSWORD_PROVIDER))
}

/** Human-readable list of how this account can sign in. */
export function providerLabels(user: FirebaseUser | null): string[] {
  if (!user) {
    return []
  }

  const labels = user.providerData.map(
    (provider) => PROVIDER_LABELS[provider.providerId] ?? provider.providerId,
  )

  return [...new Set(labels)]
}
