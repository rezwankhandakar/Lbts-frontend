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
import { formatDateTime } from '@/lib/format'
import { formatBytes, formatRange } from '../lib/challan-meta'
import type { ChallanRecord } from '../types'
import { ChallanGoodsTable } from './challan-goods-table'

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
  const location = record.resolvedLocation

  return (
    <div className="space-y-4">
      <Section
        icon={ScanBarcode}
        title="Identifiers"
        description="Allocated by LBTS when this challan was filed."
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              SL number
            </dt>
            <dd className="mt-0.5 text-2xl leading-tight font-semibold tabular-nums">
              {record.slNumber}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Challan number
            </dt>
            <dd className="mt-0.5 truncate text-2xl leading-tight font-semibold">
              {record.challanNumber}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The challan number is what the barcode on the back page encodes, so a scanner and a person
          reading the page get the same value.
        </p>
      </Section>

      <Section
        icon={MapPin}
        title="Customer and delivery"
        description="As transcribed from the challan."
      >
        <Rows
          rows={[
            ['Customer', record.customerName],
            ['Delivery address', record.deliveryAddress],
            // As transcribed, and never rewritten by resolution: what the paper
            // said is a fact about the paper, and it is what the back page
            // prints. Where the system decided that is sits below.
            ['Thana', record.thana || '—'],
            ['District', record.district || '—'],
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
        title="Location"
        description="Matched against the location master list. Optional — a challan files without it."
      >
        {location ? (
          <>
            <Rows
              rows={[
                ['District', location.district],
                ['Thana', location.thana],
              ]}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <LocationTypeBadge value={location.locationType} />
              <span className="text-xs text-muted-foreground">
                {locationSourceLabel(location.source)}
                {location.resolvedBy ? ` by ${location.resolvedBy.name}` : ''} ·{' '}
                {formatDateTime(location.resolvedAt)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <LocationStatusBadge value="Pending" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              No district or thana could be determined from what was entered, so none was
              recorded — a blank is kept rather than a guess. Setting it here does not change the
              challan text or its printed document.
            </p>
          </div>
        )}

        {onSetLocation && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onSetLocation}>
            <MapPinned data-icon="inline-start" aria-hidden />
            {location ? 'Change location' : 'Set location'}
          </Button>
        )}
      </Section>

      <Section
        icon={Phone}
        title="Contact and reference"
        description="Who to call, and what it is filed against."
      >
        <Rows
          rows={[
            ['Receiver mobile', record.receiverMobile],
            ['Sender mobile', record.senderMobile ?? '—'],
            ['Zone / PO', record.zonePo ?? '—'],
          ]}
        />
      </Section>

      <Section
        icon={Boxes}
        title="Goods"
        description={
          record.items.length === 1
            ? 'What this challan carries.'
            : `${record.items.length} product lines on this challan.`
        }
      >
        {/* Extracted rather than inline: the goods table now carries the rate
            and the line amount as well as the quantity, and it is the one part
            of this page with arithmetic of its own to explain. */}
        <ChallanGoodsTable record={record} />
      </Section>

      <Section
        icon={FileStack}
        title="Source and document"
        description="Where these pages came from, and what is stored."
      >
        <Rows
          rows={[
            ['Source file', record.sourceFileName],
            [
              'Pages taken',
              formatRange({
                startPage: record.sourcePageStart,
                endPage: record.sourcePageEnd,
              }),
            ],
            [
              'Stored document',
              `${record.document.pageCount} pages · ${formatBytes(record.document.size)}`,
            ],
            ['Generated', formatDateTime(record.document.generatedAt)],
          ]}
        />

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The stored PDF is the original challan pages exactly as they arrived, followed by the
          generated LBTS back page. The source file itself was never uploaded.
        </p>

        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          render={<Link to={`/challan/batch/${record.batchId}`} />}
        >
          Open the source batch
        </Button>
      </Section>

      <Section
        icon={ShieldCheck}
        title="Filing"
        description="Who filed it, who printed it, and when."
      >
        <Rows
          rows={[
            ['Filed by', record.submittedBy?.name ?? record.createdBy?.name ?? '—'],
            ['Filed at', formatDateTime(record.submittedAt)],
            /**
             * Printing is the point of a challan, and nothing else on this
             * page says whether the paper exists. A dispatch rather than a
             * sheet: the browser hands the document to a print dialog and
             * never learns what the printer did with it, which is why the row
             * menu can take the mark back.
             */
            [
              'Printed',
              record.printedAt
                ? `${formatDateTime(record.printedAt)}${record.printedBy ? ` by ${record.printedBy.name}` : ''}`
                : 'Not yet',
            ],
            ...(record.amendedAt
              ? ([
                  ['Corrected at', formatDateTime(record.amendedAt)],
                  ['Corrected by', record.updatedBy?.name ?? '—'],
                ] as [string, string][])
              : []),
          ]}
        />

        {record.amendedAt && (
          <p className="mt-3 rounded-lg border border-tone-amber/25 bg-tone-amber/5 px-3 py-2 text-xs leading-relaxed">
            This challan was corrected after filing, and its document was regenerated to match. Any
            copy printed before that date shows the old details.
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
