import { ListFilter, Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  ProductRateActiveFilter,
  ProductRateFilterPatch,
  ProductRateListParams,
  ProductRateModelFilter,
} from '../types'

interface ProductRateFiltersProps {
  params: ProductRateListParams
  onChange: (patch: ProductRateFilterPatch) => void
  onReset: () => void
  onAdd: () => void
  canManage: boolean
  summary?: string
}

const TRIGGER = 'h-8 w-full sm:w-[11rem]'

const MODEL_LABELS: Record<ProductRateModelFilter, string> = {
  all: 'With and without model',
  yes: 'Has a model',
  no: 'Any model',
}

const ACTIVE_LABELS: Record<ProductRateActiveFilter, string> = {
  all: 'Active and inactive',
  active: 'Active only',
  inactive: 'Inactive only',
}

/**
 * Search and filters for the rate card.
 *
 * All applied server-side, like every other list in this app. The search box
 * covers the product, the model and the capacity, because somebody looking for
 * a rate has one of the three in mind and rarely knows which of them the card
 * printed it under.
 *
 * The model filter is the one control here the location list has no equivalent
 * of, and it earns its place: "which products are priced whatever model they
 * carry" is the question behind half the card, and there is no way to ask it
 * by searching for a blank.
 */
export function ProductRateFilters({
  params,
  onChange,
  onReset,
  onAdd,
  canManage,
  summary,
}: ProductRateFiltersProps) {
  const isFiltered =
    params.search !== '' ||
    params.productName !== '' ||
    params.hasModel !== 'all' ||
    params.active !== 'all'

  return (
    <div className="border-b">
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={params.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Product, model or capacity"
              aria-label="Search the rate card"
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={params.hasModel}
              onValueChange={(value) => onChange({ hasModel: value as ProductRateModelFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by whether it names a model">
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) => MODEL_LABELS[(value as ProductRateModelFilter) ?? 'all']}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(MODEL_LABELS) as ProductRateModelFilter[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {MODEL_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.active}
              onValueChange={(value) => onChange({ active: value as ProductRateActiveFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by whether it is in use">
                <SelectValue>
                  {(value) => ACTIVE_LABELS[(value as ProductRateActiveFilter) ?? 'all']}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(ACTIVE_LABELS) as ProductRateActiveFilter[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {ACTIVE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
                <X data-icon="inline-start" aria-hidden />
                Clear
              </Button>
            )}

            {canManage && (
              <Button size="sm" onClick={onAdd}>
                <Plus data-icon="inline-start" aria-hidden />
                Add product
              </Button>
            )}
          </div>
        </div>

        {summary && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {summary}
          </p>
        )}
      </div>
    </div>
  )
}
