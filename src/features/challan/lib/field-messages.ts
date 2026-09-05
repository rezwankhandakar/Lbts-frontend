/**
 * Which message a field points a screen reader at.
 *
 * A challan field renders at most one line under its control — the error if
 * there is one, otherwise the hint — and `aria-describedby` has to name
 * whichever it drew. Mirrors the same helper in the Gate Pass module, which
 * exists for the same reason: more than one kind of input needs the answer, so
 * it does not belong to a component.
 */
export function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) {
    return `${id}-error`
  }
  return hint ? `${id}-hint` : undefined
}
