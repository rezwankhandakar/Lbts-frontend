/**
 * Telling a barcode scanner from a person, by timing alone.
 *
 * A handheld scanner in keyboard-wedge mode — which is how nearly every USB
 * and Bluetooth scanner ships — types what it reads as a burst of keystrokes a
 * few milliseconds apart and then presses Enter. A person types the same
 * characters a hundred milliseconds or more apart. So the workspace can accept
 * a scan **without anybody clicking into a box first**: when no field has
 * focus, keystrokes are fed through here, and only a fast burst ending in Enter
 * comes out the other side as a code.
 *
 * Pure and import-free, so `node --test` loads it directly; the React half is
 * `hooks/use-barcode-wedge.ts`.
 *
 * It started inside `features/delivery/` and moved out here when the Walton
 * Labour Bill needed to be filled by scanning challans — the rule CLAUDE.md
 * sets for a helper a second feature wants. Nothing in it was ever about a
 * trip: it is the timing that tells a scanner from a person, and both modules
 * want exactly that, in exactly the same shape.
 */

/**
 * The longest gap between two keystrokes that still counts as one scan.
 * Scanners run at 5–20ms; forty-five leaves room for a slow Bluetooth link
 * without admitting a fast typist, who rarely gets under eighty.
 */
export const WEDGE_MAX_GAP_MS = 45

/**
 * The shortest read accepted. A challan number is nineteen characters and an
 * SL number five; anything under five is a stray keypress, not a label.
 */
export const WEDGE_MIN_LENGTH = 5

export interface WedgeState {
  buffer: string
  lastAt: number
}

export const EMPTY_WEDGE: WedgeState = { buffer: '', lastAt: 0 }

export interface WedgeResult {
  state: WedgeState
  /** A complete scan, or null when the keystroke was not the end of one. */
  code: string | null
}

/** Keys that arrive mid-scan and mean nothing on their own. */
const MODIFIERS = new Set(['Shift', 'CapsLock'])

/**
 * Feeds one keystroke in.
 *
 * A gap longer than the threshold starts the buffer again from this key, so a
 * person who types three letters, pauses and types two more never assembles a
 * five-character "scan". Enter hands back the buffer only when it is long
 * enough, and always clears it.
 */
export function feedWedge(state: WedgeState, key: string, at: number): WedgeResult {
  if (MODIFIERS.has(key)) {
    return { state, code: null }
  }

  if (key === 'Enter') {
    const fresh = state.buffer.length > 0 && at - state.lastAt <= WEDGE_MAX_GAP_MS
    const code = fresh && state.buffer.length >= WEDGE_MIN_LENGTH ? state.buffer : null
    return { state: EMPTY_WEDGE, code }
  }

  if (key.length !== 1) {
    // Arrows, Tab, function keys: whatever this was, it was not a scan.
    return { state: EMPTY_WEDGE, code: null }
  }

  const continues = state.buffer.length > 0 && at - state.lastAt <= WEDGE_MAX_GAP_MS
  return {
    state: { buffer: continues ? state.buffer + key : key, lastAt: at },
    code: null,
  }
}

/**
 * What a scan is normalised to before it is looked up — the same cleaning the
 * server does, so the "already in the cart" check and the request agree.
 */
export function normalizeScan(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

/** A challan number, or a bare SL number. */
const CHALLAN_CODE = /^(LBTS-CH-\d{4}-\d+|\d{5,})$/i

/**
 * Whether a typed string is shaped like a challan's own identifier, rather
 * than like a search for a customer.
 *
 * It is what lets one box be both: with a scanner focused in it the number
 * lands followed by Enter and is looked up exactly, and with somebody typing
 * "Rahim" in it Enter searches. It lives here, in the file that already knows
 * what a scan looks like and imports nothing, because two places now ask the
 * question — the cart's finder, and the bar that takes a signed copy's number
 * off a creased barcode — and a second copy of this regex is exactly the kind
 * of thing that comes to disagree with the first.
 */
export function isChallanCode(value: string): boolean {
  return CHALLAN_CODE.test(value.trim())
}

/** A trip number in its **stored** form, which is what a manifest's barcode carries. */
const TRIP_CODE = /^V-\d+-TRIP-\d+$/i

/**
 * Whether a scan is a **trip manifest's** barcode rather than a challan's.
 *
 * Two different sheets now carry a barcode and an operator holds both: the
 * challan's back page, which means "this came back signed", and the manifest,
 * which means "open this trip". They are told apart by shape rather than by
 * which page happens to be open, because a scanner is pointed at paper and the
 * paper is what says which question is being asked.
 *
 * The **stored** form only — `V-0007-TRIP-0012`, vendor code and all. The
 * short form the screens read (`TRIP-0012`) is the vendor's own running count
 * and two vendors both have a twelfth trip, so a bare one names no trip. That
 * is exactly why the barcode carries the long form even though nobody says it
 * out loud.
 */
export function isTripCode(value: string): boolean {
  return TRIP_CODE.test(value.trim())
}
