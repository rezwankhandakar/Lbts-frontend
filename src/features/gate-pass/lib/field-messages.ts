/**
 * Which message a field points a screen reader at.
 *
 * `EntryField` renders at most one line under a control — the error if there
 * is one, otherwise the hint — and `aria-describedby` has to name whichever it
 * drew. Both the plain input and the suggesting one need the same answer, so
 * it lives here rather than being exported from a component file.
 */
export function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) {
    return `${id}-error`
  }
  return hint ? `${id}-hint` : undefined
}
