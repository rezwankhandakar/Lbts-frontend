import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BANGLA_UNDER_HUNDRED,
  formatTakaBangla,
  groupSouthAsian,
  numberInBanglaWords,
  parseAmountInput,
  takaInBanglaWords,
} from './taka-words.ts'

describe('taka in Bangla words', () => {
  it('has exactly one word for every number below a hundred', () => {
    assert.equal(BANGLA_UNDER_HUNDRED.length, 100)
    assert.equal(new Set(BANGLA_UNDER_HUNDRED).size, 100)
  })

  it('reads the irregular numbers from the table', () => {
    assert.equal(numberInBanglaWords(0), 'শূন্য')
    assert.equal(numberInBanglaWords(21), 'একুশ')
    assert.equal(numberInBanglaWords(99), 'নিরানব্বই')
  })

  it('counts in শত, হাজার, লক্ষ and কোটি', () => {
    assert.equal(numberInBanglaWords(100), 'একশত')
    assert.equal(numberInBanglaWords(1500), 'এক হাজার পাঁচশত')
    assert.equal(numberInBanglaWords(150_000), 'এক লক্ষ পঞ্চাশ হাজার')
    assert.equal(
      numberInBanglaWords(12_345_678),
      'এক কোটি তেইশ লক্ষ পঁয়তাল্লিশ হাজার ছয়শত আটাত্তর',
    )
  })

  it('tells apart the two amounts a slipped zero confuses', () => {
    assert.notEqual(numberInBanglaWords(15_000), numberInBanglaWords(150_000))
    assert.equal(numberInBanglaWords(15_000), 'পনেরো হাজার')
  })

  it('writes an amount the way a cheque does', () => {
    assert.equal(takaInBanglaWords(2500), 'দুই হাজার পাঁচশত টাকা মাত্র')
  })

  it('groups digits the South Asian way, in Bangla digits', () => {
    assert.equal(groupSouthAsian(999), '999')
    assert.equal(groupSouthAsian(1_500_000), '15,00,000')
    assert.equal(groupSouthAsian(12_345_678), '1,23,45,678')
    assert.equal(formatTakaBangla(1500), '৳১,৫০০')
  })

  it('reads typed amounts, Bangla digits and commas included', () => {
    assert.equal(parseAmountInput('১,৫০০'), 1500)
    assert.equal(parseAmountInput('৳ 2,500'), 2500)
    assert.equal(parseAmountInput('0'), 0)
    assert.equal(parseAmountInput(''), null)
    assert.equal(parseAmountInput('abc'), null)
  })
})
