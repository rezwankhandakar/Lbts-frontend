import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type {
  AssignmentFilterPatch,
  AssignmentListParams,
  DocumentFilterPatch,
  DocumentListParams,
  DriverFilterPatch,
  DriverListParams,
  VehicleFilterPatch,
  VehicleListParams,
  VendorFilterPatch,
  VendorListParams,
} from '../types'

/**
 * The state behind each of the module's five lists.
 *
 * The same shape the challan, gate pass and location lists use, for the same
 * reason: more than one thing reads it — the table, the toolbar summary, the
 * pagination — and a second copy of "what is currently being shown" is how a
 * summary ends up describing a list nobody was looking at.
 *
 * Filters live in component state rather than in the URL, which is the
 * convention this app already follows for every other list. The one thing that
 * *is* in the URL on the vendor details page is the open tab, because a link to
 * somebody's fleet is worth sharing and the browser's back button should step
 * between tabs.
 */

interface Controller<TParams, TPatch> {
  /** What the controls render from — the search box included, as it is typed. */
  params: TParams
  /** What the server is actually asked for: the same thing, search settled. */
  applied: TParams
  isFiltered: boolean
  applyFilters: (patch: TPatch) => void
  setPage: (page: number) => void
  /** Pulls the page back inside a result set that has just shrunk. */
  clampToPages: (totalPages: number) => void
  reset: () => void
}

/**
 * The shared machinery. Every list here debounces its search, returns to page
 * one on any change of filter, and can be clamped after a deletion — so the
 * five controllers below differ only in their initial params and in what counts
 * as filtered.
 */
function useListParams<TParams extends { page: number; search?: string }, TPatch>(
  initial: TParams,
  isFilteredOf: (params: TParams) => boolean,
): Controller<TParams, TPatch> {
  const [params, setParams] = useState<TParams>(initial)

  // Typing must not fire a request per keystroke; the debounced value is what
  // reaches the query key, so the cache holds settled searches only.
  const debouncedSearch = useDebouncedValue(params.search ?? '', 350)

  const applied = useMemo(
    () => (params.search === undefined ? params : { ...params, search: debouncedSearch }),
    [params, debouncedSearch],
  )

  /**
   * Any narrowing of the result set invalidates the current page number, so
   * every filter change returns to page one in the same update — there is never
   * a render where the page and the filters disagree.
   */
  const applyFilters = useCallback((patch: TPatch) => {
    setParams((current) => ({ ...current, ...patch, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setParams((current) => ({ ...current, page }))
  }, [])

  const clampToPages = useCallback((totalPages: number) => {
    setParams((current) => (current.page > totalPages ? { ...current, page: totalPages } : current))
  }, [])

  const reset = useCallback(() => setParams(initial), [initial])

  return {
    params,
    applied,
    isFiltered: isFilteredOf(params),
    applyFilters,
    setPage,
    clampToPages,
    reset,
  }
}

const VENDOR_INITIAL: VendorListParams = {
  page: 1,
  limit: 10,
  search: '',
  status: 'all',
  compliance: 'all',
  sort: 'name',
}

export function useVendorListParams(): Controller<VendorListParams, VendorFilterPatch> {
  return useListParams(
    VENDOR_INITIAL,
    (params) =>
      params.search !== '' ||
      params.status !== 'all' ||
      params.compliance !== 'all' ||
      // Sorting is not a filter, and counting it as one would make "Clear" a
      // button that silently re-ordered the list somebody had just arranged.
      false,
  )
}

/**
 * Twelve rather than ten. A fleet tab is scanned rather than read, and twelve
 * rows fill a desktop viewport without a scroll while still being one screenful
 * of cards on a phone.
 */
const FLEET_PAGE_SIZE = 12

const VEHICLE_INITIAL: VehicleListParams = {
  page: 1,
  limit: FLEET_PAGE_SIZE,
  search: '',
  status: 'all',
  ownershipType: 'all',
  brand: '',
}

export function useVehicleListParams(): Controller<VehicleListParams, VehicleFilterPatch> {
  return useListParams(
    VEHICLE_INITIAL,
    (params) =>
      params.search !== '' ||
      params.status !== 'all' ||
      params.ownershipType !== 'all' ||
      params.brand !== '',
  )
}

const DRIVER_INITIAL: DriverListParams = {
  page: 1,
  limit: FLEET_PAGE_SIZE,
  search: '',
  status: 'all',
  licence: 'all',
}

export function useDriverListParams(): Controller<DriverListParams, DriverFilterPatch> {
  return useListParams(
    DRIVER_INITIAL,
    (params) => params.search !== '' || params.status !== 'all' || params.licence !== 'all',
  )
}

const ASSIGNMENT_INITIAL: AssignmentListParams = {
  page: 1,
  limit: FLEET_PAGE_SIZE,
  status: 'all',
  vehicleId: '',
  driverId: '',
  from: '',
  to: '',
}

export function useAssignmentListParams(): Controller<
  AssignmentListParams,
  AssignmentFilterPatch
> {
  return useListParams(
    ASSIGNMENT_INITIAL,
    (params) =>
      params.status !== 'all' ||
      params.vehicleId !== '' ||
      params.driverId !== '' ||
      params.from !== '' ||
      params.to !== '',
  )
}

const DOCUMENT_INITIAL: DocumentListParams = {
  page: 1,
  limit: FLEET_PAGE_SIZE,
  ownerType: 'all',
  ownerId: '',
  documentType: 'all',
  status: 'all',
  search: '',
}

export function useDocumentListParams(): Controller<DocumentListParams, DocumentFilterPatch> {
  return useListParams(
    DOCUMENT_INITIAL,
    (params) =>
      params.search !== '' ||
      params.ownerType !== 'all' ||
      params.ownerId !== '' ||
      params.documentType !== 'all' ||
      params.status !== 'all',
  )
}
