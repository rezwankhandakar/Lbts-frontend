/**
 * Code 128 (subset B), as bar and space widths — and as an SVG a printed sheet
 * can carry.
 *
 * A **deliberate mirror** of `LBTS-Backend/src/modules/challan/lib/code128.ts`,
 * in the same spirit as every Zod shape this codebase mirrors rather than
 * shares: the backend draws a challan's barcode into a PDF with pdf-lib, and
 * the browser draws a trip's into the HTML manifest it prints itself. Neither
 * app can import the other's file, and the one thing that must never drift is
 * the symbol table — so `code128.test.ts` pins this encoder against the same
 * hand-worked arithmetic the backend's test uses. Change one, change both.
 *
 * Pure and import-free, so `node --test` loads it directly.
 *
 * Subset B only, for the reason the backend gives: a mode switch is a place
 * for a subtle encoding bug to hide, the saving on a trip number is a few
 * millimetres, and a barcode is one of the few things here that is either
 * exactly right or worthless.
 */

/**
 * The 107 symbol patterns, as element widths in modules. Each is six elements
 * — bar, space, bar, space, bar, space — beginning with a bar and summing to
 * 11 modules; the stop pattern is the exception at seven elements and 13.
 *
 * Index 0-102 are data values, 103-105 the three start codes, 106 the stop.
 */
const PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312',
  '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222',
  '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131',
  '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321',
  '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121',
  '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321',
  '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224',
  '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114',
  '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112',
  '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113',
  '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412',
  '211214', '211232', '2331112',
] as const

const START_B = 104
const STOP = 106

/** Subset B encodes printable ASCII as codepoint minus 32. */
const MIN_CODE = 32
const MAX_CODE = 127

export class BarcodePayloadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BarcodePayloadError'
  }
}

/**
 * One element of the symbol: a run of `width` modules that is either ink or
 * paper. Bars and spaces alternate strictly, always starting on a bar, so a
 * renderer can walk the list and only draw the ones marked as bars.
 */
export interface BarcodeElement {
  width: number
  isBar: boolean
}

export interface Barcode128 {
  /** What was encoded, unchanged — printed under the bars for a human. */
  value: string
  /** The symbol values, start and check and stop included, for testing. */
  codes: number[]
  /** Modulo-103 check character, which every scanner recomputes. */
  checksum: number
  elements: BarcodeElement[]
  /** Total width in modules, quiet zones excluded. */
  moduleCount: number
}

/**
 * Encodes one string as a Code 128-B symbol.
 *
 * Throws rather than substituting a character it cannot encode: a barcode that
 * silently scans as something other than the number printed beside it is worse
 * than a sheet that refused to print and said so.
 */
export function encodeCode128B(value: string): Barcode128 {
  if (value.length === 0) {
    throw new BarcodePayloadError('A barcode needs a value to encode.')
  }

  const codes: number[] = [START_B]

  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0

    if (codePoint < MIN_CODE || codePoint > MAX_CODE) {
      throw new BarcodePayloadError(
        `Code 128-B cannot encode ${JSON.stringify(character)} in "${value}".`,
      )
    }

    codes.push(codePoint - MIN_CODE)
  }

  /**
   * The check character: the start code plus every data value weighted by its
   * one-based position, modulo 103. Getting the weighting wrong produces a
   * symbol that looks perfect and scans as nothing, which is why the codes are
   * exposed above for a test to assert on.
   */
  let sum = START_B
  for (let index = 1; index < codes.length; index += 1) {
    sum += codes[index] * index
  }

  const checksum = sum % 103
  codes.push(checksum, STOP)

  const elements: BarcodeElement[] = []
  let moduleCount = 0

  for (const code of codes) {
    const pattern = PATTERNS[code]
    for (let index = 0; index < pattern.length; index += 1) {
      const width = Number(pattern[index])
      // Every pattern starts on a bar and alternates from there.
      elements.push({ width, isBar: index % 2 === 0 })
      moduleCount += width
    }
  }

  return { value, codes, checksum, elements, moduleCount }
}

