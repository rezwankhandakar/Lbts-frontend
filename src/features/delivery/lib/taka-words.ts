/**
 * Taka as a person reads it in Bangla — digits and words — so an amount typed
 * into a bill field can be checked by reading it back. `15000` and `150000`
 * look alike at a glance; "পনেরো হাজার" and "এক লক্ষ পঞ্চাশ হাজার" do not.
 *
 * Bangla numbers below a hundred are ninety-nine separate words rather than a
 * rule, so they are a table. Above that the counting is South Asian: শত,
 * হাজার, লক্ষ, কোটি — and the grouping of the digits follows it (১৫,০০,০০০).
 *
 * Import-free, so `node --test` loads it directly.
 */

const UNDER_HUNDRED = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বাহান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই',
]

/** Exposed for the test that holds the table at exactly a hundred words. */
export const BANGLA_UNDER_HUNDRED: readonly string[] = UNDER_HUNDRED

const BANGLA_DIGITS = '০১২৩৪৫৬৭৮৯'

/** A whole number in Bangla words: 1500 → "এক হাজার পাঁচশত". */
export function numberInBanglaWords(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return ''
  }

  const whole = Math.floor(value)
  if (whole === 0) {
    return UNDER_HUNDRED[0]
  }

  const parts: string[] = []
  const crore = Math.floor(whole / 10_000_000)
  const rest = whole % 10_000_000

  if (crore > 0) {
    parts.push(`${numberInBanglaWords(crore)} কোটি`)
  }

  const lakh = Math.floor(rest / 100_000)
  const thousand = Math.floor((rest % 100_000) / 1000)
  const hundred = Math.floor((rest % 1000) / 100)
  const unit = rest % 100

  if (lakh > 0) {
    parts.push(`${UNDER_HUNDRED[lakh]} লক্ষ`)
  }
  if (thousand > 0) {
    parts.push(`${UNDER_HUNDRED[thousand]} হাজার`)
  }
  if (hundred > 0) {
    parts.push(`${UNDER_HUNDRED[hundred]}শত`)
  }
  if (unit > 0) {
    parts.push(UNDER_HUNDRED[unit])
  }

  return parts.join(' ')
}

/** An amount the way a cheque writes it: "এক হাজার পাঁচশত টাকা মাত্র". */
export function takaInBanglaWords(value: number): string {
  return `${numberInBanglaWords(value)} টাকা মাত্র`
}

/** ASCII digits as Bangla digits; everything else untouched. */
export function toBanglaDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => BANGLA_DIGITS[Number(digit)])
}

/** Digits grouped the South Asian way: 1500000 → "15,00,000". */
export function groupSouthAsian(value: number): string {
  const digits = String(Math.floor(Math.abs(value)))
  if (digits.length <= 3) {
    return digits
  }
  const last = digits.slice(-3)
  const head = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return `${head},${last}`
}

/** "৳১৫,০০,০০০". */
export function formatTakaBangla(value: number): string {
  return `৳${toBanglaDigits(groupSouthAsian(value))}`
}

/**
 * What an amount box holds, from whatever was typed or pasted into it —
 * Bangla digits included, commas and the taka sign ignored. Null when there
 * are no digits at all, which is "not entered" rather than zero.
 */
export function parseAmountInput(raw: string): number | null {
  const ascii = raw.replace(/[০-৯]/g, (digit) => String(BANGLA_DIGITS.indexOf(digit)))
  const digits = ascii.replace(/\D/g, '')
  return digits === '' ? null : Number(digits)
}
