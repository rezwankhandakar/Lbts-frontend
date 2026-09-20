import { barcodeSvg, barcodeWidthMm } from '@/lib/code128'
import { escapeHtml as escape, printHtml } from '@/lib/print-html'
import { tallyProducts } from './cart'
import { shortTripNumber, taka } from './delivery-meta'
import type { TripChallanRecord, TripLineRecord, TripRecord } from '../types'

/**
 * Printing a trip's manifest — the sheet the driver carries, the gate checks
 * the load against, and the office writes on when the lorry comes back.
 *
 * HTML in an off-screen frame (`lib/print-html.ts`) rather than a PDF, because
 * customer names and addresses on a challan are often Bangla and pdf-lib has
 * no complex-script shaping. Every value is escaped.
 *
 * Three things shape the sheet, and all three come from what happens to the
 * paper rather than from what the record contains.
 *
 * **It is written on.** The lorry's rent and its labour bill are agreed at the
 * end of the day, often on this sheet, so they are ruled boxes near the top
 * rather than absent — the figures are collected on the paper already in
 * somebody's hand and typed in afterwards against `PATCH /deliveries/:id/bill`.
 * Each delivery gets a Note column for the same reason. Anything already
 * recorded prints inside its own box, so reprinting a finished trip reads as a
 * record rather than as a blank form.
 *
 * **It is scanned.** The barcode at the top carries the trip number, so the
 * sheet that comes back from the lorry opens its own trip — see
 * `hooks/use-trip-scan.ts` for the other half.
 *
 * **It is punched and filed.** Which is why the left gutter is wide enough for
 * a two-hole punch to cut into blank paper, and why the marks are drawn where
 * those holes will land — see `punchGuide`.
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

/** The bar height. The width follows the trip number — see `barcodeWidthMm`. */
const BARCODE_HEIGHT_MM = 9

/**
 * Where the punch goes, and the gutter kept clear for it.
 *
 * A hole is 6mm across and cut 12mm in from the edge the sheet is fed against,
 * so it spans 9mm to 15mm. That is not a choice — it is a measurement of the
 * tool, and the reason it is written down here is the **gutter**. The sheet's
 * side padding was 10mm, so a punched manifest lost the first few millimetres
 * of every SL number down the page, and nothing on screen would ever have
 * shown it. The left padding is therefore the hole's far edge plus room to
 * spare, and the marks are drawn where the holes will land — a guide for lining
 * the sheet up, and a standing check that the gutter is still wide enough to
 * punch into.
 */
const PUNCH_HOLE_MM = 6
const PUNCH_FROM_EDGE_MM = 12

/** The hole's far edge, plus room to spare, so a punch never reaches the text. */
const PUNCH_GUTTER_MM = PUNCH_FROM_EDGE_MM + PUNCH_HOLE_MM / 2 + 5

/** A4 portrait, which `@page` fixes. */
const PAGE_HEIGHT_MM = 297

/**
 * ISO 838 — a ring binder's spacing — puts two holes 80mm apart and centred on
 * the sheet, and the **first** mark still sits where that pair's upper hole
 * falls. It is only the first: this operation files a manifest on a two-pin
 * tag rather than in a binder, and those pins are half an inch apart.
 */
const ISO_838_SPACING_MM = 80
const PUNCH_FIRST_FROM_TOP_MM = PAGE_HEIGHT_MM / 2 - ISO_838_SPACING_MM / 2

/**
 * Half an inch below the first, which is what the file this sheet goes into
 * wants.
 *
 * Deliberately not the 80mm above: a spacing is a measurement of whatever the
 * paper is fastened into, and the two are different tools. This one came off
 * the printed sheet and the file it was offered up to, which is the only place
 * a number like this can honestly come from.
 */
const PUNCH_SPACING_MM = 12.7

