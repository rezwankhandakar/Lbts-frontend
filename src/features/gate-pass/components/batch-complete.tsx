import { CheckCheck, ExternalLink, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BatchItem } from '../hooks/use-scan-batch'

interface BatchCompleteProps {
  items: BatchItem[]
  onScanAnother: () => void
}

/**
 * The end of a stack: what each sheet became.
 *
 * An operator who has just typed ten challans wants two things — confirmation
 * that all ten are filed, and a way to reach any one of them if a number looks
 * wrong. Listing what each sheet became gives both, and it is the last chance
 * to catch a sheet that was skipped by accident.
 */
export function BatchComplete({ items, onScanAnother }: BatchCompleteProps) {
  const filed = items.filter((item) => item.gatePassId !== null)
  const skipped = items.filter((item) => item.status === 'skipped')

  return (
    <section
      aria-label="Batch complete"
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <header className="flex items-start gap-3 border-b bg-muted/30 px-4 py-3.5 sm:px-5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tone-emerald/10 text-tone-emerald ring-1 ring-tone-emerald/20"
          aria-hidden
        >
          <CheckCheck className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold tracking-tight">
            {filed.length} of {items.length} sheets filed
          </h2>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            {skipped.length > 0
              ? `${skipped.length} ${skipped.length === 1 ? 'sheet was' : 'sheets were'} skipped and not recorded.`
              : 'Every scanned sheet is now a gate pass.'}
          </p>
        </div>
      </header>

      <ul className="divide-y">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-14 shrink-0 text-xs text-muted-foreground">
                Sheet {index + 1}
              </span>

              <span
                className={cn(
                  'truncate text-[13px]',
                  item.gatePassId ? 'font-medium' : 'text-muted-foreground',
                )}
              >
                {item.gatePassId ??
                  (item.status === 'skipped' ? 'Skipped' : 'Not entered')}
                {item.status === 'draft' && (
                  <span className="ml-1.5 text-xs font-normal text-tone-amber">draft</span>
                )}
              </span>
            </div>

            {item.recordId && (
              <Button
                variant="ghost"
                size="xs"
                className="shrink-0"
                render={<Link to={`/gate-pass/${item.recordId}`} />}
              >
                Open
                <ExternalLink data-icon="inline-end" aria-hidden />
              </Button>
            )}
          </li>
        ))}
      </ul>

      <footer className="flex flex-col gap-2 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <Button variant="outline" size="sm" render={<Link to="/gate-pass" />}>
          View all gate passes
        </Button>

        <Button size="sm" onClick={onScanAnother}>
          <Layers data-icon="inline-start" aria-hidden />
          Scan the next stack
        </Button>
      </footer>
    </section>
  )
}
