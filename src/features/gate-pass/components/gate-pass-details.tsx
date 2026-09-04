import { Boxes, Building2, FileText, History, Route, Tag } from 'lucide-react'
import { formatDateTime, formatRelative } from '@/lib/format'
import { formatBytes, formatTripDate, referenceLabel } from '../lib/gate-pass-meta'
import type { GatePassRecord } from '../types'
import { DetailCard, DetailRow } from './detail-sections'

interface GatePassDetailsProps {
  record: GatePassRecord
}

/**
 * Everything on record about one gate pass, grouped the way somebody checking
 * it against a printed challan reads: the trip, who it went to, what it was
 * filed against, what was on the vehicle, then the document and the history.
 */
export function GatePassDetails({ record }: GatePassDetailsProps) {
  const reference = referenceLabel(record)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DetailCard icon={Route} title="Trip" tone="indigo">
        <DetailRow label="Trip DO" value={record.tripDo} />
        <DetailRow label="Trip date" value={formatTripDate(record.tripDate)} />
        <DetailRow label="CSD" value={record.csd} />
        <DetailRow label="Unit" value={record.unit} />
      </DetailCard>

      <DetailCard icon={Building2} title="Delivery" tone="cyan">
        <DetailRow label="Customer" value={record.customerName} />
        <DetailRow label="Vehicle" value={record.vehicleNo} />
      </DetailCard>

      {/* Spans both columns: a challan with several lines needs the width, and
          the goods are what the page is about. */}
      <DetailCard icon={Boxes} title="Goods" tone="emerald" raw className="sm:col-span-2">
        <div className="px-4 py-3 sm:px-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b">
                <th className="w-10 pb-1.5 text-left text-xs font-medium text-muted-foreground">
                  #
                </th>
                <th className="pb-1.5 text-left text-xs font-medium text-muted-foreground">
                  Product
                </th>
                <th className="pb-1.5 text-left text-xs font-medium text-muted-foreground">
                  Model
                </th>
                <th className="w-16 pb-1.5 text-right text-xs font-medium text-muted-foreground">
                  Qty
                </th>
              </tr>
            </thead>

            <tbody>
              {record.items.map((item, index) => (
                <tr key={`${item.model}-${index}`} className="border-b last:border-b-0">
                  <td className="py-2 text-muted-foreground tabular-nums">{index + 1}</td>
                  <td className="py-2 pr-3 wrap-break-word">{item.productName}</td>
                  <td className="py-2 pr-3 wrap-break-word">{item.model}</td>
                  <td className="py-2 text-right tabular-nums">{item.qty}</td>
                </tr>
              ))}
            </tbody>

            {record.items.length > 1 && (
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-2 text-right text-xs text-muted-foreground">
                    Total
                  </td>
                  <td className="pt-2 text-right font-semibold tabular-nums">{record.totalQty}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </DetailCard>

      <DetailCard icon={Tag} title="Reference" tone="violet">
        <DetailRow label="Type" value={record.referenceType === 'None' ? 'None' : record.referenceType} />
        <DetailRow label="Value" value={reference ? reference.split(' ').slice(1).join(' ') : null} />
      </DetailCard>

      <DetailCard icon={FileText} title="Document" tone="amber">
        {record.document ? (
          <>
            <DetailRow label="File" value={record.document.originalName} />
            <DetailRow
              label="Type"
              value={record.document.mimeType === 'application/pdf' ? 'PDF' : 'Image'}
            />
            <DetailRow label="Size" value={formatBytes(record.document.size)} numeric />
            {record.document.pageCount !== null && (
              <DetailRow label="Pages" value={record.document.pageCount} numeric />
            )}
            <DetailRow label="Scanned" value={formatDateTime(record.document.uploadedAt)} />
          </>
        ) : (
          <DetailRow label="Document" value="No scanned document attached" />
        )}
      </DetailCard>

      <DetailCard icon={History} title="History" tone="indigo">
        <DetailRow
          label="Created"
          value={
            <>
              {formatDateTime(record.createdAt)}
              {record.createdBy && (
                <span className="text-muted-foreground"> · {record.createdBy.name}</span>
              )}
            </>
          }
        />
        <DetailRow
          label="Submitted"
          value={record.submittedAt ? formatDateTime(record.submittedAt) : null}
        />
        <DetailRow
          label="Last change"
          value={
            record.statusChangedAt ? (
              <>
                {formatRelative(record.statusChangedAt)}
                {record.statusChangedBy && (
                  <span className="text-muted-foreground"> · {record.statusChangedBy.name}</span>
                )}
              </>
            ) : null
          }
        />
        <DetailRow
          label="Last edited"
          value={
            record.updatedBy ? (
              <>
                {formatRelative(record.updatedAt)}
                <span className="text-muted-foreground"> · {record.updatedBy.name}</span>
              </>
            ) : null
          }
        />
      </DetailCard>
    </div>
  )
}
