import { useCallback, useMemo } from 'react'
import { LOCALES, otherLocale } from '@/lib/i18n/locales'
import type { Locale, LocaleMeta } from '@/lib/i18n/locales'
import { useLocaleStore, currentLocale } from '@/lib/i18n/locale-store'
import { MESSAGES } from '@/lib/i18n/messages'
import type { TranslationKey } from '@/lib/i18n/messages'
import { formatNumber } from '@/lib/i18n/format'
import { translateKey } from '@/lib/i18n/translate'
import type { InterpolationValues } from '@/lib/i18n/translate'
import { DEFAULT_LOCALE } from '@/lib/i18n/locales'

/**
 * The shape every consumer passes around. Named rather than written inline
 * because it is also what `roleMeta` and the other tolerant lookups in `lib/`
 * take as an argument — see `lib/roles.ts` for why they take it rather than
 * reaching for the store themselves.
 */
export type Translator = (key: TranslationKey, values?: InterpolationValues) => string

/** Resolve one key against a locale, falling back to English. Pure. */
function translateIn(locale: Locale, key: string, values?: InterpolationValues): string {
  return translateKey(MESSAGES[locale], MESSAGES[DEFAULT_LOCALE], key, values)
}

/**
 * Translate outside React.
 *
 * For a toast raised in a mutation callback, a string built inside a `lib/`
 * helper, or a `document.title`. It reads the store at call time, which is
 * correct for a value produced once and handed straight to something that is
 * not a component — and wrong for anything rendered, because nothing
 * subscribes. **Inside a component, use `useT`.**
 */
export function t(key: TranslationKey, values?: InterpolationValues): string {
  return translateIn(currentLocale(), key, values)
}

/**
 * "3 challans" — a count and the noun it counts, agreed.
 *
 * The one place a counted noun is assembled. English agrees the noun with
 * the number and Bangla attaches a classifier to the number instead, so
 * neither half can be concatenated in a component: `nouns.*` picks the
 * form and `common.pagination.counted` decides how the two sit together.
 */
export function countOf(count: number, noun: TranslationKey, translate: Translator): string {
  return translate('common.pagination.counted', {
    n: formatNumber(count),
    noun: translate(noun, { count }),
  })
}
export interface UseTranslation {
  /** Translate a key. Reactive: the component re-renders when the locale changes. */
  t: Translator
  locale: Locale
  /** Metadata for the active locale — its own name, its `Intl` tag, its digits. */
  meta: LocaleMeta
  /** The locale the toggle would switch to. */
  next: LocaleMeta
  isBangla: boolean
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

/**
 * The hook every component uses.
 *
 * Reactivity is the whole point of it. The store is the subscription, so any
 * component that calls this re-renders the moment the language changes — which
 * is why translated text must come from here rather than from the standalone
 * `t` above. A component reading `t` directly would render the right words once
 * and then never change them again, which is a far worse failure than an
 * untranslated string: the page would be half in each language with nothing
 * saying why.
 */
export function useTranslation(): UseTranslation {
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const toggleLocale = useLocaleStore((state) => state.toggleLocale)

  /**
   * Stable per locale, so it is safe in a dependency array and does not
   * invalidate a `useMemo` on every render of a list that translates a column
   * header per row.
   */
  const translate = useCallback<Translator>(
    (key, values) => translateIn(locale, key, values),
    [locale],
  )

  return useMemo(
    () => ({
      t: translate,
      locale,
      meta: LOCALES[locale],
      next: LOCALES[otherLocale(locale)],
      isBangla: locale === 'bn',
      setLocale,
      toggleLocale,
    }),
    [translate, locale, setLocale, toggleLocale],
  )
}

/** The common case, for a component that only needs to translate. */
export function useT(): Translator {
  return useTranslation().t
}
