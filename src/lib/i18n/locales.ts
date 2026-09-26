/**
 * What a locale *is*, as data rather than as a set of branches scattered
 * through the app. Import-free, so a test can load it and so the no-flash
 * script in `index.html` can mirror the same two values without importing
 * anything at all.
 *
 * Two locales, and deliberately no "system" third option. A theme can honestly
 * follow the operating system because `prefers-color-scheme` is a stated
 * preference; a *language* read off the browser would put this office's shared
 * gate PC into whatever Windows was installed in, which is not the same
 * question. The choice is explicit, persisted, and one press away.
 */

export type Locale = 'en' | 'bn'

export interface LocaleMeta {
  /** The value stored and written to `<html lang>`. */
  code: Locale
  /** What the language is called in English, for an English UI. */
  label: string
  /** What it calls itself — always shown as itself, never translated. */
  nativeLabel: string
  /** Two letters for the toggle, in the language's own script. */
  short: string
  /** The BCP-47 tag handed to `Intl`. */
  intlLocale: string
  /**
   * Which digits this locale prints. Bengali digits are shaped on the way out
   * of `Intl` rather than asked of it — see `numerals.ts` for why.
   */
  digits: 'latin' | 'bengali'
  /**
   * Both languages are left-to-right. The field exists so that adding a
   * right-to-left locale is a row here rather than an audit of every component,
   * and `applyLocale` already writes it to `<html dir>`.
   */
  dir: 'ltr' | 'rtl'
}

export const LOCALES: Record<Locale, LocaleMeta> = {
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    short: 'EN',
    /**
     * `en-BD`, not `en-US`. It is what `lib/format.ts` already groups money
     * with — 1,50,000 rather than 150,000 — and a date read in a Dhaka office
     * should not arrive in month-first American order.
     */
    intlLocale: 'en-BD',
    digits: 'latin',
    dir: 'ltr',
  },
  bn: {
    code: 'bn',
    label: 'Bangla',
    nativeLabel: 'বাংলা',
    short: 'বাং',
    intlLocale: 'bn-BD',
    digits: 'bengali',
    dir: 'ltr',
  },
}

/** Iteration order for the switcher. English first, because the data is English. */
export const LOCALE_ORDER: readonly Locale[] = ['en', 'bn']

export const DEFAULT_LOCALE: Locale = 'en'

/**
 * The key `zustand/persist` writes and the no-flash script in `index.html`
 * reads. Shared for the reason `THEME_STORAGE_KEY` is: two places read it
 * before React exists, and they must not drift.
 */
export const LOCALE_STORAGE_KEY = 'lbts-locale'

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'bn'
}

/** The other one. With two locales a toggle is a toggle rather than a menu. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'bn' : 'en'
}