/**
 * The two punch marks: a short rule in from the **paper's own edge**, ending
 * exactly where the hole will be cut.
 *
 * It was a dashed circle drawn around the hole position, and a tick is the
 * better mark for two reasons. It is the edge a punch registers against, so a
 * rule starting there is measured from the same thing the tool is; and the
 * first 15mm of the sheet disappears into the punch throat, so a ring printed
 * inside that band is hidden at the moment somebody wants to look at it. The
 * tick runs from the edge to the hole centre, which means **where it stops is
 * where the hole lands** — the mark states the measurement rather than
 * decorating it.
 *
 * Page one only, and deliberately: an absolutely positioned mark sits at one
 * offset in one flow, and the techniques that would repeat it on every printed
 * page — `position: fixed`, a running element — are honoured by some browsers
 * and quietly ignored by others, which would mean a mark that is *sometimes*
 * in the right place. A guide that is occasionally wrong is worse than one that
 * is only on the top sheet, because a stack is squared up and punched together
 * against the same edge anyway. What protects every page rather than the first
 * is the gutter, which is layout and cannot drift.
 *
 * All of this assumes the sheet prints at **actual size**. A browser set to
 * scale to the printer's own margins shrinks the page toward its top-left
 * corner, and the marks travel with it while the punch does not move — so if
 * the printed marks sit above where the punch wants to cut, that is the scale
 * setting rather than these numbers.
 */
