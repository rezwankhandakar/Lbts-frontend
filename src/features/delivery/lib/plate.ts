/**
 * Plates, as the vehicle search reads and draws them.
 *
 * The server does the searching; this only answers the question the result
 * list asks — *which characters of the plate as painted are the ones the
 * operator typed?* — so the matched digits can be drawn in bold. That means
 * matching on the normalised key (case, spacing and punctuation set aside,
 * Bangla digits made ASCII) and mapping the match back onto the original text.
 *
 * Import-free for `node --test`.
 */

const BANGLA_DIGITS = '০১২৩৪৫৬৭৮৯'

/** Mirrors the server's `plateSearchKey`. */
export function plateKey(value: string): string {
  return value
    .replace(/[০-৯]/g, (digit) => String(BANGLA_DIGITS.indexOf(digit)))
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

export interface PlateSegment {
  text: string
  match: boolean
}

/**
 * Splits a plate into matched and unmatched runs for one query.
 *
 * The **last** occurrence is highlighted, because the search is built around
 * the tail — `11-1234` typed against `DHAKA METRO-TA-11-1234` lights up the end,
 * not an earlier `11`. A plate that does not contain the query comes back as
 * one unmatched run.
 */
export function highlightPlate(plate: string, query: string): PlateSegment[] {
  const needle = plateKey(query)
  if (!needle) {
    return [{ text: plate, match: false }]
  }

  // Which character of the original each key character came from.
  const origin: number[] = []
  let key = ''
  for (let index = 0; index < plate.length; index += 1) {
    const normalised = plateKey(plate[index])
    if (normalised) {
      key += normalised
      origin.push(index)
    }
  }

  const at = key.lastIndexOf(needle)
  if (at === -1) {
    return [{ text: plate, match: false }]
  }

  const start = origin[at]
  const end = origin[at + needle.length - 1] + 1

  return [
    { text: plate.slice(0, start), match: false },
    { text: plate.slice(start, end), match: true },
    { text: plate.slice(end), match: false },
  ].filter((segment) => segment.text.length > 0)
}
