import {
  convertBijoyToUnicode,
  hasBengaliUnicode,
  looksLikeBijoy,
  shouldConvertAsBijoy,
} from 'bijoy2unicode'

/**
 * Legacy Bangla (Bijoy / SutonnyMJ ANSI) to Unicode, in the browser.
 *
 * Mirrors `LBTS-Backend/src/modules/challan/lib/bangla-text.ts` exactly —
 * same package, same guard, same two entry points. Change one, change both.
 *
 * The two copies do different jobs. The server's runs on every value on its
 * way into storage, which is what makes "the stored value is Unicode" a
 * property of the system rather than something the client is trusted to have
 * done. This one runs on the way *out* of the operator's clipboard, so the
 * conversion can be previewed and accepted before it is committed to anything
 * — the requirement is that no conversion is silent, and a preview is the only
 * way to keep that promise.
 *
 * The rule shared by both: the underlying converter is destructive when it is
 * pointed at the wrong text. Run it over "ABC Electronics Ltd." and it emits
 * Bangla letters; run it over text that is already Unicode and it reorders the
 * vowel signs into nonsense. So it is never called directly anywhere in this
 * codebase — every path goes through one of the functions below.
 */

export type BanglaConversion = 'unchanged' | 'converted'

export interface BanglaNormalization {
  value: string
  conversion: BanglaConversion
}

/**
 * Whether this text is confidently legacy Bijoy.
 *
 * The signal is the high-byte characters the Bijoy layout uses for vowel signs
 * and conjuncts — `‡`, `¯`, `©`, `Æ` and their neighbours. Nothing English
 * contains those, and nothing already in Unicode Bangla does either, which is
 * what makes the test safe to act on without asking.
 */
export function isLikelyLegacyBangla(value: string): boolean {
  return looksLikeBijoy(value)
}

export function containsUnicodeBangla(value: string): boolean {
  return hasBengaliUnicode(value)
}

/**
 * The safe conversion: legacy text becomes Unicode, everything else is
 * returned exactly as it arrived.
 *
 * Used to decide whether to *offer* a conversion after a paste. It converts
 * only when the heuristic is confident, so English, model codes, phone numbers
 * and text that is already Unicode Bangla pass through untouched.
 */
export function normalizeBanglaText(value: string): BanglaNormalization {
  if (!value || !shouldConvertAsBijoy(value)) {
    return { value, conversion: 'unchanged' }
  }

  const converted = convertBijoyToUnicode(value)

  return converted === value
    ? { value, conversion: 'unchanged' }
    : { value: converted, conversion: 'converted' }
}

export function toUnicodeBangla(value: string): string {
  return normalizeBanglaText(value).value
}

/**
 * Conversion the operator explicitly asked for, on text detection would have
 * left alone.
 *
 * This is the escape hatch for the case no algorithm can solve: legacy Bijoy
 * written entirely in plain ASCII — `XvKv` for ঢাকা — is indistinguishable
 * from an English word, so a person has to say. It is a separate function from
 * `normalizeBanglaText` for exactly that reason: the dangerous one is the one
 * you have to name, and it only ever runs into a preview the operator then
 * accepts or discards.
 */
export function forceBanglaConversion(value: string): string {
  if (!value) {
    return value
  }
  return convertBijoyToUnicode(value)
}

/**
 * Whether a field is worth showing the conversion control on.
 *
 * False once the value is already Unicode Bangla: there is nothing left to
 * convert and pressing it could only corrupt what is there.
 */
export function canOfferConversion(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length === 0 || containsUnicodeBangla(trimmed)) {
    return false
  }
  return true
}

/** What the field should say about a pasted value, if anything. */
export type BanglaFieldHint = 'none' | 'looks-legacy' | 'converted'

/**
 * The hint for one field's current value.
 *
 * `looks-legacy` is the loud one — the paste is confidently Bijoy and reads as
 * gibberish on screen, so the field says so and offers to fix it. Everything
 * else stays quiet, because a control that appears under every field an
 * operator touches stops being read after the third challan.
 */
export function banglaHintFor(value: string): BanglaFieldHint {
  if (!value.trim()) {
    return 'none'
  }
  return isLikelyLegacyBangla(value) ? 'looks-legacy' : 'none'
}
