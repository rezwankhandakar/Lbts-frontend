import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Boxes,
  FileStack,
  MapPin,
  MapPinned,
  Phone,
  ScanBarcode,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  LocationStatusBadge,
  LocationTypeBadge,
} from '@/features/location/components/location-badges'
import { locationSourceLabel } from '@/features/location/lib/location-meta'
import { BLANK, formatNumber } from '@/lib/format'
import { formatBytes, formatRange } from '../lib/challan-meta'
import type { ChallanRecord } from '../types'
import { ChallanDispatchPanel } from '@/features/delivery/components/challan-dispatch-panel'
import { ChallanGoodsTable } from './challan-goods-table'
import { countOf, useFormatters, useT } from '@/lib/i18n'

interface ChallanDetailsProps {
  record: ChallanRecord
  /**
   * Opens the location picker. Absent for a viewer who may not correct this
   * challan — a CEO reading it, or an operator looking at somebody else's —
   * in which case the section still shows what is on record, without the
   * button.
   */
  onSetLocation?: () => void
}

/**
 * Everything on record for one challan.
 *
 * Grouped the way somebody checks it: the two identifiers first, because they
 * are what a phone call is about, then who and where, then what was in the
 * box, then where it came from and who filed it. The barcode is not redrawn
 * here — it lives on the stored document's back page, which is the copy that
 * matters, and a second rendering of it on screen would be a second thing to
 * keep in step.
 */
