import { shortTripNumber } from '@/features/delivery/lib/delivery-meta'
import { escapeHtml as escape, printHtml } from '@/lib/print-html'
import { BLANK, formatNumber, formatSmartDateTime } from '@/lib/format'
import { countOf, t } from '@/lib/i18n'
import { takaInBanglaWords } from '@/lib/taka-words'
import type { EntryRecord, VendorBillChallan, VendorBillDetail, VendorBillTrip } from '../types'
import { formatDay, signedTaka, taka, vendorStatusMeta } from './accounts-meta'

/**
 * A vendor's month on paper — the statement handed over with the payment, or
 * sent when the vendor asks how the figure was reached.
 *
 * It is built from exactly what the vendor bill page reads (`VendorBillDetail`)
 * and nothing else, so the sheet can never say something the page does not:
 * every trip with its rent, labour bill and the advance paid against it, the
 * payments made for the month, and the same sum the page's hero
 * writes out — rent plus labour, less advances, less paid.
 *
 * A trip whose bill has not been entered prints "Not entered" rather than a
 * zero, and the sheet says how many there are, because a blank bill is the one
 * way a month can look paid when it is not.
 */

/**
 * The page has no margin of its own, because a browser prints its header and
 * footer — the page URL, the title, the date — inside the page margin, and
 * leaves them off when there is none. The margin is put back inside the sheet:
 * side padding on the body, and an empty header and footer row on an outer
 * table, which the browser repeats at the top and bottom of every page.
 */
const FRAME_ID = 'lbts-vendor-statement-frame'

function amountOrBlank(value: number | null): string {
  return value === null
    ? `<span class="blank">${escape(t('accounts.vendorBill.statement.notEntered'))}</span>`
    : taka(value)
}

/**
 * One line per challan: the district and thana it went to.
 * A trip usually carries several deliveries to different places, and the
 * vendor's rent is argued over by where the lorry actually went.
 */
function places(challans: VendorBillChallan[]): string {
  if (challans.length === 0) {
    return BLANK
  }
  return challans
    .map(
      (challan) =>
        `<div class="place">${escape(challan.district || BLANK)} / ${escape(
          challan.thana || BLANK,
        )}</div>`,
    )
    .join('')
}

function tripRow(trip: VendorBillTrip, index: number): string {
  return `<tr>
    <td class="num">${formatNumber(index + 1)}</td>
    <td class="nowrap">${formatDay(trip.tripDate)}</td>
    <td class="mono nowrap">${escape(shortTripNumber(trip.tripNumber))}</td>
    <td>${escape(trip.registrationNo)}</td>
    <td>${escape(trip.driverName)}</td>
    <td>${places(trip.challans)}</td>
    <td class="num">${formatNumber(trip.challanCount)}</td>
    <td class="num">${formatNumber(trip.totalQty)}</td>
    <td class="num">${amountOrBlank(trip.tripRent)}</td>
    <td class="num">${amountOrBlank(trip.labourBill)}</td>
    <td class="num strong">${taka(trip.bill)}</td>
    <td class="num">${trip.advance > 0 ? taka(trip.advance) : BLANK}</td>
    <td class="num strong">${signedTaka(trip.net)}</td>
  </tr>`
}

function tripTable(detail: VendorBillDetail): string {
  const { trips, figures } = detail
  if (trips.length === 0) {
    return `<p class="empty">${escape(t('accounts.vendorBill.statement.noTrip'))}</p>`
  }

  return `<table class="trips">
    <thead><tr>
      <th class="num">${escape(t('accounts.vendorBill.statement.colNumber'))}</th>
      <th>${escape(t('accounts.vendorBill.statement.colDate'))}</th>
      <th>${escape(t('accounts.vendorBill.statement.colTrip'))}</th>
      <th>${escape(t('accounts.vendorBill.statement.colVehicle'))}</th>
      <th>${escape(t('accounts.vendorBill.statement.colDriver'))}</th>
      <th>${escape(t('accounts.vendorBill.statement.colPlaces'))}</th>
      <th class="num" title="${escape(t('accounts.vendorBill.statement.colChallansTitle'))}">${escape(
        t('accounts.vendorBill.statement.colChallans'),
      )}</th>
      <th class="num">${escape(t('accounts.vendorBill.statement.colQty'))}</th>
      <th class="num">${escape(t('accounts.vendorBill.statement.colTripRent'))}</th>
      <th class="num">${escape(t('accounts.vendorBill.statement.colLabour'))}</th>
      <th class="num">${escape(t('accounts.vendorBill.statement.colBill'))}</th>
      <th class="num">${escape(t('accounts.vendorBill.statement.colAdvance'))}</th>
      <th class="num">${escape(t('accounts.vendorBill.statement.colNet'))}</th>
    </tr></thead>
    <tbody>${trips.map(tripRow).join('')}</tbody>
    <tfoot><tr>
      <td colspan="6">${escape(countOf(trips.length, 'nouns.trip', t))}</td>
      <td class="num">${formatNumber(
        trips.reduce((sum, trip) => sum + trip.challanCount, 0),
      )}</td>
      <td class="num">${formatNumber(trips.reduce((sum, trip) => sum + trip.totalQty, 0))}</td>
      <td class="num">${taka(figures.tripRent)}</td>
      <td class="num">${taka(figures.labourBill)}</td>
      <td class="num">${taka(figures.totalBill)}</td>
      <td class="num">${taka(figures.advance)}</td>
      <td class="num">${signedTaka(figures.totalBill - figures.advance)}</td>
    </tr></tfoot>
  </table>`
}

