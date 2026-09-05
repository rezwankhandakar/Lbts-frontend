import { useEffect } from 'react'

/**
 * Warns before the browser discards unsaved work.
 *
 * Covers reloads, closing the tab and navigating away from the app entirely.
 * It deliberately does not try to block in-app navigation: React Router's
 * blocker only works under a data router, and this app uses `<Routes>`. The
 * workspace guards that case itself, with a dialog it actually controls.
 */
export function useUnsavedChanges(isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) {
      return
    }

    const handler = (event: BeforeUnloadEvent) => {
      // Browsers ignore any custom text and show their own wording; setting
      // returnValue is what makes the prompt appear at all.
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
