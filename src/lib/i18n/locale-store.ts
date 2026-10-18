import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  LOCALE_STORAGE_KEY,
  localeFor,
  otherLocale,
  readStoredLocale,
  withChoice,
} from '@/lib/i18n/locales'
import type { Locale, LocaleAudience, StoredLocale } from '@/lib/i18n/locales'

interface LocaleState extends StoredLocale {
  /** The toggle: shows `locale` and remembers it as this audience's choice. */
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  /**
   * Who has just signed in. Switches to that audience's choice, or to its
   * default when it has never made one — which is how a vendor account opens in
   * Bangla. Remembers nothing: nobody chose anything by signing in.
   */
  setAudience: (audience: LocaleAudience) => void
}

/**
 * Writes the locale onto the document.
 *
 * `lang` is the one that matters beyond appearance: it is what a screen reader
 * chooses a voice from, what the browser hyphenates and spell-checks against,
 * and what `:lang()` selectors and font-feature defaults key off. A Bangla page
 * announced as English is read aloud as gibberish, so this is an accessibility
 * fix rather than a nicety.
 *
 * `dir` is written even though both locales are left-to-right, so that adding a
 * right-to-left locale is a row in `LOCALES` rather than an audit of the shell.
 *
 * `data-locale` is the hook CSS uses for the small metric adjustments Bengali
 * wants — see the brand layer in `index.css`. Deliberately **not** a font
 * swap: the font stack lists Geist ahead of Noto Sans Bengali and the browser
 * already falls back per glyph, so `LBTS-CH-2026-000001` stays in Geist inside
 * an otherwise Bangla sentence without either file knowing about the other.
 */
export function applyLocale(locale: Locale): void {
  const root = document.documentElement
  root.lang = locale
  root.dir = 'ltr'
  root.dataset.locale = locale
}

/**
 * Persisted, unlike the auth profile and like the theme. A language is a
 * preference about a screen rather than a fact about an account: it carries no
 * identity and no role, so localStorage is the right place for it, and the
 * operator who set this gate PC to Bangla on Monday should not have to set it
 * again on Tuesday.
 *
 * It is deliberately not on the user's profile in MongoDB either. Two people
 * share the gate PC and sign in and out of it all day; a per-account language
 * would mean the screen changing language under whoever just walked up, and a
 * round trip to a sleeping Render instance before the first word could be
 * drawn.
 *
 * **The one thing an account does decide is the default.** A vendor account
 * opens in Bangla and everybody else in English, so the choice is remembered
 * per *audience* rather than once for the browser (`LocaleAudience`). The gate
 * PC keeps working exactly as before — everyone at it is staff, so they share
 * one choice — while a vendor signing in is not handed the office's English.
 * The audience is persisted with the rest, so a vendor's own phone opens in
 * Bangla from the first paint rather than after `/users/me` answers, which on a
 * cold start is most of a minute.
 */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      ...readStoredLocale(undefined),
      setLocale: (locale) =>
        set({ locale, chosen: withChoice(get().chosen, get().audience, locale) }),
      toggleLocale: () => get().setLocale(otherLocale(get().locale)),
      setAudience: (audience) => {
        if (audience === get().audience) {
          return
        }
        set({ audience, locale: localeFor(audience, get().chosen) })
      },
    }),
    {
      name: LOCALE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ locale, audience, chosen }) => ({ locale, audience, chosen }),
      /**
       * Anything unrecognised falls back to the staff default, English, which is
       * also what the no-flash script in `index.html` does. `readStoredLocale`
       * owns the reading, including a value written before audiences existed.
       */
      merge: (persisted, current) => ({ ...current, ...readStoredLocale(persisted) }),
    },
  ),
)

/**
 * Read the locale outside React — from a toast raised in a mutation callback,
 * or from a `lib/` helper that formats a string for a print sheet. Component
 * code should use `useT()` instead, which subscribes and therefore re-renders.
 */
export function currentLocale(): Locale {
  return useLocaleStore.getState().locale
}
