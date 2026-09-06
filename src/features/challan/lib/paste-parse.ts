/**
 * Pulling field values out of a block of text pasted from the PDF.
 *
 * Assistive only, and the word matters. A Walton challan is not a structured
 * document — some are vector PDFs with a clean text layer, some are scans with
 * none at all, and the labels move between templates. So this never decides
 * anything: it fills fields that are still **empty**, and an operator who has
 * already typed a value keeps it. Nothing here is the source of truth, and a
 * value it guessed wrong is one the operator overwrites in the box in front of
 * them.
 *
 * It imports nothing, so `node --test` can load it directly.
 */

export interface ParsedChallanFields {
  customerName?: string
  deliveryAddress?: string
  thana?: string
  district?: string
  receiverMobile?: string
  senderMobile?: string
  zonePo?: string
  product?: string
  model?: string
  qty?: string
}

/**
 * Labels seen on the challans this was built against, lowercased.
 *
 * Longest match wins, which is what keeps "receiver mobile" from being read as
 * "mobile" and landing in the wrong field. Deliberately a plain list rather
 * than a regex per field: adding a template's wording later should be one line
 * and no thinking.
 */
const LABELS: [label: string, field: keyof ParsedChallanFields][] = [
  ['customer name', 'customerName'],
  ['customer', 'customerName'],
  ['client name', 'customerName'],
  ['name', 'customerName'],

  ['delivery address', 'deliveryAddress'],
  ['address', 'deliveryAddress'],

  ['thana', 'thana'],
  ['upazila', 'thana'],
  ['upazilla', 'thana'],
  ['police station', 'thana'],
  ['p.s', 'thana'],

  ['district', 'district'],
  ['zilla', 'district'],
  ['zila', 'district'],

  ['receiver mobile', 'receiverMobile'],
  ['receiver phone', 'receiverMobile'],
  ['receiver', 'receiverMobile'],
  ['customer mobile', 'receiverMobile'],
  ['mobile', 'receiverMobile'],
  ['phone', 'receiverMobile'],
  ['contact', 'receiverMobile'],
  ['cell', 'receiverMobile'],

  ['sender mobile', 'senderMobile'],
  ['sender phone', 'senderMobile'],
  ['sender', 'senderMobile'],

  ['zone / po', 'zonePo'],
  ['zone/po', 'zonePo'],
  ['zone', 'zonePo'],
  ['po no', 'zonePo'],
  ['po', 'zonePo'],

  ['product name', 'product'],
  ['product', 'product'],
  ['item', 'product'],
  ['description', 'product'],

  ['model no', 'model'],
  ['model', 'model'],

  ['quantity', 'qty'],
  ['qty', 'qty'],
  ['pcs', 'qty'],
]

/** Any Bangladeshi mobile written any of the usual ways. */
const MOBILE_ANYWHERE = /(?:\+?880|0)1[3-9]\d{8}/

/**
 * Splits a line into a label and a value, where it can.
 *
 * Colons first, because that is what a form-shaped challan uses; an em dash or
 * a run of two or more spaces is the fallback for a table that came out of the
 * text layer without them. A single space is deliberately not a separator —
 * "Customer Name ABC Electronics" would otherwise split at the first space and
 * produce nonsense.
 */
function splitLine(line: string): [label: string, value: string] | null {
  const colon = line.indexOf(':')
  if (colon > 0) {
    return [line.slice(0, colon), line.slice(colon + 1)]
  }

  const dash = /\s[–—]\s/.exec(line)
  if (dash?.index !== undefined && dash.index > 0) {
    return [line.slice(0, dash.index), line.slice(dash.index + dash[0].length)]
  }

  const gap = /\s{2,}/.exec(line)
  if (gap?.index !== undefined && gap.index > 0) {
    return [line.slice(0, gap.index), line.slice(gap.index + gap[0].length)]
  }

  return null
}

/** The field a label names, if any. Longest label wins. */
function fieldFor(label: string): keyof ParsedChallanFields | null {
  const cleaned = label
    .toLowerCase()
    .replace(/[^a-z0-9/. ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) {
    return null
  }

  let best: [string, keyof ParsedChallanFields] | null = null

  for (const [candidate, field] of LABELS) {
    if (
      cleaned === candidate ||
      cleaned.endsWith(' ' + candidate) ||
      cleaned.startsWith(candidate + ' ')
    ) {
      if (!best || candidate.length > best[0].length) {
        best = [candidate, field]
      }
    }
  }

  return best?.[1] ?? null
}

/** Quantities arrive as "2", "2 pcs", "x2" — only the number is wanted. */
function cleanQty(value: string): string | undefined {
  const digits = /\d+/.exec(value.replace(/[,\s]/g, ''))
  return digits ? digits[0] : undefined
}

/**
 * Reads what it can out of a pasted block.
 *
 * Returns only the fields it actually found; anything it is unsure about is
 * simply absent, which is what lets the caller merge without ever overwriting
 * something a person typed.
 */
export function parseChallanText(text: string): ParsedChallanFields {
  const found: ParsedChallanFields = {}

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  for (const line of lines) {
    const split = splitLine(line)
    if (!split) {
      continue
    }

    const field = fieldFor(split[0])
    const value = split[1].trim()

    if (!field || value.length === 0 || found[field] !== undefined) {
      // First occurrence wins: a challan that repeats a label later is
      // usually repeating it in a footer, not correcting it.
      continue
    }

    if (field === 'qty') {
      const qty = cleanQty(value)
      if (qty) {
        found.qty = qty
      }
      continue
    }

    found[field] = value
  }

  /**
   * A bare mobile number with no label at all is common on a delivery slip, so
   * it is worth one last look — but only when nothing labelled turned up, and
   * only for the receiver. Guessing which of two unlabelled numbers is the
   * sender is exactly the kind of confident wrongness this must not do.
   */
  if (found.receiverMobile === undefined) {
    const match = MOBILE_ANYWHERE.exec(text)
    if (match) {
      found.receiverMobile = match[0]
    }
  }

  return found
}

/**
 * What the parser found, minus anything the operator has already filled in.
 *
 * The merge direction is the whole safety property: a field with something in
 * it is never touched, so pasting a second time cannot overwrite a correction
 * somebody just made by hand.
 */
export function fieldsToFill(
  parsed: ParsedChallanFields,
  current: Record<string, string>,
): ParsedChallanFields {
  const result: ParsedChallanFields = {}

  for (const [key, value] of Object.entries(parsed) as [keyof ParsedChallanFields, string][]) {
    if (value && !current[key]?.trim()) {
      result[key] = value
    }
  }

  return result
}
