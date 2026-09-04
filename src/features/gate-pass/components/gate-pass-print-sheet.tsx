import { createPortal } from 'react-dom'
import { formatDateTime } from '@/lib/format'
import { formatTripDate, referenceLabel } from '../lib/gate-pass-meta'
import type { GatePassRecord } from '../types'

interface GatePassPrintSheetProps {
  record: GatePassRecord
}

interface Row {
  label: string
  value: string
}

/**
 * The printed record of one gate pass.
 *
 * Printing the details page itself would put the sidebar, the header and a
 * document viewer on paper. This is a separate document: portalled to
 * document.body, hidden on screen, and the only thing visible when the page is
 * printed — the print rules in index.css hide the app shell entirely.
 *
 * It is deliberately plain. Somebody files this in a folder or staples it to a
 * challan, so it needs the values, the identifier and the status, in an order
 * that matches the paperwork beside it. No colour, no icons, no branding beyond
 * the name.
 */
export function GatePassPrintSheet({ record }: GatePassPrintSheetProps) {
  const reference = referenceLabel(record)

  const rows: Row[] = [
    { label: 'Trip DO', value: record.tripDo },
    { label: 'Trip date', value: formatTripDate(record.tripDate) },
    { label: 'CSD', value: record.csd },
    { label: 'Unit', value: record.unit },
    { label: 'Customer', value: record.customerName },
    { label: 'Vehicle', value: record.vehicleNo },
    { label: 'Reference', value: reference ?? 'None' },
    { label: 'Status', value: record.status },
    { label: 'Created by', value: record.createdBy?.name ?? 'Unknown' },
    { label: 'Created at', value: formatDateTime(record.createdAt) },
  ]

  if (record.document) {
    rows.push({
      label: 'Scanned document',
      value: `${record.document.originalName}${
        record.document.pageCount && record.document.pageCount > 1
          ? ` (${record.document.pageCount} pages)`
          : ''
      }`,
    })
  }

  if (record.statusNote) {
    rows.push({ label: 'Note', value: record.statusNote })
  }

  return createPortal(
    <div data-print-sheet aria-hidden>
      <h1>LBTS Gate Pass</h1>
      <p className="print-subtitle">Line Business Transport Service</p>

      <p className="print-id">{record.gatePassId}</p>

      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* The goods are the point of the sheet, so they get a table of their
          own rather than a row in the summary above — a challan with four
          lines has to print as four lines. */}
      <h2 className="print-section">Goods</h2>

      <table className="print-items">
        <thead>
          <tr>
            <th scope="col" className="print-narrow">
              SL
            </th>
            <th scope="col">Product</th>
            <th scope="col">Model</th>
            <th scope="col" className="print-narrow print-right">
              Qty
            </th>
          </tr>
        </thead>
        <tbody>
          {record.items.map((item, index) => (
            <tr key={`${item.model}-${index}`}>
              <td>{index + 1}</td>
              <td>{item.productName}</td>
              <td>{item.model}</td>
              <td className="print-right">{item.qty}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="print-right">
              Total
            </td>
            <td className="print-right">{record.totalQty}</td>
          </tr>
        </tfoot>
      </table>

      <div className="print-signatures">
        <div>
          <span />
          <p>Issued by</p>
        </div>
        <div>
          <span />
          <p>Received by</p>
        </div>
      </div>

      <p className="print-footer">
        Printed from LBTS on {formatDateTime(new Date().toISOString())}. This sheet summarises the
        record; the scanned gate pass is the original.
      </p>
    </div>,
    document.body,
  )
}
