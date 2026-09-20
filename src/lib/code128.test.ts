import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BarcodePayloadError,
  MIN_MODULE_WIDTH_MM,
  barcodeMetrics,
  barcodeSvg,
  barcodeWidthMm,
  encodeCode128B,
} from './code128.ts'

/**
 * The browser's half of Code 128.
 *
 * This file is a mirror of the backend encoder, so the assertions are the same
 * hand-worked arithmetic its test uses — deliberately *not* a comparison
 * against a second copy of the implementation, which would only prove the two
 * agree about whatever they both got wrong. If these numbers ever have to
 * change, the backend's have to change with them.
 *
 * The SVG assertions are about the one thing a renderer can silently destroy:
 * the width of the narrowest bar. A scanner reads Code 128 by measuring bars
 * against each other, and a symbol shrunk past the module floor scans as
 * nothing while looking perfectly fine on the sheet.
 */

describe('Code 128-B', () => {
  it('encodes a single character with the checksum the standard specifies', () => {
    // "A" is codepoint 65, so its Code B value is 65 - 32 = 33.
    // Checksum = (START_B + 33 * 1) mod 103 = (104 + 33) mod 103 = 34.
    const symbol = encodeCode128B('A')
    assert.deepEqual(symbol.codes, [104, 33, 34, 106])
    assert.equal(symbol.checksum, 34)
  })

  it('weights each data value by its position, not just sums them', () => {
    // "LBTS": L=44, B=34, T=52, S=51.
    // 104 + 44*1 + 34*2 + 52*3 + 51*4 = 104 + 44 + 68 + 156 + 204 = 576.
    // 576 mod 103 = 61.
    const symbol = encodeCode128B('LBTS')
    assert.deepEqual(symbol.codes, [104, 44, 34, 52, 51, 61, 106])
    assert.equal(symbol.checksum, 61)
  })

  it('emits eleven modules per symbol, and thirteen for the stop', () => {
    const symbol = encodeCode128B('LBTS')
    // Six 11-module symbols (start, four data, check) plus the 13-module stop.
    assert.equal(symbol.moduleCount, 6 * 11 + 13)
  })

  it('starts on a bar and alternates strictly from there', () => {
    const symbol = encodeCode128B('V-0007-TRIP-0012')
    assert.equal(symbol.elements[0].isBar, true)

    for (let index = 1; index < symbol.elements.length; index += 1) {
      // A run of two bars would merge into one wide bar and destroy the symbol.
      assert.notEqual(
        symbol.elements[index].isBar,
        symbol.elements[index - 1].isBar,
        `element ${index} repeats the previous element's kind`,
      )
    }
  })

  it('ends on a bar, as the stop pattern requires', () => {
    const symbol = encodeCode128B('V-0007-TRIP-0012')
    assert.equal(symbol.elements[symbol.elements.length - 1].isBar, true)
  })

  it('gives two trips two different symbols', () => {
    assert.notDeepEqual(
      encodeCode128B('V-0007-TRIP-0012').codes,
      encodeCode128B('V-0007-TRIP-0013').codes,
    )
  })

  it('refuses a payload it cannot encode rather than substituting a character', () => {
    assert.throws(() => encodeCode128B('ঢাকা'), BarcodePayloadError)
    assert.throws(() => encodeCode128B(''), BarcodePayloadError)
  })
})

describe('barcodeSvg', () => {
  const TRIP = 'V-0007-TRIP-0012'
  const WIDTH_MM = barcodeWidthMm(TRIP)

  it('keeps the narrowest bar above what a scanner can measure', () => {
    // Every trip number the counter can produce, not just the short one: a
    // vendor past V-9999 or a vendor past its thousandth trip is longer, and
    // the width has to follow it rather than squeezing the modules.
    for (const value of ['V-0001-TRIP-0001', TRIP, 'V-00012-TRIP-00123', 'V-000123-TRIP-000456']) {
      const { moduleWidthMm } = barcodeMetrics(value, barcodeWidthMm(value))
      assert.ok(
        moduleWidthMm >= MIN_MODULE_WIDTH_MM,
        `${value}: ${moduleWidthMm}mm modules are below the ${MIN_MODULE_WIDTH_MM}mm floor`,
      )
    }
  })

  it('takes a wider strip for a longer number rather than a narrower bar', () => {
    assert.ok(barcodeWidthMm('V-00012-TRIP-00123') > barcodeWidthMm(TRIP))
  })

  it('draws one rectangle per bar and no rectangle per space', () => {
    const symbol = encodeCode128B(TRIP)
    const bars = symbol.elements.filter((element) => element.isBar).length
    const svg = barcodeSvg(TRIP, { widthMm: WIDTH_MM, heightMm: 10 })

    assert.equal(svg.split('<rect').length - 1, bars)
  })

  it('leaves a quiet zone inside the drawn box at both ends', () => {
    const { moduleCount } = encodeCode128B(TRIP)
    const svg = barcodeSvg(TRIP, { widthMm: WIDTH_MM, heightMm: 10 })
    const total = moduleCount + 20

    // The viewBox carries the symbol plus ten modules of paper either side, so
    // the first bar cannot start at zero and the last cannot reach the edge.
    assert.match(svg, new RegExp(`viewBox="0 0 ${total} ${total}"`))
    assert.match(svg, /<rect x="10"/)
  })

  it('is sized in millimetres, because a scanner measures ink on paper', () => {
    const svg = barcodeSvg(TRIP, { widthMm: WIDTH_MM, heightMm: 10 })
    assert.match(svg, new RegExp(`width="${WIDTH_MM}mm"`))
    assert.match(svg, /height="10mm"/)
  })
})
