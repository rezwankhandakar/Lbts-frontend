import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { EMPTY_WEDGE, WEDGE_MAX_GAP_MS, feedWedge, normalizeScan } from './barcode-wedge.ts'
import type { WedgeState } from './barcode-wedge.ts'

/** Types a string as one burst `gap` ms apart, then Enter, and returns what came out. */
function type(text: string, gap: number, start = 1000): { codes: string[]; state: WedgeState } {
  let state = EMPTY_WEDGE
  const codes: string[] = []
  let at = start

  for (const key of [...text.split(''), 'Enter']) {
    const result = feedWedge(state, key, at)
    state = result.state
    if (result.code) {
      codes.push(result.code)
    }
    at += gap
  }

  return { codes, state }
}

describe('feedWedge', () => {
  it('turns a fast burst ending in Enter into a code', () => {
    assert.deepEqual(type('LBTS-CH-2026-000982', 8).codes, ['LBTS-CH-2026-000982'])
  })

  it('ignores the same characters typed at human speed', () => {
    assert.deepEqual(type('LBTS-CH-2026-000982', 140).codes, [])
  })

  it('ignores a burst too short to be a label', () => {
    assert.deepEqual(type('12', 5).codes, [])
  })

  it('does not stitch two slow halves into one scan', () => {
    let state = EMPTY_WEDGE
    for (const [key, at] of [
      ['1', 0],
      ['2', 5],
      ['3', 10],
      ['4', 400],
      ['5', 405],
      ['6', 410],
    ] as const) {
      state = feedWedge(state, key, at).state
    }

    assert.equal(state.buffer, '456')
    assert.equal(feedWedge(state, 'Enter', 415).code, null)
  })

  it('lets Shift through, which a scanner sends before capitals', () => {
    let state = EMPTY_WEDGE
    let at = 0
    for (const key of ['Shift', 'L', 'Shift', 'B', 'T', 'S', '1']) {
      state = feedWedge(state, key, (at += 5)).state
    }

    assert.equal(feedWedge(state, 'Enter', at + 5).code, 'LBTS1')
  })

  it('drops the buffer on a navigation key', () => {
    const state = feedWedge(feedWedge(EMPTY_WEDGE, 'A', 0).state, 'ArrowDown', 5).state
    assert.equal(state.buffer, '')
  })

  it('refuses an Enter that arrives long after the burst', () => {
    let state = EMPTY_WEDGE
    for (const [index, key] of [...'12345'].entries()) {
      state = feedWedge(state, key, index * 5).state
    }

    assert.equal(feedWedge(state, 'Enter', 20 + WEDGE_MAX_GAP_MS + 100).code, null)
  })
})

describe('normalizeScan', () => {
  it('cleans case and stray spaces the way the server does', () => {
    assert.equal(normalizeScan('  lbts-ch-2026-000982 \n'), 'LBTS-CH-2026-000982')
  })
})
