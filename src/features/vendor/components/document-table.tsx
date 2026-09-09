import {
  Download,
  Eye,
  MoreHorizontal,
  Paperclip,
  PencilLine,
  Trash2,
  Truck,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatDay } from '../lib/vendor-meta'
import type { DocumentRecord } from '../types'
import { DocumentStatusBadge } from './status-badges'

export interface DocumentActions {
  canManage: boolean
  onView: (document: DocumentRecord) => void
  onDownload: (document: DocumentRecord) => void
  onEdit: (document: DocumentRecord) => void
  onDelete: (document: DocumentRecord) => void
}

function DocumentMenu({
  document,
  actions,
}: {
  document: DocumentRecord
  actions: DocumentActions
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={`Actions for the ${document.documentType} of ${document.ownerLabel}`}
          />
        }
      >
        <MoreHorizontal aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={!document.attachment}
          onClick={() => actions.onView(document)}
        >
          <Eye aria-hidden />
          View file
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!document.attachment}
          onClick={() => actions.onDownload(document)}
        >
          <Download aria-hidden />
          Download
        </DropdownMenuItem>

        {actions.canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions.onEdit(document)}>
              <PencilLine aria-hidden />
              {document.attachment ? 'Renew or replace' : 'Update'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => actions.onDelete(document)}>
              <Trash2 aria-hidden />
              Remove
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** What the document is about, with the icon that says which kind of thing. */
function Subject({ document }: { document: DocumentRecord }) {
  const Icon = document.ownerType === 'Vehicle' ? Truck : UserRound

  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="truncate">{document.ownerLabel}</span>
    </span>
  )
}

/**
 * The vendor's whole document set as rows, sorted so the thing that lapses next
 * is at the top.
 *
 * A documents tab is a to-do list before it is an archive, which is why the sort
 * is by expiry rather than by when the row was filed — and why the status chip
 * and the phrase sit together: "Expiring soon · Expires in 12 days" says both
 * what state it is in and how long there is, and neither on its own does.
 */
export function DocumentTable({
  records,
  actions,
}: {
  records: DocumentRecord[]
  actions: DocumentActions
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>For</TableHead>
            <TableHead className="hidden lg:table-cell">Number</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden xl:table-cell">File</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((record) => (
            <TableRow
              key={record.id}
              className={cn(
                record.status === 'Expired' &&
                  'bg-tone-rose/[0.04] shadow-[inset_2px_0_0_0_var(--tone-rose)]',
              )}
            >
              <TableCell className="text-[13px] font-medium wrap-break-word">
                {record.documentType}
              </TableCell>

              <TableCell className="text-[13px]">
                <Subject document={record} />
              </TableCell>

              <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                {record.documentNumber || '—'}
              </TableCell>

              <TableCell className="text-[13px] whitespace-nowrap">
                {record.expiryDate ? (
                  <>
                    <span className="block">{formatDay(record.expiryDate)}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {record.expiryPhrase}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">No expiry</span>
                )}
              </TableCell>

              <TableCell>
                <DocumentStatusBadge value={record.status} />
              </TableCell>

              <TableCell className="hidden xl:table-cell">
                {record.attachment ? (
                  <button
                    type="button"
                    onClick={() => actions.onView(record)}
                    className="inline-flex items-center gap-1.5 rounded-sm text-xs text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Paperclip className="size-3.5" aria-hidden />
                    Attached
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground/70">None</span>
                )}
              </TableCell>

              <TableCell>
                <DocumentMenu document={record} actions={actions} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/** The same list on a narrow screen. */
export function DocumentCards({
  records,
  actions,
}: {
  records: DocumentRecord[]
  actions: DocumentActions
}) {
  return (
    <ul className="divide-y md:hidden">
      {records.map((record) => (
        <li
          key={record.id}
          className={cn(
            'p-4',
            record.status === 'Expired' &&
              'bg-tone-rose/[0.04] shadow-[inset_2px_0_0_0_var(--tone-rose)]',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium wrap-break-word">{record.documentType}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <Subject document={record} />
              </p>
            </div>
            <DocumentMenu document={record} actions={actions} />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {record.documentNumber ? `${record.documentNumber} · ` : ''}
            {record.expiryPhrase}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <DocumentStatusBadge value={record.status} />
            {record.attachment && (
              <button
                type="button"
                onClick={() => actions.onView(record)}
                className="inline-flex items-center gap-1.5 rounded-sm text-xs text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Paperclip className="size-3.5" aria-hidden />
                View file
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
