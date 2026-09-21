import { useCallback, useState } from 'react'

/**
 * "Same as last" — the values a previous record left, offered to the next one.
 *
 * Gate Pass files a stack of scanned challans and Challan cuts a stack out of
 * one PDF, and both repeat a handful of values sheet after sheet: the same
 * customer, the same lorry, the same zone. Retyping those is where
 * transcription errors come from, and pre-filling them is where *worse* ones
 * come from — a filled box looks exactly like one somebody has already checked
 * against the paper in their hand.
 *
 * So the rule both modules follow is the same, and lives here rather than in
 * either of them:
 *
 * - The previous value is **shown above its box**, never written into it.
 * - **Ticking** puts it in; **unticking** takes it back out.
 * - What the tick puts in is an ordinary value in an ordinary box. Nothing is
 *   locked, because a plate or a zone that differs from the last sheet by one
 *   character is filled by the tick and corrected by typing over it.
 * - `kept` is therefore **derived, never asserted**: a tick is lit only while
 *   its field still equals what was carried. Edit the field and the tick goes
 *   out on its own, because what it claims has stopped being true — and that
 *   is also what makes unticking safe, since the only value it can clear is
 *   the carried one itself.
 *
 * What each module owns is its own field list, its own labels, and its own
 * store of what the last record left. This owns the behaviour.
 */
export interface CarryControls<F extends string = string> {
  /** What the last record held, for every carried field. */
  values: Record<F, string>
  /** Which fields currently hold exactly that. Derived every render. */
  kept: Partial<Record<F, boolean>>
  toggle: (field: F, next: boolean) => void
  /** The record the values came from — a gate pass id, a challan number. */
  sourceLabel: string | null
}

/** What the last record left, as a module's store keeps it. */
export interface CarriedEntry<F extends string> {
  values: Record<F, string>
  sourceLabel: string
}

interface UseCarryOverOptions<F extends string> {
  fields: readonly F[]
  /** The last record filed, or null when there is nothing to offer. */
  carried: CarriedEntry<F> | null
  /** What each carried field holds right now. */
  current: Record<F, string>
  /**
   * Writes one field on the form. Called with the carried value when a tick
   * goes on and with an empty string when it goes off, so a caller validating
   * on write should key that on whether the value is empty.
   */
  setField: (field: F, value: string) => void
}

/**
 * Returns `undefined` when there is nothing carried, so a form can pass the
 * result straight down: a field with nothing behind it draws no tick box, and
 * no caller has to ask twice.
 */
export function useCarryOver<F extends string>({
  fields,
  carried,
  current,
  setField,
}: UseCarryOverOptions<F>): CarryControls<F> | undefined {
  /**
   * Which fields the operator has pressed the tick on.
   *
   * State on the form, so it clears with the form between records. A tick that
   * survived into the next entry would be a decision made about the last sheet
   * still holding a value on this one, which is the whole failure the tick box
   * exists to make visible.
   */
  const [pinned, setPinned] = useState<Partial<Record<F, boolean>>>({})
  const values = carried?.values ?? null

  const toggle = useCallback(
    (field: F, next: boolean) => {
      setPinned((marks) => ({ ...marks, [field]: next }))
      if (values) {
        setField(field, next ? values[field] : '')
      }
    },
    [values, setField],
  )

  if (!values) {
    return undefined
  }

  const kept: Partial<Record<F, boolean>> = {}
  for (const field of fields) {
    if (pinned[field] && current[field] === values[field]) {
      kept[field] = true
    }
  }

  return { values, kept, toggle, sourceLabel: carried?.sourceLabel ?? null }
}
