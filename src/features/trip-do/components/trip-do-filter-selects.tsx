import { Link2, ListFilter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { KIND_FILTER_LABELS, LINK_FILTER_LABELS } from '../lib/trip-do-meta'
import type {
  TripDoFilterPatch,
  TripDoKindFilter,
  TripDoLinkFilter,
  TripDoListParams,
} from '../types'

const TRIGGER = 'h-8 w-full sm:w-[11.5rem]'

interface TripDoFilterSelectsProps {
  params: TripDoListParams
  onChange: (patch: TripDoFilterPatch) => void
}

/**
 * The two filters that are not a column: whether a Trip DO is set, and which
 * kind of row. Everything a column shows is filtered in the row under its
 * header instead.
 */
export function TripDoFilterSelects({ params, onChange }: TripDoFilterSelectsProps) {
  return (
    <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
      <Select
        value={params.link}
        onValueChange={(value) => onChange({ link: value as TripDoLinkFilter })}
      >
        <SelectTrigger className={TRIGGER} aria-label="Filter by Trip DO">
          <Link2 className="size-3.5 text-muted-foreground" aria-hidden />
          <SelectValue>
            {(value) => LINK_FILTER_LABELS[(value as TripDoLinkFilter) ?? 'all']}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {(Object.keys(LINK_FILTER_LABELS) as TripDoLinkFilter[]).map((value) => (
              <SelectItem key={value} value={value}>
                {LINK_FILTER_LABELS[value]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={params.kind}
        onValueChange={(value) => onChange({ kind: value as TripDoKindFilter })}
      >
        <SelectTrigger className={TRIGGER} aria-label="Filter by row type">
          <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
          <SelectValue>
            {(value) => KIND_FILTER_LABELS[(value as TripDoKindFilter) ?? 'all']}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {(Object.keys(KIND_FILTER_LABELS) as TripDoKindFilter[]).map((value) => (
              <SelectItem key={value} value={value}>
                {KIND_FILTER_LABELS[value]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
