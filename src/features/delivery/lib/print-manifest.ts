import { escapeHtml as escape, printHtml } from '@/lib/print-html'
import { shortTripNumber } from './delivery-meta'
import type { TripChallanRecord, TripLineRecord, TripRecord } from '../types'

/**
 * Printing a trip's manifest — the sheet the driver carries and the gate
 * checks the load against.
 *
 * HTML in an off-screen frame (`lib/print-html.ts`) rather than a PDF, because
 * customer names and addresses on a challan are often Bangla. Every value is
 * escaped.
 */

const FRAME_ID = 'lbts-manifest-frame'

const DAY = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function day(value: string | null): string {
  return value ? DAY.format(new Date(`${value.slice(0, 10)}T00:00:00.000Z`)) : '—'
}

const MARK: Record<string, string> = {
  split: 'part',
  reduced: 'cut',
  increased: 'more',
  substituted: 'replaced',
  added: 'added',
}

function line(entry: TripLineRecord): string {
  const mark = MARK[entry.change]
  const note =
    entry.change === 'substituted' && entry.source
      ? ` for ${escape(entry.source.model)}`
      : (entry.change === 'split' || entry.change === 'reduced') && entry.source
        ? ` of ${entry.source.qty}`
        : ''

  return `<div class="line"><span>${escape(entry.productName)} <span class="mono">${escape(
    entry.model,
  )}</span>${mark ? ` <em>(${mark}${note})</em>` : ''}</span><strong>${entry.qty}</strong></div>`
}

function row(challan: TripChallanRecord, index: number): string {
  const thana = challan.thana || challan.location?.thana || '—'
  const district = challan.district || challan.location?.district || '—'
  const where = `Thana: ${thana} · District: ${district}`

  return `<tr>
    <td class="num">${index + 1}</td>
    <td><div class="mono strong">${escape(challan.challanNumber)}</div><div class="muted">SL ${challan.slNumber}</div></td>
    <td><div class="strong">${escape(challan.customerName)}</div><div>${escape(
      challan.deliveryAddress,
    )}</div><div class="muted">${escape(where)}</div><div>☎ ${escape(challan.receiverMobile)}</div>${
      challan.note ? `<div class="muted"><em>${escape(challan.note)}</em></div>` : ''
    }</td>
    <td>${challan.lines.map(line).join('')}</td>
    <td class="num strong">${challan.totalQty}</td>
    <td class="sign"></td>
  </tr>`
}

export function manifestHtml(trip: TripRecord): string {
  const challans = trip.challans ?? []

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escape(trip.tripNumber)} — Trip manifest</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 11px/1.4 system-ui, 'Segoe UI', 'Nirmala UI', 'Noto Sans Bengali', 'Vrinda', sans-serif; color: #111; }
  h1 { margin: 0; font-size: 18px; letter-spacing: -0.01em; }
  .mono { font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace; }
  .muted { color: #555; }
  .strong { font-weight: 600; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111; padding-bottom: 6px; }
  .parties { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 10px 0; }
  .parties div { border: 1px solid #ccc; border-radius: 4px; padding: 5px 7px; }
  .parties b { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; text-align: left; }
  th { background: #f1f1f1; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
  tr { page-break-inside: avoid; }
  .num { text-align: right; white-space: nowrap; }
  .sign { width: 90px; }
  .line { display: flex; justify-content: space-between; gap: 8px; }
  tfoot td { font-weight: 700; background: #f7f7f7; }
  .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 36px; }
  .signatures div { border-top: 1px solid #111; padding-top: 4px; text-align: center; color: #333; }
</style>
</head>
<body>
<header>
  <div><div class="muted">LBTS · Trip manifest</div><h1 class="mono">${escape(shortTripNumber(trip.tripNumber))}</h1></div>
  <div style="text-align:right"><div><b>Date:</b> ${day(trip.tripDate)}</div><div><b>Status:</b> ${escape(trip.status)}</div></div>
</header>
<section class="parties">
  <div><b>Vehicle</b><span class="mono strong">${escape(trip.vehicle.registrationNo)}</span><br/>${escape(trip.vehicle.vehicleCode)}</div>
  <div><b>Vendor</b>${escape(trip.vendor.name)}<br/>${escape(trip.vendor.vendorCode)} · ${escape(trip.vendor.mobile)}</div>
  <div><b>Driver</b>${escape(trip.driver.name)}<br/>${escape(trip.driver.mobile)}</div>
  <div><b>Licence</b>${escape(trip.driver.licenseNumber || '—')}<br/>${
    trip.driver.licenseExpiry ? `Expires ${day(trip.driver.licenseExpiry)}` : ''
  }</div>
</section>
<table>
  <thead><tr><th>#</th><th>Challan</th><th>Customer and delivery</th><th>Products</th><th class="num">Qty</th><th>Received by</th></tr></thead>
  <tbody>${challans.map(row).join('')}</tbody>
  <tfoot><tr><td colspan="4">${trip.challanCount} challan${trip.challanCount === 1 ? '' : 's'}</td><td class="num">${trip.totalQty}</td><td></td></tr></tfoot>
</table>
${trip.note ? `<p><b>Note:</b> ${escape(trip.note)}</p>` : ''}
<section class="signatures"><div>Driver</div><div>Gate / dispatch</div><div>Vendor</div></section>
</body>
</html>`
}

export function printManifest(trip: TripRecord): void {
  printHtml(manifestHtml(trip), FRAME_ID)
}
