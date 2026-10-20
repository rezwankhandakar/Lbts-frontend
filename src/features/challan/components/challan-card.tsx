import type { MouseEvent, ReactNode } from 'react'
import { ArrowRight, Download, FileText, MapPin, Phone, Printer } from 'lucide-react'
import { SentenceWith } from '@/components/shared/sentence-with'
import { Button } from '@/components/ui/button'
import { BLANK } from '@/lib/format'
import { useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { dispatchMetaFor } from '../lib/challan-meta'
import type { ChallanRecord } from '../types'
import type { ChallanActions } from './challan-action-menu'
import { ChallanAmount, ChallanRecordFlags, DeliveryProgressBar, ReturnFlags } from './challan-card-cells'
import { ChallanCardHeader } from './challan-card-header'

interface ChallanCardProps {
  record: ChallanRecord
  actions: ChallanActions
  onOpen: (record: ChallanRecord) => void
}

/** Keeps a click on a control from also opening the record under it. */
function stop(event: MouseEvent) {
  event.stopPropagation()
}

/** A place name in the address line, bold so it is read rather than skimmed. */
function Place({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-foreground">{children}</span>
}

/**
 * One challan, as a card rather than a row — drawn the way the trip page draws
 * a challan on a lorry (`TripChallanCard`), because an operator meets the same
 * challan on both screens and it should look like the same thing on each.
 *
 * Top to bottom in the order the paper is read: the coloured band (which
 * challan, where its goods are, who it is for, how many pieces), where it is
 * going and who takes it, every product line, what it comes to and the quiet
 * facts beside it, and the way through to the record. The goods are a divided
 * list rather than a table inside the card — a panel inside a panel says
 * nothing a hairline does not.
 *
 * The whole card opens the record on click; the challan number in the band is
 * the keyboard path to the same thing, and every control below stops its click
 * from reaching the card underneath it.
 */
export function ChallanCard({ record, actions, onOpen }: ChallanCardProps) {
  const t = useT()
  const format = useFormatters()

  const dispatch = dispatchMetaFor(record, t)
  const district = record.resolvedLocation?.district || record.district
  const thana = record.resolvedLocation?.thana || record.thana

  return (
    <li
      onClick={() => onOpen(record)}
      aria-label={t('challan.list.challanAria', { challan: record.challanNumber })}
      className="flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-300 focus-within:ring-2 focus-within:ring-ring/50 hover:shadow-md"
    >
      <ChallanCardHeader record={record} actions={actions} onOpen={onOpen} />

      <div className="flex items-start gap-2 px-3.5 pt-2.5">
        <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] leading-snug wrap-break-word" title={record.deliveryAddress}>
            {record.deliveryAddress || BLANK}
          </p>
          {/* Labelled halves rather than one joined string: a blank thana and a
              blank district are different gaps, and the card is where somebody
              notices which one is missing. */}
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-muted-foreground">
            <span>
              <SentenceWith
                text={t('challan.list.thanaDistrict')}
                parts={{
                  thana: <Place>{thana || BLANK}</Place>,
                  district: <Place>{district || BLANK}</Place>,
                }}
              />
            </span>
            {record.receiverMobile && (
              <a
                href={`tel:${record.receiverMobile}`}
                onClick={stop}
                className="inline-flex items-center gap-1 font-semibold text-foreground tabular-nums hover:underline"
              >
                <Phone className="size-3.5 text-primary" aria-hidden />
                {record.receiverMobile}
              </a>
            )}
          </p>
        </div>
      </div>

      {/* Every line, not the first and a count: a challan routinely carries the
          indoor and outdoor halves of an air conditioner, and "+1 more" is
          exactly what somebody checking a load needs to read. */}
      <ul aria-label={t('challan.list.products')} className="mx-3.5 mt-2 divide-y border-y">
        {record.items.map((item, index) => (
          <li key={`${item.model}-${index}`} className="flex flex-wrap items-center gap-x-2 gap-y-1.5 py-1.5">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-[13px] font-semibold">{item.productName}</span>
              {item.model && (
                <span className="rounded bg-muted px-1.5 py-px text-[12.5px] font-medium text-foreground/80 wrap-break-word">
                  {item.model}
                </span>
              )}
            </div>
            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[13px] font-bold tabular-nums">
              × {format.number(item.qty)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3.5 py-2">
        <ChallanAmount record={record} />
        <DeliveryProgressBar record={record} />
        <ReturnFlags record={record} />
        <ChallanRecordFlags record={record} className="ms-auto justify-end" />
      </div>

      <footer
        onClick={stop}
        className="mt-auto flex cursor-default flex-wrap items-center gap-1.5 border-t bg-muted/30 px-3.5 py-2"
      >
        <Button type="button" variant="outline" size="sm" onClick={() => actions.onDownload(record)}>
          <Download data-icon="inline-start" aria-hidden />
          {t('challan.menu.downloadPdf')}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => actions.onPrint(record)}>
          <Printer data-icon="inline-start" aria-hidden />
          {t('challan.menu.printChallan')}
        </Button>
        <Button
          type="button"
          size="sm"
          className={cn('w-full text-primary-foreground sm:ms-auto sm:w-auto', dispatch.bandButton)}
          onClick={() => onOpen(record)}
        >
          <FileText data-icon="inline-start" aria-hidden />
          {t('challan.list.openChallan')}
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </footer>
    </li>
  )
}
