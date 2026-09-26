import type { User as FirebaseUser } from 'firebase/auth'
import type { TranslationKey, Translator } from '@/lib/i18n'

/**
 * Firebase owns identity, so what a user may change about their sign-in
 * depends on how they signed in. Someone who arrived through Google has no
 * password here to change — their credential lives with Google — and offering
 * them a password form would be a dead end.
 */
export const PASSWORD_PROVIDER = 'password'

const PROVIDER_KEYS: Record<string, TranslationKey> = {
  password: 'profile.providers.password',
  'google.com': 'profile.providers.google',
}

export function hasPasswordProvider(user: FirebaseUser | null): boolean {
  return Boolean(user?.providerData.some((provider) => provider.providerId === PASSWORD_PROVIDER))
}

/**
 * Human-readable list of how this account can sign in.
 *
 * Takes the translator rather than reaching for the store, the arrangement
 * `roleMeta` uses: the caller then holds `useT()`, which is the subscription
 * that makes the list follow a language change. A provider id nobody has a
 * name for is shown **as its id** — that is data from Firebase, and inventing
 * a translation for it would be worse than showing what was actually there.
 */
export function providerLabels(user: FirebaseUser | null, t: Translator): string[] {
  if (!user) {
    return []
  }

  const labels = user.providerData.map((provider) => {
    const key = PROVIDER_KEYS[provider.providerId]
    return key ? t(key) : provider.providerId
  })

  return [...new Set(labels)]
}