function paymentTable(entries: EntryRecord[], empty: string): string {
  if (entries.length === 0) {
    return `<p class="empty">${escape(empty)}</p>`
  }

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0)
  const rows = entries
    .map(
      (entry) => `<tr>
        <td class="nowrap">${formatDay(entry.date)}</td>
        <td class="mono nowrap">${escape(entry.entryNumber)}</td>
        <td>${escape(entry.wallet?.name ?? BLANK)}</td>
        <td>${escape(entry.party || BLANK)}${
          entry.reference
            ? `<div class="muted">${escape(
                t('accounts.vendorBill.statement.reference', { value: entry.reference }),
              )}</div>`
            : ''
        }${
          entry.note ? `<div class="muted">${escape(entry.note)}</div>` : ''
        }</td>
        <td class="num">${taka(entry.amount)}</td>
      </tr>`,
    )
    .join('')

  return `<table>
    <thead><tr>
      <th>${escape(t('accounts.vendorBill.statement.colDate'))}</th>
      <th>${escape(t('accounts.vendorBill.statement.colEntry'))}</th>
      <th>${escape(t('accounts.vendorBill.statement.colPaidFrom'))}</th>
      <th>${escape(t('accounts.vendorBill.statement.colReceivedBy'))}</th>
      <th class="num">${escape(t('accounts.vendorBill.statement.colAmount'))}</th>
    </tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="4">${escape(
      countOf(entries.length, 'nouns.entry', t),
    )}</td><td class="num">${taka(total)}</td></tr></tfoot>
  </table>`
}

