import { useLocation } from 'react-router-dom'
import { isNavItemActive, navSections } from '@/app/nav-config'

export interface PageMeta {
  title: string
  /** The nav group the route belongs to, shown as header context. */
  section: string | null
}

/**
 * Routes that are real destinations but deliberately absent from the sidebar,
 * because they belong to the person rather than to the business. Without an
 * entry here the header would announce them as "Not found".
 */
const STANDALONE_PAGES: Record<string, PageMeta> = {
  '/profile': { title: 'Profile', section: 'Account' },
  /**
   * A sub-route of a sidebar destination. Without this the nav match below
   * would announce it as plain "Gate Pass", which is true of the list and not
   * of the workspace you are filling in.
   */
  '/gate-pass/new': { title: 'New gate pass', section: 'Main' },
  /**
   * The same reasoning for Challan: "Challan" is true of the records list and
   * says nothing about the workspace you are transcribing into.
   */
  '/challan/new': { title: 'Challan entry', section: 'Main' },
  /**
   * The source PDF list. The nav match below would call it "Challan", which is
   * true of the records and says nothing about the file-by-file view — and
   * those are the two things somebody navigating between them needs told
   * apart.
   */
  '/challan/batches': { title: 'Source PDFs', section: 'Main' },
}

export function usePageMeta(): PageMeta {
  const { pathname } = useLocation()

  const standalone = STANDALONE_PAGES[pathname]
  if (standalone) {
    return standalone
  }

  for (const section of navSections) {
    const match = section.items.find((item) => isNavItemActive(item, pathname))
    if (match) {
      return { title: match.label, section: section.label }
    }
  }

  return { title: 'Not found', section: null }
}
