import { Link } from 'react-router-dom'
import { ExternalLink, Fingerprint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { formatDateTime, formatRelative } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { categoryMeta, entityLabel, moduleMeta, recordPath, severityMeta } from '../lib/activity-meta'
import type { ActivityRecord } from '../types'
import { ActivityActor } from './activity-actor'
import { ActivityChanges } from './activity-changes'

interface ActivityDetailSheetProps {
  /** The row to show; null closes the sheet. */
  record: ActivityRecord | null
  onClose: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-[13px] break-words">{children}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="border-b pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}

/**
 * One event, in full.
 *
 * A sheet rather than a page, and that is the opposite call to the one Challan
 * makes for its location editor — deliberately. That is a *workflow*: several
 * lines of transcribed text to read against a master list, two selectors, and
 * a run of records to step through, none of which fits in a box. This is a
 * *reading*: a sentence, a diff and four facts about it, with nothing to
 * decide and nowhere to go next. A page for it would cost a navigation each
 * way and lose the reader's place in a list they are scanning.
 *
 * It renders entirely from the row the list already holds. There is no
 * `GET /activity/:id`, because a row carries everything about itself — which
 * is also what makes the journal cheap to read: one query answers a page and
 * every detail on it.
 */
export function ActivityDetailSheet({ record, onClose }: ActivityDetailSheetProps) {
  const t = useT()

  const module = record ? moduleMeta(record.module, t) : null
  const category = record ? categoryMeta(record.category, t) : null
  const severity = record ? severityMeta(record.severity, t) : null
  const path = record ? recordPath(record) : null
  const CategoryIcon = category?.icon

  return (
    <Sheet open={record !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {record && module && severity && (
          <>
            <SheetHeader>
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full ring-1',
                    module.chip,
                  )}
                  aria-hidden
                >
                  {CategoryIcon && <CategoryIcon className="size-5" />}
                </span>
                <div className="min-w-0">
                  <SheetTitle className="text-base leading-snug text-pretty">
                    {record.actionLabel}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5">
                    {formatDateTime(record.createdAt)} · {formatRelative(record.createdAt)}
                  </SheetDescription>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                    module.badge,
                  )}
                >
                  {module.label}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                    severity.badge,
                  )}
                >
                  {severity.label}
                </span>
                {category && (
                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {category.label}
                  </span>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-5 px-4 pb-6">
              <p className="rounded-lg bg-muted/60 p-3 text-[13px] leading-relaxed text-pretty">
                {record.summary}
              </p>

              <Section title={t('activity.detail.touched')}>
                <dl className="divide-y">
                  <Field label={entityLabel(record.entityType, t)}>
                    <span className="font-mono">{record.entityLabel || '—'}</span>
                  </Field>
                  <Field label={t('activity.detail.doneBy')}>
                    <ActivityActor
                      actor={record.actor}
                      variant="full"
                      className="justify-end"
                    />
                  </Field>
                  <Field label={t('activity.detail.when')}>{formatDateTime(record.createdAt)}</Field>
                </dl>

                {/* Only where the id genuinely is the URL — see `recordPath`.
                    A deleted record keeps its row and loses its link, which is
                    correct: the label is a copy precisely so the sentence
                    survives the record. */}
                {path && (
                  <Button variant="outline" size="sm" className="w-full" render={<Link to={path} />}>
                    <ExternalLink data-icon="inline-start" aria-hidden />
                    Open the {entityLabel(record.entityType, t).toLowerCase()}
                  </Button>
                )}
              </Section>

              <Section title={t('activity.detail.changed')}>
                <ActivityChanges changes={record.changes} />
              </Section>

              {/*
                The identifiers, last and quiet. Nobody reads a journal for an
                action string — but somebody diagnosing why a filter is empty,
                or matching a row to a support report, needs exactly this, and
                a page that hides it sends them to the database instead.
              */}
              <Section title={t('activity.detail.reference')}>
                <dl className="divide-y">
                  <Field label={t('activity.detail.action')}>
                    <span className="font-mono text-xs text-muted-foreground">{record.action}</span>
                  </Field>
                  <Field label={t('activity.detail.eventId')}>
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      <Fingerprint className="size-3 shrink-0" aria-hidden />
                      {record.id}
                    </span>
                  </Field>
                  {record.entityId && (
                    <Field label={t('activity.detail.recordId')}>
                      <span className="font-mono text-xs text-muted-foreground">
                        {record.entityId}
                      </span>
                    </Field>
                  )}
                </dl>
              </Section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
