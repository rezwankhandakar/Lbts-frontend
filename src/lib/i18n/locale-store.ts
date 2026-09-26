import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isLocale, otherLocale } from '@/lib/i18n/locales'
import type { Locale } from '@/lib/i18n/locales'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
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
 */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set({ locale: otherLocale(get().locale) }),
    }),
    {
      name: LOCALE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      /**
       * A hand-edited or half-written value must not leave the app in a locale
       * that has no dictionary. Anything unrecognised falls back to English,
       * which is also what the no-flash script in `index.html` does.
       */
      merge: (persisted, current) => {
        const stored = (persisted as Partial<LocaleState> | undefined)?.locale
        return { ...current, locale: isLocale(stored) ? stored : DEFAULT_LOCALE }
      },
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
