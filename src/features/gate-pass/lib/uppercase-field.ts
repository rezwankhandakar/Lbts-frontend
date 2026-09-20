import type { ChangeEvent } from 'react'

/**
 * The fields that are typed in capitals: CSD, Unit, Vehicle number and Model.
 *
 * All four are **codes** rather than transcriptions — a unit, a depot code, a
 * plate, a model number — and a code has one spelling. The server already
 * uppercases `csd` and `unit` for that reason; doing it in the box as well is
 * what stops the form showing one thing and the record holding another, and it
 * extends the same treatment to the plate and the model, which are stored
 * exactly as they arrive.
 *
 * Nothing else on the form is touched. A customer name is a name and a Trip DO
 * is kept character for character as printed.
 */

/**
 * Uppercases what is in the box, in place, before React Hook Form reads it.
 *
 * Writing to `input.value` is what makes the value itself uppercase rather
 * than merely looking it — a CSS `text-transform` would submit whatever was
 * typed and leave the two disagreeing. The caret is put back afterwards,
 * because assigning to `value` sends it to the end, and correcting the middle
 * of a plate is exactly when somebody is typing into one of these.
 */
export function uppercaseInPlace(event: ChangeEvent<HTMLInputElement>): void {
  const input = event.target
  const next = input.value.toUpperCase()

  if (next === input.value) {
    return
  }

  const start = input.selectionStart
  const end = input.selectionEnd
  input.value = next

  // `setSelectionRange` throws on an input type that has no selection to set.
  // These four are all text boxes, and the guard says so out loud.
  if (input.type === 'text' && start !== null && end !== null) {
    input.setSelectionRange(start, end)
  }
}
