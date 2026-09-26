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
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

interface ProductRateFiltersProps {
  params: ProductRateListParams
  onChange: (patch: ProductRateFilterPatch) => void
  onReset: () => void
  onAdd: () => void
  canManage: boolean
  summary?: string
}

const TRIGGER = 'h-8 w-full sm:w-[11rem]'

const MODEL_KEYS: Record<ProductRateModelFilter, TranslationKey> = {
  all: 'productRate.filters.modelAll',
  yes: 'productRate.filters.modelYes',
  no: 'productRate.filters.modelNo',
}

const ACTIVE_KEYS: Record<ProductRateActiveFilter, TranslationKey> = {
  all: 'productRate.filters.activeAll',
  active: 'productRate.filters.activeOnly',
  inactive: 'productRate.filters.inactiveOnly',
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
  const t = useT()

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
              placeholder={t('productRate.filters.searchPlaceholder')}
              aria-label={t('productRate.filters.searchAria')}
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={params.hasModel}
              onValueChange={(value) => onChange({ hasModel: value as ProductRateModelFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label={t('productRate.filters.modelAria')}>
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) => t(MODEL_KEYS[(value as ProductRateModelFilter) ?? 'all'])}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(MODEL_KEYS) as ProductRateModelFilter[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(MODEL_KEYS[value])}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.active}
              onValueChange={(value) => onChange({ active: value as ProductRateActiveFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label={t('productRate.filters.activeAria')}>
                <SelectValue>
                  {(value) => t(ACTIVE_KEYS[(value as ProductRateActiveFilter) ?? 'all'])}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(ACTIVE_KEYS) as ProductRateActiveFilter[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(ACTIVE_KEYS[value])}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
                <X data-icon="inline-start" aria-hidden />
                {t('common.actions.clear')}
              </Button>
            )}

            {canManage && (
              <Button size="sm" onClick={onAdd}>
                <Plus data-icon="inline-start" aria-hidden />
                {t('productRate.addProduct')}
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
