import { Boxes, Building2, FileText, History, Route, Tag } from 'lucide-react'
import { formatDateTime, formatRelative } from '@/lib/format'
import { formatNumber } from '@/lib/format'
import { REFERENCE_TYPE_KEYS, formatBytes, formatTripDate } from '../lib/gate-pass-meta'
import type { GatePassRecord } from '../types'
import { DetailCard, DetailRow } from './detail-sections'
import { useT } from '@/lib/i18n'

interface GatePassDetailsProps {
  record: GatePassRecord
}

/**
 * Everything on record about one gate pass, grouped the way somebody checking
 * it against a printed challan reads: the trip, who it went to, what it was
 * filed against, what was on the vehicle, then the document and the history.
 */
export function GatePassDetails({ record }: GatePassDetailsProps) {
  const t = useT()

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DetailCard icon={Route} title={t('gatePass.detail.trip')} tone="indigo">
        <DetailRow label={t('gatePass.fields.tripDo')} value={record.tripDo} />
        <DetailRow label={t('gatePass.fields.tripDate')} value={formatTripDate(record.tripDate)} />
        <DetailRow label={t('gatePass.fields.csd')} value={record.csd} />
        <DetailRow label={t('gatePass.fields.unit')} value={record.unit} />
      </DetailCard>

      <DetailCard icon={Building2} title={t('gatePass.detail.delivery')} tone="cyan">
        <DetailRow label={t('gatePass.detail.customer')} value={record.customerName} />
        <DetailRow label={t('gatePass.detail.vehicle')} value={record.vehicleNo} />
      </DetailCard>

      {/* Spans both columns: a challan with several lines needs the width, and
          the goods are what the page is about. */}
      <DetailCard
        icon={Boxes}
        title={t('gatePass.detail.goods')}
        tone="emerald"
        raw
        className="sm:col-span-2"
      >
        {/* Below `sm` the four columns are two usable ones: a product name and
            a model are both long, and sharing ~220px between them against a
            fixed `#` and `Qty` wraps every row into a block of broken words.
            `sm` is also where this card claims both grid columns, so it is the
            width the table was drawn for. A phone gets the same lines stacked
            — a table from `sm` up and a card list below it, the shape every
            list in this app takes. */}
        <ul className="divide-y sm:hidden">
          {record.items.map((item, index) => (
            <li key={`${item.model}-${index}`} className="flex items-start gap-3 px-4 py-2.5">
              <span className="w-5 shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
                {formatNumber(index + 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium wrap-break-word">{item.productName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground wrap-break-word">{item.model}</p>
              </div>
              <span className="shrink-0 text-right text-[13px] font-semibold tabular-nums">
                {formatNumber(item.qty)}
              </span>
            </li>
          ))}

          {record.items.length > 1 && (
            <li className="flex items-baseline justify-between gap-3 bg-muted/30 px-4 py-2.5">
              <span className="text-xs text-muted-foreground">{t('gatePass.detail.total')}</span>
              <span className="text-[13px] font-semibold tabular-nums">
                {formatNumber(record.totalQty)}
              </span>
            </li>
          )}
        </ul>

        <div className="hidden px-4 py-3 sm:block sm:px-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b">
                <th className="w-10 pb-1.5 text-left text-xs font-medium text-muted-foreground">
                  #
                </th>
                <th className="pb-1.5 text-left text-xs font-medium text-muted-foreground">
                  {t('gatePass.detail.product')}
                </th>
                <th className="pb-1.5 text-left text-xs font-medium text-muted-foreground">
                  {t('gatePass.detail.model')}
                </th>
                <th className="w-16 pb-1.5 text-right text-xs font-medium text-muted-foreground">
                  {t('gatePass.fields.qty')}
                </th>
              </tr>
            </thead>

            <tbody>
              {record.items.map((item, index) => (
                <tr key={`${item.model}-${index}`} className="border-b last:border-b-0">
                  <td className="py-2 text-muted-foreground tabular-nums">
                    {formatNumber(index + 1)}
                  </td>
                  <td className="py-2 pr-3 wrap-break-word">{item.productName}</td>
                  <td className="py-2 pr-3 wrap-break-word">{item.model}</td>
                  <td className="py-2 text-right tabular-nums">{formatNumber(item.qty)}</td>
                </tr>
              ))}
            </tbody>

            {record.items.length > 1 && (
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-2 text-right text-xs text-muted-foreground">
                    {t('gatePass.detail.total')}
                  </td>
                  <td className="pt-2 text-right font-semibold tabular-nums">
                    {formatNumber(record.totalQty)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </DetailCard>

      <DetailCard icon={Tag} title={t('gatePass.detail.reference')} tone="violet">
        <DetailRow
          label={t('gatePass.detail.type')}
          value={t(REFERENCE_TYPE_KEYS[record.referenceType])}
        />
        {/* The value alone, because the type is on the row above it. */}
        <DetailRow
          label={t('gatePass.detail.value')}
          value={record.referenceType === 'Zone' ? record.zone : record.po}
        />
      </DetailCard>

      <DetailCard icon={FileText} title={t('gatePass.detail.document')} tone="amber">
        {record.document ? (
          <>
            <DetailRow label={t('gatePass.detail.file')} value={record.document.originalName} />
            <DetailRow
              label={t('gatePass.detail.type')}
              value={
                record.document.mimeType === 'application/pdf'
                  ? t('gatePass.detail.pdf')
                  : t('gatePass.detail.image')
              }
            />
            <DetailRow
              label={t('gatePass.detail.size')}
              value={formatBytes(record.document.size)}
              numeric
            />
            {record.document.pageCount !== null && (
              <DetailRow
                label={t('gatePass.detail.pages')}
                value={formatNumber(record.document.pageCount)}
                numeric
              />
            )}
            <DetailRow
              label={t('gatePass.detail.scanned')}
              value={formatDateTime(record.document.uploadedAt)}
            />
          </>
        ) : (
          <DetailRow
            label={t('gatePass.detail.document')}
            value={t('gatePass.detail.noneAttached')}
          />
        )}
      </DetailCard>

      <DetailCard icon={History} title={t('gatePass.detail.history')} tone="indigo">
        <DetailRow
          label={t('gatePass.detail.created_')}
          value={
            record.createdBy
              ? t('gatePass.detail.byPerson', {
                  when: formatDateTime(record.createdAt),
                  name: record.createdBy.name,
                })
              : formatDateTime(record.createdAt)
          }
        />
        <DetailRow
          label={t('gatePass.detail.submitted')}
          value={record.submittedAt ? formatDateTime(record.submittedAt) : null}
        />
        <DetailRow
          label={t('gatePass.detail.lastChange')}
          value={
            record.statusChangedAt
              ? record.statusChangedBy
                ? t('gatePass.detail.byPerson', {
                    when: formatRelative(record.statusChangedAt),
                    name: record.statusChangedBy.name,
                  })
                : formatRelative(record.statusChangedAt)
              : null
          }
        />
        <DetailRow
          label={t('gatePass.detail.lastEdited')}
          value={
            record.updatedBy
              ? t('gatePass.detail.byPerson', {
                  when: formatRelative(record.updatedAt),
                  name: record.updatedBy.name,
                })
              : null
          }
        />
      </DetailCard>
    </div>
  )
}
