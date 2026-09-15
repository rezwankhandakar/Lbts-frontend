import { useCallback } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

/** Anything inside a row that already does something of its own when clicked. */
const INTERACTIVE = 'a, button, input, select, textarea, label, [role="menuitem"], [role="menu"]'

/**
 * Makes a whole list row open its record, the way somebody expects a list to
 * behave, without breaking what is already inside it.
 *
 * Four clicks are left alone: one on a link, button or menu inside the row
 * (the trip number, the ⋮ menu); one that did not land in the row's own DOM at
 * all — React bubbles events out of portals, so a click inside the delete
 * dialog the menu opened would otherwise travel up and navigate; one that ends
 * a text selection, so a plate number can still be copied; and a Ctrl/⌘ click,
 * which opens a new tab as it would on a real link.
 *
 * The row itself stays a plain row: keyboard users already have the trip number
 * link, which is the one focusable way in.
 */
export function useRowLink() {
  const navigate = useNavigate()

  return useCallback(
    (href: string) => (event: MouseEvent<HTMLElement>) => {
      const target = event.target as HTMLElement

      if (!event.currentTarget.contains(target) || target.closest(INTERACTIVE)) {
        return
      }
      if (window.getSelection()?.toString()) {
        return
      }
      if (event.ctrlKey || event.metaKey) {
        window.open(href, '_blank', 'noopener')
        return
      }

      navigate(href)
    },
    [navigate],
  )
}
