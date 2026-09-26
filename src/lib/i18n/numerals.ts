/**
 * Digit shaping, as pure arithmetic over code points.
 *
 * Import-free on purpose, the rule `page-ranges.ts` established: `node --test`
 * resolves specifiers the way Node does and knows nothing about the `@/` alias,
 * so a file with a test beside it owns its values rather than importing them.
 *
 * A professional Bangla surface prints Bengali digits — ৳১,৫০,০০০ rather than
 * ৳1,50,000 — because that is what a Bangladeshi office reads on paper. The
 * conversion happens at the *end* of formatting rather than inside it: `Intl`
 * groups, pads and rounds correctly in Latin digits, and transliterating the
 * finished string is the one step that cannot get the arithmetic wrong.
 *
 * It is deliberately a transliteration and never a parse. Nothing here reads a
 * Bengali numeral back into a number for storage — every value the API holds is
 * a JavaScript number, and the only place Bengali digits exist is on screen.
 */

/** U+09E6..U+09EF, in value order. */
const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const

const BENGALI_ZERO = 0x09e6
const LATIN_ZERO = 0x30

/**
 * Every ASCII digit in the string becomes its Bengali counterpart. Anything
 * else — separators, currency signs, letters, the em dash a blank renders as —
 * is passed through untouched, so `৳1,50,000.50` and `2026-09-24` both survive
 * with their punctuation intact.
 */
export function toBengaliDigits(value: string): string {
  let out = ''

  for (const char of value) {
    const digit = char.charCodeAt(0) - LATIN_ZERO
    out += digit >= 0 && digit <= 9 ? BENGALI_DIGITS[digit] : char
  }

  return out
}

/**
 * The inverse, for a value on its way *into* the system: a Bengali numeral
 * typed or pasted into a number field has to reach the API as ASCII. The
 * plate search in Delivery already does this for a registration number
 * (`plateSearchKey`); this is the same normalisation for anything typed.
 */
export function toLatinDigits(value: string): string {
  let out = ''

  for (const char of value) {
    const digit = char.charCodeAt(0) - BENGALI_ZERO
    out += digit >= 0 && digit <= 9 ? String.fromCharCode(LATIN_ZERO + digit) : char
  }

  return out
}

/** True when the string carries at least one Bengali digit. */
export function hasBengaliDigits(value: string): boolean {
  for (const char of value) {
    const digit = char.charCodeAt(0) - BENGALI_ZERO
    if (digit >= 0 && digit <= 9) {
      return true
    }
  }

  return false
}

/**
 * The one entry point presentation code should use: shape the digits for a
 * locale, leaving every other locale's output exactly as `Intl` produced it.
 *
 * Keeping the locale check here rather than at each call site is what stops a
 * formatter being added later that prints Latin digits on a Bangla page — the
 * decision is made once, in the function every formatter already calls.
 */
export function shapeDigits(value: string, locale: string): string {
  return locale === 'bn' ? toBengaliDigits(value) : value
}
