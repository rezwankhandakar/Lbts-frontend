import type { Locale } from '@/lib/i18n/locales'
import type { LeafPath, MessageTree } from '@/lib/i18n/translate'
import { en } from '@/lib/i18n/messages/en'
import { bn } from '@/lib/i18n/messages/bn'

/** The English tree's shape, which every locale is checked against. */
export type Messages = typeof en

/**
 * Every valid key, as a union of dot paths. This is the single most important
 * type in the module: it turns `t('nav.items.challan')` into something the
 * compiler checks, so a renamed or mistyped key fails the build rather than
 * rendering its own name on a page somebody is trying to work from.
 */
export type TranslationKey = LeafPath<Messages>

/**
 * Both trees, keyed by locale. Bundled rather than fetched: the whole
 * dictionary is a few tens of kilobytes gzipped, and a network round trip for
 * it on a host that sleeps for fifteen minutes would mean a first paint in one
 * language and a second in the other — a flash of the wrong language, which is
 * exactly the thing `index.html`'s no-flash script exists to prevent for the
 * theme.
 */
export const MESSAGES: Record<Locale, MessageTree> = {
  en,
  bn,
}

export { en, bn }