export function ChallanDetails({ record, onSetLocation }: ChallanDetailsProps) {
  const t = useT()
  const format = useFormatters()

  const location = record.resolvedLocation

  const printedText = !record.printedAt
    ? t('challan.details.notYet')
    : record.printedBy
      ? t('challan.printMark.printedAtBy', {
          when: format.dateTime(record.printedAt),
          name: record.printedBy.name,
        })
      : format.dateTime(record.printedAt)

  return (
    <div className="space-y-4">
      <Section
        icon={ScanBarcode}
        title={t('challan.details.identifiers')}
        description={t('challan.details.identifiersHint')}
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t('challan.details.slNumber')}
            </dt>
            <dd className="mt-0.5 text-2xl leading-tight font-semibold tabular-nums">
              {formatNumber(record.slNumber)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t('challan.details.challanNumber')}
            </dt>
            <dd className="mt-0.5 truncate text-2xl leading-tight font-semibold">
              {record.challanNumber}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {t('challan.details.barcodeNote')}
        </p>
      </Section>

      <Section
        icon={MapPin}
        title={t('challan.details.customerAndDelivery')}
        description={t('challan.details.asTranscribed')}
      >
        <Rows
          rows={[
            [t('challan.details.customer'), record.customerName],
            [t('challan.details.deliveryAddress'), record.deliveryAddress],
            // As transcribed, and never rewritten by resolution: what the paper
            // said is a fact about the paper, and it is what the back page
            // prints. Where the system decided that is sits below.
            [t('challan.details.thana'), record.thana || BLANK],
            [t('challan.details.district'), record.district || BLANK],
          ]}
        />
      </Section>

      {/**
       * Where this delivery went, as decided against the Location Master.
       *
       * Its own section rather than two more rows above, because it is a
       * different kind of fact: those are what somebody typed off a sheet of
       * paper, this is what the system concluded and what a report will group
       * by. One block would hide the case that matters — a challan whose typed
       * district says "Comilla" and whose location is Cumilla.
       *
       * When it is not set the section says so plainly and offers to set it.
       * That is the whole design: a blank location never stopped the challan
       * being filed, and this is where it gets finished.
       */}
      <Section
        icon={MapPinned}
        title={t('challan.details.location')}
        description={t('challan.details.locationHint')}
      >
        {location ? (
          <>
            <Rows
              rows={[
                [t('challan.details.district'), location.district],
                [t('challan.details.thana'), location.thana],
              ]}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <LocationTypeBadge value={location.locationType} />
              <span className="text-xs text-muted-foreground">
                {location.resolvedBy
                  ? t('challan.details.resolvedByAt', {
                      source: locationSourceLabel(location.source, t),
                      name: location.resolvedBy.name,
                      when: format.dateTime(location.resolvedAt),
                    })
                  : t('challan.details.resolvedAt', {
                      source: locationSourceLabel(location.source, t),
                      when: format.dateTime(location.resolvedAt),
                    })}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <LocationStatusBadge value="Pending" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t('challan.details.noLocation')}
            </p>
          </div>
        )}

        {onSetLocation && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onSetLocation}>
            <MapPinned data-icon="inline-start" aria-hidden />
            {location ? t('challan.details.changeLocation') : t('challan.details.setLocation')}
          </Button>
        )}
      </Section>

      <Section
        icon={Phone}
        title={t('challan.details.contactAndReference')}
        description={t('challan.details.contactHint')}
      >
        <Rows
          rows={[
            [t('challan.details.receiverMobile'), record.receiverMobile],
            [t('challan.details.senderMobile'), record.senderMobile ?? BLANK],
            [t('challan.details.zonePo'), record.zonePo ?? BLANK],
          ]}
        />
      </Section>

      <Section
        icon={Boxes}
        title={t('challan.details.goods')}
        description={
          record.items.length === 1
            ? t('challan.details.goodsHint')
            : t('challan.details.productLines', { n: formatNumber(record.items.length) })
        }
      >
        {/* Extracted rather than inline: the goods table now carries the rate
            and the line amount as well as the quantity, and it is the one part
            of this page with arithmetic of its own to explain. */}
        <ChallanGoodsTable record={record} />
      </Section>

      {/* What became of the goods, from the module that knows: which lorries
          took them, how much of each line went, and what those trips corrected.
          Mounted the way the dashboard mounts each module's own card — the data
          is trips, and this page should not have to know their shape. */}
      <ChallanDispatchPanel challanId={record.id} />

      <Section
        icon={FileStack}
        title={t('challan.details.sourceAndDocument')}
        description={t('challan.details.sourceHint')}
      >
        <Rows
          rows={[
            [t('challan.details.sourceFile'), record.sourceFileName],
            [
              t('challan.details.pagesTaken'),
              formatRange(
                {
                  startPage: record.sourcePageStart,
                  endPage: record.sourcePageEnd,
                },
                t,
              ),
            ],
            [
              t('challan.details.storedDocument'),
              t('challan.details.documentSize', {
                pages: countOf(record.document.pageCount, 'nouns.page', t),
                size: formatBytes(record.document.size),
              }),
            ],
            [t('challan.details.generated'), format.dateTime(record.document.generatedAt)],
          ]}
        />

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {t('challan.details.storedNote')}
        </p>

        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          render={<Link to={`/challan/batch/${record.batchId}`} />}
        >
          {t('challan.details.openSourceBatch')}
        </Button>
      </Section>

      <Section
        icon={ShieldCheck}
        title={t('challan.details.filing')}
        description={t('challan.details.filingHint')}
      >
        <Rows
          rows={[
            [
              t('challan.details.filedBy'),
              record.submittedBy?.name ?? record.createdBy?.name ?? BLANK,
            ],
            [t('challan.details.filedAt'), format.dateTime(record.submittedAt)],
            /**
             * Printing is the point of a challan, and nothing else on this
             * page says whether the paper exists. A dispatch rather than a
             * sheet: the browser hands the document to a print dialog and
             * never learns what the printer did with it, which is why the row
             * menu can take the mark back.
             */
            [t('challan.details.printed'), printedText],
            ...(record.amendedAt
              ? ([
                  [t('challan.details.correctedAt'), format.dateTime(record.amendedAt)],
                  [t('challan.details.correctedBy'), record.updatedBy?.name ?? BLANK],
                ] as [string, string][])
              : []),
          ]}
        />

        {record.amendedAt && (
          <p className="mt-3 rounded-lg border border-tone-amber/25 bg-tone-amber/5 px-3 py-2 text-xs leading-relaxed">
            {t('challan.details.amendedNote')}
          </p>
        )}
      </Section>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <header className="mb-3.5 flex items-start gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
        </div>
      </header>
      {children}
    </section>
  )
}

function Rows({ rows }: { rows: [label: string, value: string][] }) {
  return (
    <dl className="divide-y">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:gap-4 sm:py-2.5">
          <dt className="shrink-0 text-xs text-muted-foreground sm:w-40">{label}</dt>
          <dd className="min-w-0 flex-1 text-sm wrap-break-word">{value || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}
