import { useLocation } from 'react-router-dom'
import { isNavItemActive, navSections } from '@/app/nav-config'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

export interface PageMeta {
  title: string
  /** The nav group the route belongs to, shown as header context. */
  section: string | null
}

interface PageMetaKeys {
  titleKey: TranslationKey
  sectionKey: TranslationKey | null
}

/**
 * Routes that are real destinations but deliberately absent from the sidebar,
 * because they belong to the person rather than to the business. Without an
 * entry here the header would announce them as "Not found".
 *
 * Keys rather than labels, the arrangement `nav-config.ts` takes: the header is
 * the one place this is rendered, and a page whose title stayed English while
 * its sidebar entry turned Bangla would be the single most visible way to get
 * this wrong.
 */
const STANDALONE_PAGES: Record<string, PageMetaKeys> = {
  '/profile': { titleKey: 'pages.profile', sectionKey: 'nav.sections.Account' },
  /**
   * Reached from the bell rather than the sidebar, for the reason `/profile` is
   * reached from the account menu: what this account has been told belongs to the
   * person, not to the business. A sidebar entry would also be a second way in
   * for something already one press away.
   */
  '/notifications': { titleKey: 'pages.notifications', sectionKey: 'nav.sections.Account' },
  /**
   * A sub-route of a sidebar destination. Without this the nav match below
   * would announce it as plain "Gate Pass", which is true of the list and not
   * of the workspace you are filling in.
   */
  '/gate-pass/new': { titleKey: 'pages.newGatePass', sectionKey: 'nav.sections.Main' },
  /**
   * The same reasoning for Challan: "Challan" is true of the records list and
   * says nothing about the workspace you are transcribing into.
   */
  '/challan/new': { titleKey: 'pages.challanEntry', sectionKey: 'nav.sections.Main' },
  /**
   * The source PDF list. The nav match below would call it "Challan", which is
   * true of the records and says nothing about the file-by-file view — and
   * those are the two things somebody navigating between them needs told
   * apart.
   */
  '/challan/batches': { titleKey: 'pages.sourcePdfs', sectionKey: 'nav.sections.Main' },
  /** The trip workspace, which "Delivery" would describe as the list. */
  '/delivery/new': { titleKey: 'pages.newDelivery', sectionKey: 'nav.sections.Main' },
  /**
   * `/my-vendor` *is* a sidebar item, but only for the one role that sees it —
   * so for anybody else the nav match below would find nothing and announce it
   * as "Not found". This makes the header honest whoever reaches the URL, and
   * the route guard is what actually decides who may.
   */
  '/my-vendor': { titleKey: 'pages.myVendor', sectionKey: 'nav.sections.Main' },
  /** Accounts' own sections, which "Accounts" alone would not tell apart in the header. */
  '/accounts/cash': { titleKey: 'pages.cash', sectionKey: 'nav.sections.Accounts' },
  '/accounts/cash-book': { titleKey: 'pages.cashBook', sectionKey: 'nav.sections.Accounts' },
  '/accounts/vendor-bills': {
    titleKey: 'pages.vendorTripBills',
    sectionKey: 'nav.sections.Accounts',
  },
  '/accounts/advances': { titleKey: 'pages.advances', sectionKey: 'nav.sections.Accounts' },
  '/accounts/expenses': { titleKey: 'pages.expenses', sectionKey: 'nav.sections.Accounts' },
  '/accounts/final-bills': {
    titleKey: 'pages.waltonFinalBill',
    sectionKey: 'nav.sections.Accounts',
  },
  '/accounts/labour-bills': {
    titleKey: 'pages.waltonLabourBill',
    sectionKey: 'nav.sections.Accounts',
  },
  '/accounts/profit-loss': { titleKey: 'pages.profitLoss', sectionKey: 'nav.sections.Accounts' },
  '/accounts/wallets': { titleKey: 'pages.wallets', sectionKey: 'nav.sections.Accounts' },
}

/**
 * Resolves to translated strings rather than to keys, so the header stays a
 * presentation component and there is exactly one place that knows a page title
 * is translatable. Calling `useT` here is also what makes the header re-render
 * on a language switch — without it the title would be the one word on screen
 * still in the old language.
 */
export function usePageMeta(): PageMeta {
  const t = useT()
  const { pathname } = useLocation()

  const standalone = STANDALONE_PAGES[pathname]
  if (standalone) {
    return {
      title: t(standalone.titleKey),
      section: standalone.sectionKey ? t(standalone.sectionKey) : null,
    }
  }

  for (const section of navSections) {
    const match = section.items.find((item) => isNavItemActive(item, pathname))
    if (match) {
      return { title: t(match.labelKey), section: t(section.labelKey) }
    }
  }

  return { title: t('pages.notFound'), section: null }
}