function punchGuide(): string {
  return [0, PUNCH_SPACING_MM]
    .map(
      (offset) =>
        `<span class="punch" style="top:${PUNCH_FIRST_FROM_TOP_MM + offset}mm"></span>`,
    )
    .join('')
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

/**
 * What is on the lorry, by product — "Refrigerator 5 · Air Conditioner 3".
 *
 * A sentence somebody can check against a tailgate without reading the table
 * below it, which a count of challans and pieces is not. It is the same rollup
 * the trip's own page draws (`tallyProducts`), so the paper and the screen
 * cannot come to disagree about what went out.
 */
function loadSummary(challans: TripChallanRecord[]): string {
  const tally = tallyProducts(challans.flatMap((challan) => challan.lines))

  if (tally.rows.length === 0) {
    return ''
  }

  const rows = tally.rows
    .map((row) => `<span class="tally">${escape(row.productName)} <b>${row.qty}</b></span>`)
    .join('')

  return `<section class="load"><b>On the lorry</b>${rows}</section>`
}

/**
 * A box to write in, with whatever is already known printed inside it.
 *
 * The blank is the ordinary case: a trip's rent is not settled when the lorry
 * leaves. Printing the box anyway is what turns the manifest into the form the
 * figure is collected on, rather than something an operator writes in the
 * margin of.
 */
function writeBox(label: string, value: string, width: string): string {
  return `<div class="box" style="flex:${width}"><b>${escape(label)}</b><span class="write">${value}</span></div>`
}

function challanRow(challan: TripChallanRecord): string {
  const thana = challan.thana || challan.location?.thana || '—'
  const district = challan.district || challan.location?.district || '—'
  const where = `Thana: ${thana} · District: ${district}`

  /**
   * The first column is the **SL number and nothing else**. The challan number
   * was beside it and is gone: the SL is what the office calls a delivery, it
   * is short enough to read across a printed row, and the same identifier is
   * on the challan itself — so one number on the sheet is one number, rather
   * than two that both have to be checked.
   *
   * The last is one **Note** per delivery, left blank to be written in. It was
   * "Received by", and a signature column promised something this sheet cannot
   * carry: what proves a delivery here is the receiver's signed copy, scanned
   * back in, so a name scrawled in a narrow box beside it would be a second and
   * weaker claim about the same thing. A note is what the column is actually
   * wanted for at a door. A note already recorded prints in it, so a reprint of
   * a finished trip reads as a record rather than as a blank form.
   */
  return `<tr>
    <td class="num sl">${challan.slNumber}</td>
    <td><div class="strong">${escape(challan.customerName)}</div><div>${escape(
      challan.deliveryAddress,
    )}</div><div class="muted">${escape(where)}</div><div>☎ ${escape(challan.receiverMobile)}</div>${
      challan.note ? `<div class="muted"><em>${escape(challan.note)}</em></div>` : ''
    }</td>
    <td>${challan.lines.map(line).join('')}</td>
    <td class="num strong">${challan.totalQty}</td>
    <td class="note-col">${escape(challan.deliveryNote)}</td>
  </tr>`
}

/**
 * The lorry's own bill.
 *
 * Always boxes, never a read-only figure, because this is the one part of a
 * trip that is agreed at the end of the day and often on the sheet itself. An
 * amount already entered prints inside its box; the rest is left to be
 * written and typed in later against `PATCH /deliveries/:id/bill`.
 */
/**
 * The mark that says the manifest is finished.
 *
 * A manifest routinely runs past one sheet, and nothing on the paper said so.
 * Worse, the totals row **repeats at the foot of every printed page** — that is
 * what a browser does with a `<tfoot>` — so a first sheet carrying nine
 * deliveries ends with "12 challans" underneath them and reads exactly like a
 * complete document. Somebody files it and never learns that three deliveries
 * were on the back.
 *
 * So the end of the list is marked once, after the table, and it is the
 * **absence** of this strip that says there is more. That way round because a
 * page break is the one thing this sheet cannot know about: the browser decides
 * where it falls, long after the HTML is written, and a "continued overleaf"
 * printed from here would have to be on every page or none — wrong on the last
 * sheet either way. An end marker needs no page arithmetic to be true, and it
 * restates the full count so a sheet can be checked against it without
 * counting rows.
 */
function endMark(trip: TripRecord): string {
  const challans = `${trip.challanCount} challan${trip.challanCount === 1 ? '' : 's'}`

  return `<p class="end">End of manifest · ${challans} · ${trip.totalQty} piece${
    trip.totalQty === 1 ? '' : 's'
  }</p>`
}

function billSection(trip: TripRecord): string {
  const amount = (value: number | null) => (value === null ? '' : taka(value))

  /**
   * Two boxes and no total. A total printed beside the two figures it is the
   * sum of is either arithmetic the sheet did — which it cannot, because both
   * halves are blank when it prints — or a third box somebody has to add up by
   * hand and that nothing checks. The addition happens where the figures are
   * typed in, against `PATCH /deliveries/:id/bill`, which is also the only
   * place it can be wrong in a way anybody would see.
   */
  return `<section class="bill">
    <div class="boxes">
      ${writeBox('Trip rent', amount(trip.tripRent), '1 1 0')}
      ${writeBox('Labour bill', amount(trip.labourBill), '1 1 0')}
    </div>
  </section>`
}

export function manifestHtml(trip: TripRecord): string {
  const challans = trip.challans ?? []
  const preparedBy = trip.createdBy?.name ?? '—'

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escape(trip.tripNumber)} — Trip manifest</title>
<style>
  /*
   * No page margin, for the reason the vendor statement gives: a browser
   * prints its own header and footer — the page URL among them — inside the
   * margin, and leaves them off entirely when there is none. The margin is put
   * back inside the sheet: side padding on the body, and an empty header and
   * footer row on an outer table, which the browser repeats on every page. So
   * a manifest that runs onto a second sheet keeps its margins, and no sheet
   * ever carries the page address across the top of it.
   */
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0 10mm 0 ${PUNCH_GUTTER_MM}mm; position: relative; font: 11px/1.4 system-ui, 'Segoe UI', 'Nirmala UI', 'Noto Sans Bengali', 'Vrinda', sans-serif; color: #111; }
  h1 { margin: 0; font-size: 18px; letter-spacing: -0.01em; }
  h2 { margin: 0 0 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; }
  .mono { font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace; }
  .muted { color: #555; }
  .strong { font-weight: 600; }
  header { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; border-bottom: 2px solid #111; padding-bottom: 6px; }
  .code { text-align: right; }
  .code .barcode { display: block; margin-left: auto; }
  .code .payload { display: block; margin-top: 1px; font-size: 8px; letter-spacing: 0.06em; color: #444; }
  .parties { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 10px 0; }
  .parties div { border: 1px solid #ccc; border-radius: 4px; padding: 5px 7px; }
  .parties b { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; }
  .load { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; margin: 0 0 8px; padding: 5px 8px; border: 1px solid #bbb; border-radius: 4px; background: #f7f7f7; }
  .load > b { font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; }
  .tally { white-space: nowrap; }
  .tally b { font-size: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; text-align: left; }
  th { background: #f1f1f1; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
  tr { page-break-inside: avoid; }
  .num { text-align: right; white-space: nowrap; }
  .sl { width: 44px; font-weight: 600; }
  .note-col { width: 30mm; }
  .line { display: flex; justify-content: space-between; gap: 8px; }
  tfoot td { font-weight: 700; background: #f7f7f7; }
  .boxes { display: flex; gap: 6px; }
  .box { border: 1px solid #bbb; border-radius: 3px; padding: 2px 5px 3px; background: #fff; }
  .box b { display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; font-weight: 600; }
  /* The writing line: a rule with room above it, whether or not it is filled. */
  .write { display: block; min-height: 13px; border-bottom: 1px solid #999; }
  .bill { margin: 0 0 8px; page-break-inside: avoid; }
  .bill .write { min-height: 18px; font-size: 13px; font-weight: 700; }
  .sign-off { display: flex; justify-content: flex-end; margin-top: 18px; page-break-inside: avoid; }
  /*
   * Signing space first, then the rule, then the name under it — the name is
   * whose signature the rule is for, so it cannot sit above the space where
   * that signature goes.
   */
  .sign-off .slot { width: 62mm; text-align: center; }
  .sign-off .space { display: block; height: 16mm; }
  .sign-off .name { border-top: 1px solid #111; padding-top: 4px; font-weight: 600; }
  .sign-off .role { margin-top: 1px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
  /*
   * The punch marks. Positioned from the page edge rather than from the text:
   * body is the containing block and its padding box starts at the paper's own
   * edge, which is what the punch registers against. The rule stops at the hole
   * centre, so the end of the mark is the measurement.
   */
  .punch { position: absolute; left: 0; width: ${PUNCH_FROM_EDGE_MM}mm; border-top: 0.4mm solid #777; }
  table.sheet > * > tr > td { border: 0; padding: 0; background: none; font-weight: normal; }
  table.sheet > tbody > tr { page-break-inside: auto; }
  /* The sign that the list is finished; its absence means another sheet. */
  .end { margin: 6px 0 0; padding: 3px 6px; border: 1px dashed #999; border-radius: 3px; text-align: center; font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: #555; page-break-inside: avoid; }
  .gap { height: 10mm; }
</style>
</head>
<body>
${punchGuide()}
<table class="sheet">
<thead><tr><td class="gap"></td></tr></thead>
<tfoot><tr><td class="gap"></td></tr></tfoot>
<tbody><tr><td>

<header>
  <div>
    <div class="muted">LBTS · Trip manifest</div>
    <h1 class="mono">${escape(shortTripNumber(trip.tripNumber))}</h1>
    <div><b>Date:</b> ${day(trip.tripDate)} · <b>Status:</b> ${escape(trip.status)}</div>
  </div>
  <div class="code">
    ${barcodeSvg(trip.tripNumber, {
      widthMm: barcodeWidthMm(trip.tripNumber),
      heightMm: BARCODE_HEIGHT_MM,
    })}
    <span class="payload mono">${escape(trip.tripNumber)}</span>
  </div>
</header>

<section class="parties">
  <div><b>Vehicle</b><span class="mono strong">${escape(trip.vehicle.registrationNo)}</span><br/>${escape(trip.vehicle.vehicleCode)}</div>
  <div><b>Vendor</b>${escape(trip.vendor.name)}<br/>${escape(trip.vendor.vendorCode)} · ${escape(trip.vendor.mobile)}</div>
  <div><b>Driver</b>${escape(trip.driver.name)}<br/>${escape(trip.driver.mobile)}</div>
</section>

${billSection(trip)}
${loadSummary(challans)}

<table>
  <thead><tr><th class="num">SL</th><th>Customer and delivery</th><th>Products</th><th class="num">Qty</th><th>Note</th></tr></thead>
  <tbody>${challans.map(challanRow).join('')}</tbody>
  <tfoot><tr><td colspan="3">Whole trip · ${trip.challanCount} challan${trip.challanCount === 1 ? '' : 's'}</td><td class="num">${trip.totalQty}</td><td></td></tr></tfoot>
</table>
${endMark(trip)}
${trip.note ? `<p><b>Trip note:</b> ${escape(trip.note)}</p>` : ''}

<section class="sign-off">
  <div class="slot">
    <span class="space"></span>
    <div class="name">${escape(preparedBy)}</div>
    <div class="role">Prepared by</div>
  </div>
</section>

</td></tr></tbody>
</table>
</body>
</html>`
}

export function printManifest(trip: TripRecord): void {
  printHtml(manifestHtml(trip), FRAME_ID)
}
