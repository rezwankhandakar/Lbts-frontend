import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  createProductRate,
  deleteProductRate,
  fetchModelMatches,
  fetchProductNames,
  fetchProductRateStats,
  fetchProductRates,
  updateProductRate,
} from '../api/product-rate-api'
import type { ProductRateFormArgs, UpdateProductRateArgs } from '../api/product-rate-api'
import { rateLabel } from '../lib/rate-format'
import type {
  ModelMatch,
  ProductNameMatch,
  ProductRateListParams,
  ProductRateListResult,
  ProductRateRecord,
  ProductRateRemoval,
  ProductRateStats,
} from '../types'

export const productRateKeys = {
  all: ['product-rates'] as const,
  list: (params: ProductRateListParams) => ['product-rates', 'list', params] as const,
  stats: () => ['product-rates', 'stats'] as const,
  models: (model: string) => ['product-rates', 'models', model] as const,
  products: (query: string) => ['product-rates', 'products', query] as const,
}

/**
 * Reference data changes rarely, so it is cached hard.
 *
 * The model lookup in particular: an operator working through one WhatsApp PDF
 * pastes the same handful of model numbers over and over, and re-asking on
 * every keystroke would be a round trip to a sleeping instance for an answer
 * that has not changed since the deploy. Every write invalidates the
 * namespace, so an Admin's correction is still visible immediately.
 */
const REFERENCE_STALE_TIME = 10 * 60_000
const LIST_STALE_TIME = 30_000

export function useProductRates(
  params: ProductRateListParams,
): UseQueryResult<ProductRateListResult, ApiError> {
  return useQuery({
    queryKey: productRateKeys.list(params),
    queryFn: () => fetchProductRates(params),
    staleTime: LIST_STALE_TIME,
    // Keeps the previous page on screen while the next loads, so paging and
    // filtering never blank the table.
    placeholderData: keepPreviousData,
    // A cold Render instance can take most of a minute to wake up.
    retry: 2,
  })
}

/**
 * The overview panel, which is Admin-only on the server.
 *
 * `enabled` is not a convenience: without it every Manager, CEO and Operation
 * Executive opening this page would fire a request the API refuses, spend a
 * cold start on it and get a 403 in the console for a panel they were never
 * shown.
 */
export function useProductRateStats(
  enabled = true,
): UseQueryResult<ProductRateStats, ApiError> {
  return useQuery({
    queryKey: productRateKeys.stats(),
    queryFn: fetchProductRateStats,
    staleTime: LIST_STALE_TIME,
    enabled,
    retry: 2,
  })
}

/**
 * Which products the rate card knows a model by.
 *
 * The caller keeps this off the keystroke path by passing a debounced value
 * and switching it off below a sensible length — a one-character model is a
 * prefix that matches most of the card and helps nobody.
 *
 * No retry. A suggestion that arrives late is worse than none: the operator
 * has already typed past it, and a cold-start retry would spend a minute
 * answering a question nobody is asking any more.
 */
export function useModelMatches(
  model: string,
  enabled: boolean,
): UseQueryResult<ModelMatch[], ApiError> {
  return useQuery({
    queryKey: productRateKeys.models(model),
    queryFn: () => fetchModelMatches(model),
    enabled: enabled && model.length > 0,
    staleTime: REFERENCE_STALE_TIME,
    retry: false,
  })
}

/**
 * Product names the card knows, offered while somebody types in the product
 * box.
 *
 * The counterpart to the model lookup above, and the only assistance a
 * model-less product has: a hair dryer carries no model on the card, so there
 * is nothing to paste and the name is the only way in. Same caching and same
 * no-retry rule, for the same reasons.
 */
export function useProductNameMatches(
  query: string,
  enabled: boolean,
): UseQueryResult<ProductNameMatch[], ApiError> {
  return useQuery({
    queryKey: productRateKeys.products(query),
    queryFn: () => fetchProductNames(query),
    enabled: enabled && query.length > 0,
    staleTime: REFERENCE_STALE_TIME,
    retry: false,
  })
}

/**
 * Every write invalidates the whole namespace. Adding a product changes the
 * list, the counts and the model lookup, so refetching one key would leave the
 * page telling two different stories.
 */
function useInvalidateProductRates() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: productRateKeys.all })
}

/**
 * The generic top-level message for a validation failure tells an Admin
 * nothing, so where the API itemised what was wrong the first entry is shown
 * underneath. The same treatment every other module gives its errors.
 */
export function reportProductRateError(error: ApiError): void {
  const detail = error.errorSources?.find(
    (source) => source.message && source.message !== error.message,
  )

  toast.error(error.message, {
    description: detail
      ? detail.path
        ? `${detail.path}: ${detail.message}`
        : detail.message
      : undefined,
  })
}

/** "Refrigerator 2N5", or just "Hair Dryer" for a row with no model. */
export function productRateLabel(record: {
  productName: string
  productModel: string
}): string {
  return record.productModel ? `${record.productName} ${record.productModel}` : record.productName
}

export function useCreateProductRate(): UseMutationResult<
  ProductRateRecord,
  ApiError,
  ProductRateFormArgs
> {
  const invalidate = useInvalidateProductRates()

  return useMutation({
    mutationFn: createProductRate,
    onSuccess: (record) => {
      toast.success(`${productRateLabel(record)} added to the rate card`, {
        description: `ISD ${rateLabel(record.rates.ISD)} · Metro ${rateLabel(
          record.rates['OSD-Metro'],
        )} · Thana ${rateLabel(record.rates['OSD-Thana'])}`,
      })
      void invalidate()
    },
    onError: reportProductRateError,
  })
}

/**
 * Correcting a row.
 *
 * The toast says what it means rather than "Saved", and what it means here is
 * the opposite of what a location edit means: challans already charged from
 * this row keep their figures, because the rate that applied in March was the
 * right rate for March. An Admin who expects a correction to ripple backwards
 * needs to be told plainly that it does not.
 */
export function useUpdateProductRate(): UseMutationResult<
  ProductRateRecord,
  ApiError,
  UpdateProductRateArgs
> {
  const invalidate = useInvalidateProductRates()

  return useMutation({
    mutationFn: updateProductRate,
    onSuccess: (record) => {
      toast.success(`${productRateLabel(record)} updated`, {
        description: record.isActive
          ? 'Challans filed from now on use the new figures. Ones already charged keep theirs.'
          : 'It is deactivated, so it prices nothing and is offered nowhere.',
      })
      void invalidate()
    },
    onError: reportProductRateError,
  })
}

/**
 * Removing one.
 *
 * Two outcomes, and the toast has to tell them apart. A row nothing was
 * charged from is deleted; a row challans cite is deactivated and kept, so
 * "where did this figure come from" stays answerable. Reporting that as a
 * deletion would leave an Admin believing they had removed something that is
 * still cited by a year of records.
 */
export function useDeleteProductRate(): UseMutationResult<
  ProductRateRemoval,
  ApiError,
  { id: string; label: string }
> {
  const invalidate = useInvalidateProductRates()

  return useMutation({
    mutationFn: ({ id }) => deleteProductRate(id),
    onSuccess: (result, variables) => {
      toast.success(
        result.deactivated ? `${variables.label} deactivated` : `${variables.label} removed`,
        {
          description: result.deactivated
            ? `${result.challanCount} challan${
                result.challanCount === 1 ? ' was' : 's were'
              } charged from it, so it was kept and taken out of use instead.`
            : 'Nothing was ever charged from it, so it is gone.',
        },
      )
      void invalidate()
    },
    onError: reportProductRateError,
  })
}
