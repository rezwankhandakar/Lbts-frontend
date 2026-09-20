import { useEffect, useRef } from 'react'
import { EMPTY_WEDGE, feedWedge } from '@/lib/barcode-wedge'

/**
 * True while somebody is typing into a field — the one time the page must not
 * treat keystrokes as a scan, or a driver's name typed quickly would be looked
 * up as a challan number.
 */
function isEditing(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target.isContentEditable) {
    return true
  }
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/**
 * Listens for a barcode scanner anywhere on the page.
 *
 * A keyboard-wedge scanner types a challan number and presses Enter; this
 * hands that number to `onScan` whenever no field has focus, so an operator
 * working through a stack of printed challans scans one after another without
 * clicking into anything. The timing logic that tells a scanner from a person
 * is `lib/barcode-wedge.ts`; this is only the listener.
 *
 * Suspended while `enabled` is false — a dialog is open, say — because a scan
 * landing behind a modal would add a challan somebody cannot see being added.
 */
export function useBarcodeWedge(onScan: (code: string) => void, enabled: boolean): void {
  const state = useRef(EMPTY_WEDGE)
  const handler = useRef(onScan)

  useEffect(() => {
    handler.current = onScan
  }, [onScan])

  useEffect(() => {
    if (!enabled) {
      state.current = EMPTY_WEDGE
      return
    }

    const listener = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        isEditing(event.target) ||
        // Any modal at all — a driver form, a picker — not only the ones the
        // page knows about.
        document.querySelector('[role="dialog"], [role="alertdialog"]') !== null
      ) {
        state.current = EMPTY_WEDGE
        return
      }

      const result = feedWedge(state.current, event.key, event.timeStamp)
      state.current = result.state

      if (result.code) {
        // The Enter that ended a scan must not also press whatever button
        // happens to have focus.
        event.preventDefault()
        handler.current(result.code)
      }
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [enabled])
}
