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

/**
 * The fallback dictionary, and the office's own default. A vendor account opens
 * in Bangla instead — see `AUDIENCE_DEFAULT_LOCALE`.
 */
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

/**
 * Who is in front of the screen, as far as the language is concerned.
 *
 * Two audiences because the business asked for two defaults: the office works
 * in English unless somebody switches, and a vendor account opens in Bangla.
 * The audience is not a role — it is the one distinction between roles that
 * decides a default, so a role added next year is staff unless it says
 * otherwise.
 */
export type LocaleAudience = 'staff' | 'vendor'

export const AUDIENCE_DEFAULT_LOCALE: Record<LocaleAudience, Locale> = {
  staff: DEFAULT_LOCALE,
  vendor: 'bn',
}

/** What each audience last chose on this browser. `null` is "never pressed the toggle". */
export type LocaleChoices = Record<LocaleAudience, Locale | null>

export interface StoredLocale {
  /** What is on screen now — always `localeFor(audience, chosen)`. */
  locale: Locale
  /** Whoever signed in last on this browser; it outlives the sign-out. */
  audience: LocaleAudience
  chosen: LocaleChoices
}

export function isLocaleAudience(value: unknown): value is LocaleAudience {
  return value === 'staff' || value === 'vendor'
}

/**
 * The language an audience sees: what it chose here, or its default.
 *
 * Kept per audience rather than as one value for the browser, for the case that
 * actually happens: an Admin who set this machine to English and then signs in
 * as a vendor to check what a vendor sees is a vendor *seeing the default*, not
 * a vendor who chose English. One shared value would have answered that with
 * the Admin's choice.
 */
export function localeFor(audience: LocaleAudience, chosen: LocaleChoices): Locale {
  return chosen[audience] ?? AUDIENCE_DEFAULT_LOCALE[audience]
}

/** `chosen` with one audience's choice replaced. */
export function withChoice(
  chosen: LocaleChoices,
  audience: LocaleAudience,
  locale: Locale,
): LocaleChoices {
  const next: LocaleChoices = { ...chosen }
  next[audience] = locale
  return next
}

/**
 * Whatever `zustand/persist` handed back, reduced to a state that is always
 * whole.
 *
 * Every field is checked rather than trusted — it is localStorage, and a
 * hand-edited or half-written value must not leave the app in a locale with no
 * dictionary. `locale` is then *derived* from the other two rather than read,
 * so the three can never disagree about what is on screen.
 *
 * A value written before audiences existed is `{ locale }` and nothing else.
 * The only thing that ever wrote it was the toggle, pressed by somebody in the
 * office, so it is read as a **staff** choice — and a vendor signing in on that
 * browser still gets the vendor default rather than inheriting it.
 */
export function readStoredLocale(persisted: unknown): StoredLocale {
  const stored = isRecord(persisted) ? persisted : {}
  const audience = isLocaleAudience(stored.audience) ? stored.audience : 'staff'

  const chosen: LocaleChoices = isRecord(stored.chosen)
    ? {
        staff: isLocale(stored.chosen.staff) ? stored.chosen.staff : null,
        vendor: isLocale(stored.chosen.vendor) ? stored.chosen.vendor : null,
      }
    : { staff: isLocale(stored.locale) ? stored.locale : null, vendor: null }

  return { locale: localeFor(audience, chosen), audience, chosen }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