export function vendorStatementHtml(
  detail: VendorBillDetail,
  printedAt: Date = new Date(),
): string {
  const { vendor, period, figures, allTime } = detail
  const overpaid = figures.due < 0
  const owed = Math.abs(figures.due)

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escape(
  t('accounts.vendorBill.statement.documentTitle', { vendor: vendor.name, period: period.label }),
)}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0 12mm; font: 10.5px/1.4 system-ui, 'Segoe UI', 'Nirmala UI', 'Noto Sans Bengali', 'Vrinda', sans-serif; color: #111; }
  h1 { margin: 0; font-size: 18px; letter-spacing: -0.01em; }
  h2 { margin: 14px 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
  .mono { font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace; }
  .muted { color: #555; }
  .strong { font-weight: 600; }
  .nowrap { white-space: nowrap; }
  .place + .place { border-top: 1px dotted #ccc; }
  .blank { color: #9a5b00; font-style: italic; }
  header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; border-bottom: 2px solid #111; padding-bottom: 6px; }
  .parties { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 6px; margin: 10px 0; }
  .parties div { border: 1px solid #ccc; border-radius: 4px; padding: 5px 7px; }
  .parties b { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; }
  .sum { display: grid; grid-template-columns: repeat(5, 1fr); border: 1px solid #bbb; border-radius: 4px; overflow: hidden; }
  .sum div { padding: 6px 8px; border-right: 1px solid #bbb; }
  .sum div:last-child { border-right: 0; background: #f1f1f1; }
  .sum b { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; color: #555; font-weight: 600; }
  .sum span { font-size: 14px; font-weight: 700; }
  .words { margin: 5px 0 0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #bbb; padding: 3px 5px; vertical-align: top; text-align: left; }
  th { background: #f1f1f1; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; }
  tr { page-break-inside: avoid; }
  table.sheet > * > tr > td { border: 0; padding: 0; background: none; font-weight: normal; }
  table.sheet > tbody > tr { page-break-inside: auto; }
  .gap { height: 12mm; }
  table.trips { font-size: 9.5px; }
  table.trips th, table.trips td { padding: 3px 4px; }
  .num { text-align: right; white-space: nowrap; }
  tfoot td { font-weight: 700; background: #f7f7f7; }
  .empty { margin: 0; padding: 8px; border: 1px dashed #bbb; color: #555; text-align: center; }
  .warning { margin: 8px 0 0; padding: 5px 8px; border: 1px solid #d9a441; background: #fff7e6; border-radius: 4px; }
  .position { margin-top: 12px; color: #333; }
  .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 44px; page-break-inside: avoid; }
  .signatures div { border-top: 1px solid #111; padding-top: 4px; text-align: center; color: #333; }
  footer { margin-top: 14px; font-size: 9px; color: #777; }
</style>
</head>
<body>
<table class="sheet">
<thead><tr><td class="gap"></td></tr></thead>
<tfoot><tr><td class="gap"></td></tr></tfoot>
<tbody><tr><td>
<header>
  <div><div class="muted">${escape(t('accounts.vendorBill.statement.brand'))}</div><h1>${escape(
    t('accounts.vendorBill.statement.title'),
  )}</h1></div>
  <div style="text-align:right"><div><b>${escape(t('accounts.vendorBill.statement.month'))}</b> ${escape(
    period.label,
  )}</div><div><b>${escape(t('accounts.vendorBill.statement.status'))}</b> ${escape(
    vendorStatusMeta(figures.status, t).label,
  )}</div></div>
</header>

<section class="parties">
  <div><b>${escape(t('accounts.vendorBill.statement.vendor'))}</b><span class="strong">${escape(
    vendor.name,
  )}</span></div>
  <div><b>${escape(t('accounts.vendorBill.statement.vendorCode'))}</b><span class="mono">${escape(
    vendor.vendorCode,
  )}</span></div>
  <div><b>${escape(t('accounts.vendorBill.statement.mobile'))}</b>${escape(vendor.mobile || BLANK)}</div>
</section>

<section class="sum">
  <div><b>${escape(t('accounts.vendorBill.statement.tripRent'))}</b><span>${taka(figures.tripRent)}</span></div>
  <div><b>${escape(t('accounts.vendorBill.statement.plusLabour'))}</b><span>${taka(figures.labourBill)}</span></div>
  <div><b>${escape(t('accounts.vendorBill.statement.lessAdvances'))}</b><span>${taka(figures.advance)}</span></div>
  <div><b>${escape(t('accounts.vendorBill.statement.lessPaid'))}</b><span>${taka(figures.paid)}</span></div>
  <div><b>${escape(
    t(overpaid ? 'accounts.vendorBill.statement.equalsOverpaid' : 'accounts.vendorBill.statement.equalsDue'),
  )}</b><span>${taka(owed)}</span></div>
</section>
<p class="words"><b>${escape(t('accounts.vendorBill.statement.inWords'))}</b> ${escape(
  takaInBanglaWords(owed),
)}${overpaid ? escape(t('accounts.vendorBill.statement.overpaidSuffix')) : ''}</p>
${
  figures.blankBills > 0
    ? `<p class="warning"><b>${escape(t('accounts.vendorBill.statement.note'))}</b> ${escape(
        t('accounts.vendorBill.statement.blankBillsWarning', { count: figures.blankBills }),
      )}</p>`
    : ''
}

<h2>${escape(t('accounts.vendorBill.statement.tripsHeading', { period: period.label }))}</h2>
${tripTable(detail)}

<h2>${escape(t('accounts.vendorBill.statement.paymentsHeading', { period: period.label }))}</h2>
${paymentTable(detail.payments, t('accounts.vendorBill.statement.nothingPaid'))}

<p class="position"><b>${escape(t('accounts.vendorBill.statement.accountToDate'))}</b> ${escape(
  t('accounts.vendorBill.statement.accountBilled', { amount: taka(allTime.totalBill) }),
)} · ${escape(
  t('accounts.vendorBill.statement.accountSettled', { amount: taka(allTime.advance + allTime.paid) }),
)} · ${escape(
  allTime.due < 0
    ? t('accounts.vendorBill.statement.accountOverpaid', { amount: taka(-allTime.due) })
    : t('accounts.vendorBill.statement.accountDue', { amount: taka(allTime.due) }),
)}</p>

<section class="signatures"><div>${escape(t('accounts.vendorBill.statement.preparedBy'))}</div><div>${escape(
  t('accounts.vendorBill.statement.approvedBy'),
)}</div><div>${escape(t('accounts.vendorBill.statement.receivedByVendor'))}</div></section>
<footer>${escape(t('accounts.vendorBill.statement.printedAt', { when: formatSmartDateTime(printedAt.toISOString()) }))}</footer>
</td></tr></tbody>
</table>
</body>
</html>`
}

export function printVendorStatement(detail: VendorBillDetail): void {
  printHtml(vendorStatementHtml(detail), FRAME_ID)
}
