import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { fieldsToFill, parseChallanText } from './paste-parse.ts'

/**
 * The assistive paste parser.
 *
 * Two things are worth testing here, and they are not equally important. That
 * it reads a well-formed challan is nice. That it **never overwrites what an
 * operator typed** and never invents a value it is unsure about is the part
 * that decides whether this feature is safe to ship at all — a parser that
 * quietly replaces a corrected address is worse than no parser.
 */

const LABELLED = `
Customer Name: ABC Electronics Ltd.
Delivery Address: House 12, Road 4, Block C
Thana: Mirpur
District: Dhaka
Receiver Mobile: 01712345678
Sender Mobile: 01812345678
Zone / PO: Zone-7
Product: Refrigerator
Model: WFA-2D4-GDEH-XX
Quantity: 2
`

describe('reading a labelled challan', () => {
  it('finds every field it knows about', () => {
    const parsed = parseChallanText(LABELLED)

    assert.equal(parsed.customerName, 'ABC Electronics Ltd.')
    assert.equal(parsed.deliveryAddress, 'House 12, Road 4, Block C')
    assert.equal(parsed.thana, 'Mirpur')
    assert.equal(parsed.district, 'Dhaka')
    assert.equal(parsed.receiverMobile, '01712345678')
    assert.equal(parsed.senderMobile, '01812345678')
    assert.equal(parsed.zonePo, 'Zone-7')
    assert.equal(parsed.product, 'Refrigerator')
    assert.equal(parsed.model, 'WFA-2D4-GDEH-XX')
    assert.equal(parsed.qty, '2')
  })

  it('does not read "receiver mobile" as plain "mobile"', () => {
    // Longest match wins, or the receiver's number would land in whichever
    // field the shorter label happened to name.
    const parsed = parseChallanText('Receiver Mobile: 01712345678\nSender Mobile: 01812345678')
    assert.equal(parsed.receiverMobile, '01712345678')
    assert.equal(parsed.senderMobile, '01812345678')
  })

  it('reads a table that came out of the text layer without colons', () => {
    const parsed = parseChallanText('District     Dhaka\nModel — WFA-2D4-GDEH-XX')
    assert.equal(parsed.district, 'Dhaka')
    assert.equal(parsed.model, 'WFA-2D4-GDEH-XX')
  })

  it('takes only the number out of a quantity', () => {
    assert.equal(parseChallanText('Qty: 2 pcs').qty, '2')
    assert.equal(parseChallanText('Quantity : 12').qty, '12')
  })

  it('keeps the first value when a label appears twice', () => {
    // A repeated label is usually a footer, not a correction.
    const parsed = parseChallanText('District: Dhaka\nDistrict: Gazipur')
    assert.equal(parsed.district, 'Dhaka')
  })

  it('keeps a Bangla value exactly as pasted, for the converter to handle', () => {
    const parsed = parseChallanText('Customer Name: মোঃ আরিফ হোসেন\nThana: মিরপুর')
    assert.equal(parsed.customerName, 'মোঃ আরিফ হোসেন')
    assert.equal(parsed.thana, 'মিরপুর')
  })
})

describe('what it refuses to guess', () => {
  it('finds nothing in an unlabelled block rather than filling fields at random', () => {
    const parsed = parseChallanText('ABC Electronics Ltd.\nMirpur\nDhaka\nRefrigerator')
    assert.deepEqual(parsed, {})
  })

  it('does not split on a single space', () => {
    // "Customer Name ABC Electronics" would otherwise become label "Customer"
    // and value "Name ABC Electronics".
    assert.deepEqual(parseChallanText('Customer Name ABC Electronics'), {})
  })

  it('ignores a label with nothing after it', () => {
    assert.equal(parseChallanText('District:').district, undefined)
  })

  it('finds an unlabelled mobile number only as a last resort', () => {
    assert.equal(parseChallanText('Please call 01712345678').receiverMobile, '01712345678')

    // A labelled one wins, and the loose scan does not then overwrite it.
    const parsed = parseChallanText('Receiver: 01712345678\nalso 01999999999')
    assert.equal(parsed.receiverMobile, '01712345678')
  })

  it('returns nothing for an image-only page, which has no text at all', () => {
    assert.deepEqual(parseChallanText(''), {})
    assert.deepEqual(parseChallanText('   \n  \n'), {})
  })
})

describe('merging into a form', () => {
  it('fills only the fields that are still empty', () => {
    const parsed = parseChallanText(LABELLED)

    const toFill = fieldsToFill(parsed, {
      customerName: 'Already Corrected Ltd.',
      district: '',
      thana: '   ',
      qty: '5',
    })

    // Anything a person has typed survives, whitespace-only counts as empty.
    assert.equal(toFill.customerName, undefined)
    assert.equal(toFill.qty, undefined)
    assert.equal(toFill.district, 'Dhaka')
    assert.equal(toFill.thana, 'Mirpur')
  })

  it('offers nothing when the form is already complete', () => {
    const parsed = parseChallanText(LABELLED)
    const current = Object.fromEntries(
      Object.keys(parsed).map((key) => [key, 'typed by hand']),
    ) as Record<string, string>

    assert.deepEqual(fieldsToFill(parsed, current), {})
  })
})
