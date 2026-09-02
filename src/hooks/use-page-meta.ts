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