/**
 * The narrowest bar a scanner can still measure, in millimetres.
 *
 * Code 128 is read by *measuring bar widths* against each other, so shrinking
 * the symbol shrinks the module, and past a point a reader starts guessing.
 * The same floor the Challan back page holds itself to.
 */
export const MIN_MODULE_WIDTH_MM = 0.32

/**
 * What a module is actually drawn at, with a little air above the floor.
 *
 * The floor is where a scanner starts guessing; this is where a sheet prints,
 * so that a creased page, a tired toner cartridge or a printer that scales to
 * its own margins does not eat the whole of the margin at once.
 */
export const PRINT_MODULE_WIDTH_MM = 0.34

/** Quiet zone, in modules, either side of the symbol. The standard asks 10. */
export const QUIET_MODULES = 10

export interface BarcodeMetrics {
  moduleCount: number
  /** Module width in millimetres at the requested drawn width. */
  moduleWidthMm: number
}

/**
 * What a symbol drawn `widthMm` wide actually comes to.
 *
 * Kept separate from the renderer so "make the barcode smaller" is a change
 * somebody can evaluate before a barcode fails to scan at a gate six weeks
 * later, rather than after.
 */
export function barcodeMetrics(value: string, widthMm: number): BarcodeMetrics {
  const { moduleCount } = encodeCode128B(value)

  return { moduleCount, moduleWidthMm: widthMm / (moduleCount + QUIET_MODULES * 2) }
}

/**
 * How wide a symbol has to be drawn for its bars to stay measurable.
 *
 * The width follows the payload rather than the other way round, and that is
 * the whole point of this function. A fixed width is the brittle version: a
 * trip number one vendor code longer is four more symbols, the modules inside
 * a fixed box get narrower to fit, and the sheet prints a barcode that looks
 * exactly like the ones that work and scans as nothing. So a longer number
 * takes a wider strip, and the sheet lays out around it.
 */
export function barcodeWidthMm(value: string, moduleWidthMm = PRINT_MODULE_WIDTH_MM): number {
  const { moduleCount } = encodeCode128B(value)

  return (moduleCount + QUIET_MODULES * 2) * moduleWidthMm
}

export interface BarcodeSvgOptions {
  /** Drawn width including both quiet zones, in millimetres. */
  widthMm: number
  /** Bar height in millimetres. */
  heightMm: number
}

/**
 * The symbol as an inline `<svg>`, sized in millimetres.
 *
 * Millimetres rather than pixels because this is only ever printed: a scanner
 * measures ink on paper, and a width in CSS pixels is one the print pipeline is
 * free to reinterpret. The bars are rectangles in a module-wide `viewBox`, so
 * they stay vector geometry at whatever resolution the printer has — the same
 * reasoning behind the backend drawing rectangles into a PDF rather than
 * embedding a bitmap.
 *
 * The quiet zones are inside the drawn box, so a caller cannot accidentally
 * butt the symbol against a border and make it unreadable.
 *
 * The value is not printed here: the sheet prints it beside the bars itself,
 * where it can be laid out with the rest of the header.
 */
export function barcodeSvg(value: string, { widthMm, heightMm }: BarcodeSvgOptions): string {
  const { elements, moduleCount } = encodeCode128B(value)
  const total = moduleCount + QUIET_MODULES * 2

  let cursor = QUIET_MODULES
  const bars: string[] = []

  for (const element of elements) {
    if (element.isBar) {
      bars.push(`<rect x="${cursor}" y="0" width="${element.width}" height="${total}" />`)
    }
    cursor += element.width
  }

  // The viewBox is square in modules and the drawn element is not, so the bars
  // are full height inside it and `preserveAspectRatio="none"` stretches them
  // to whatever height the sheet asked for. Only bar *width* has to be exact.
  return `<svg class="barcode" width="${widthMm}mm" height="${heightMm}mm" viewBox="0 0 ${total} ${total}" preserveAspectRatio="none" shape-rendering="crispEdges" fill="#000">${bars.join(
    '',
  )}</svg>`
}
