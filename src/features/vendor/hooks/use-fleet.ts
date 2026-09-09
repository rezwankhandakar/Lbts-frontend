import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  changeDriverStatus,
  changeVehicleStatus,
  createAssignment,
  createDocument,
  createDriver,
  createVehicle,
  deleteAssignment,
  deleteDocument,
  deleteDriver,
  deleteVehicle,
  endAssignment,
  fetchAssignableDrivers,
  fetchAssignableVehicles,
  fetchAssignments,
  fetchDocuments,
  fetchDriver,
  fetchDriverAssignments,
  fetchDriverDocuments,
  fetchDrivers,
  fetchVehicle,
  fetchVehicleAssignments,
  fetchVehicleDocuments,
  fetchVehicles,
  removeDriverPhoto,
  updateDocument,
  updateDriver,
  updateVehicle,
  uploadDriverPhoto,
} from '../api/vendor-api'
import type { AssignmentInput, DocumentInput, DriverInput, VehicleInput } from '../api/vendor-api'
import type {
  AssignmentListParams,
  AssignmentRecord,
  DocumentListParams,
  DocumentOwnerType,
  DocumentRecord,
  DriverDetail,
  DriverListParams,
  DriverRecord,
  DriverStatus,
  ListResult,
  VehicleListParams,
  VehicleRecord,
  VehicleStatus,
} from '../types'
import { reportVendorError, useInvalidateVendors } from './use-vendors'

/**
 * The fleet underneath a vendor: its vehicles, its drivers, the assignments
 * between them and their compliance documents.
 *
 * Every key lives under the same `['vendors']` namespace as the vendor itself,
 * because almost every write here changes more than one of them — adding a
 * vehicle changes the vehicle list, the vendor's counts on the directory, the
 * summary, the compliance totals and the activity feed. One invalidation is
 * what keeps the page telling one story.
 */

export const fleetKeys = {
  vehicles: (vendorId: string, params: VehicleListParams) =>
    ['vendors', 'vehicles', vendorId, params] as const,
  assignableVehicles: (vendorId: string) => ['vendors', 'vehicles', vendorId, 'assignable'] as const,
  vehicle: (id: string) => ['vendors', 'vehicle', id] as const,
  vehicleAssignments: (id: string) => ['vendors', 'vehicle', id, 'assignments'] as const,
  vehicleDocuments: (id: string) => ['vendors', 'vehicle', id, 'documents'] as const,

  drivers: (vendorId: string, params: DriverListParams) =>
    ['vendors', 'drivers', vendorId, params] as const,
  assignableDrivers: (vendorId: string) => ['vendors', 'drivers', vendorId, 'assignable'] as const,
  driver: (id: string) => ['vendors', 'driver', id] as const,
  driverAssignments: (id: string) => ['vendors', 'driver', id, 'assignments'] as const,
  driverDocuments: (id: string) => ['vendors', 'driver', id, 'documents'] as const,

  assignments: (vendorId: string, params: AssignmentListParams) =>
    ['vendors', 'assignments', vendorId, params] as const,
  documents: (vendorId: string, params: DocumentListParams) =>
    ['vendors', 'documents', vendorId, params] as const,
}

const LIST_STALE_TIME = 30_000

// --- Vehicles --------------------------------------------------------------

export function useVehicles(
  vendorId: string | undefined,
  params: VehicleListParams,
  enabled = true,
): UseQueryResult<ListResult<VehicleRecord>, ApiError> {
  return useQuery({
    queryKey: fleetKeys.vehicles(vendorId ?? '', params),
    queryFn: () => fetchVehicles(vendorId as string, params),
    enabled: Boolean(vendorId) && enabled,
    staleTime: LIST_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: 2,
  })
}

export function useAssignableVehicles(
  vendorId: string | undefined,
  enabled = true,
): UseQueryResult<VehicleRecord[], ApiError> {
  return useQuery({
    queryKey: fleetKeys.assignableVehicles(vendorId ?? ''),
    queryFn: () => fetchAssignableVehicles(vendorId as string),
    enabled: Boolean(vendorId) && enabled,
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

export function useVehicle(id: string | undefined): UseQueryResult<VehicleRecord, ApiError> {
  return useQuery({
    queryKey: fleetKeys.vehicle(id ?? ''),
    queryFn: () => fetchVehicle(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

export function useVehicleAssignments(
  id: string | undefined,
): UseQueryResult<AssignmentRecord[], ApiError> {
  return useQuery({
    queryKey: fleetKeys.vehicleAssignments(id ?? ''),
    queryFn: () => fetchVehicleAssignments(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

export function useVehicleDocuments(
  id: string | undefined,
): UseQueryResult<DocumentRecord[], ApiError> {
  return useQuery({
    queryKey: fleetKeys.vehicleDocuments(id ?? ''),
    queryFn: () => fetchVehicleDocuments(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

export function useCreateVehicle(
  vendorId: string,
): UseMutationResult<VehicleRecord, ApiError, VehicleInput> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: (input: VehicleInput) => createVehicle(vendorId, input),
    onSuccess: (vehicle) => {
      toast.success(`${vehicle.registrationNo} added as ${vehicle.vehicleCode}`)
      void invalidate()
    },
    onError: reportVendorError,
  })
}

export function useUpdateVehicle(): UseMutationResult<
  VehicleRecord,
  ApiError,
  VehicleInput & { id: string }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: (vehicle) => {
      toast.success(`${vehicle.registrationNo} updated`)
      void invalidate()
    },
    onError: reportVendorError,
  })
}

/**
 * Changing a vehicle's operational state.
 *
 * The toast says what the status decides, because that is the part somebody
 * cannot see: taking a vehicle off the road does not end the assignment it is
 * carrying — a lorry going into the workshop on Tuesday does not mean nobody
 * was driving it on Monday — it stops a *new* driver being put on it.
 */
export function useChangeVehicleStatus(): UseMutationResult<
  VehicleRecord,
  ApiError,
  { id: string; status: VehicleStatus; note?: string }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: changeVehicleStatus,
    onSuccess: (vehicle) => {
      toast.success(`${vehicle.registrationNo} is now ${vehicle.status}`, {
        description:
          vehicle.status === 'Active'
            ? 'It can be given a driver again.'
            : 'Its assignment history is unchanged. It cannot take a new driver until it is active.',
      })
      void invalidate()
    },
    onError: reportVendorError,
  })
}

export function useDeleteVehicle(): UseMutationResult<
  { id: string },
  ApiError,
  { id: string; label: string }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: ({ id }) => deleteVehicle(id),
    onSuccess: (_result, variables) => {
      toast.success(`${variables.label} removed`, {
        description: 'Its assignment history and documents went with it.',
      })
      void invalidate()
    },
    onError: reportVendorError,
  })
}

// --- Drivers ---------------------------------------------------------------

export function useDrivers(
  vendorId: string | undefined,
  params: DriverListParams,
  enabled = true,
): UseQueryResult<ListResult<DriverRecord>, ApiError> {
  return useQuery({
    queryKey: fleetKeys.drivers(vendorId ?? '', params),
    queryFn: () => fetchDrivers(vendorId as string, params),
    enabled: Boolean(vendorId) && enabled,
    staleTime: LIST_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: 2,
  })
}

export function useAssignableDrivers(
  vendorId: string | undefined,
  enabled = true,
): UseQueryResult<DriverRecord[], ApiError> {
  return useQuery({
    queryKey: fleetKeys.assignableDrivers(vendorId ?? ''),
    queryFn: () => fetchAssignableDrivers(vendorId as string),
    enabled: Boolean(vendorId) && enabled,
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

export function useDriver(id: string | undefined): UseQueryResult<DriverDetail, ApiError> {
  return useQuery({
    queryKey: fleetKeys.driver(id ?? ''),
    queryFn: () => fetchDriver(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

export function useDriverAssignments(
  id: string | undefined,
): UseQueryResult<AssignmentRecord[], ApiError> {
  return useQuery({
    queryKey: fleetKeys.driverAssignments(id ?? ''),
    queryFn: () => fetchDriverAssignments(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

export function useDriverDocuments(
  id: string | undefined,
): UseQueryResult<DocumentRecord[], ApiError> {
  return useQuery({
    queryKey: fleetKeys.driverDocuments(id ?? ''),
    queryFn: () => fetchDriverDocuments(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

export function useCreateDriver(
  vendorId: string,
): UseMutationResult<DriverDetail, ApiError, DriverInput> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: (input: DriverInput) => createDriver(vendorId, input),
    onSuccess: (driver) => {
      toast.success(`${driver.name} added as ${driver.driverCode}`, {
        description: driver.licenseNumber
          ? 'The licence was filed as a document, so its expiry now shows in compliance.'
          : undefined,
      })
      void invalidate()
    },
    onError: reportVendorError,
  })
}

export function useUpdateDriver(): UseMutationResult<
  DriverDetail,
  ApiError,
  DriverInput & { id: string }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: updateDriver,
    onSuccess: (driver) => {
      toast.success(`${driver.name} updated`)
      void invalidate()
    },
    onError: reportVendorError,
  })
}

export function useChangeDriverStatus(): UseMutationResult<
  DriverDetail,
  ApiError,
  { id: string; status: DriverStatus; note?: string }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: changeDriverStatus,
    onSuccess: (driver) => {
      toast.success(`${driver.name} is now ${driver.status}`, {
        description:
          driver.status === 'Active'
            ? 'They can be assigned again.'
            : 'Their assignment history is unchanged. They cannot take a new assignment until they are active.',
      })
      void invalidate()
    },
    onError: reportVendorError,
  })
}

export function useDeleteDriver(): UseMutationResult<
  { id: string },
  ApiError,
  { id: string; label: string }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: ({ id }) => deleteDriver(id),
    onSuccess: (_result, variables) => {
      toast.success(`${variables.label} removed`, {
        description: 'Their assignment history and documents went with them.',
      })
      void invalidate()
    },
    onError: reportVendorError,
  })
}

export function useDriverPhoto(): {
  upload: UseMutationResult<DriverDetail, ApiError, { id: string; file: File }>
  remove: UseMutationResult<DriverDetail, ApiError, string>
} {
  const invalidate = useInvalidateVendors()

  const upload = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadDriverPhoto(id, file),
    onSuccess: () => {
      toast.success('Photo updated')
      void invalidate()
    },
    onError: reportVendorError,
  })

  const remove = useMutation({
    mutationFn: removeDriverPhoto,
    onSuccess: () => {
      toast.success('Photo removed')
      void invalidate()
    },
    onError: reportVendorError,
  })

  return { upload, remove }
}

// --- Assignments -----------------------------------------------------------

export function useAssignments(
  vendorId: string | undefined,
  params: AssignmentListParams,
  enabled = true,
): UseQueryResult<ListResult<AssignmentRecord>, ApiError> {
  return useQuery({
    queryKey: fleetKeys.assignments(vendorId ?? '', params),
    queryFn: () => fetchAssignments(vendorId as string, params),
    enabled: Boolean(vendorId) && enabled,
    staleTime: LIST_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: 2,
  })
}

/**
 * Putting a driver on a vehicle.
 *
 * There is deliberately no `onError` toast here. A 409 carrying the live
 * assignment is not a failure — it is the server asking whether to close the
 * current driver's assignment, and the dialog turns it into a question rather
 * than an error message. The caller reports anything else.
 */
export function useCreateAssignment(
  vendorId: string,
): UseMutationResult<AssignmentRecord, ApiError, AssignmentInput> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: (input: AssignmentInput) => createAssignment(vendorId, input),
    onSuccess: (assignment) => {
      toast.success(
        `${assignment.driver?.name ?? 'Driver'} assigned to ${
          assignment.vehicle?.registrationNo ?? 'the vehicle'
        }`,
      )
      void invalidate()
    },
  })
}

export function useEndAssignment(): UseMutationResult<
  AssignmentRecord,
  ApiError,
  { id: string; assignedUntil?: string; note?: string }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: endAssignment,
    onSuccess: (assignment) => {
      toast.success('Assignment ended', {
        description: `${assignment.vehicle?.registrationNo ?? 'The vehicle'} has no driver now.`,
      })
      void invalidate()
    },
    onError: reportVendorError,
  })
}

/**
 * Deleting an assignment row.
 *
 * The toast says what it was for, because this is the one destructive action in
 * the module whose purpose is easy to mistake: it removes a record that should
 * never have existed, and it is not how an assignment finishes.
 */
export function useDeleteAssignment(): UseMutationResult<{ id: string }, ApiError, string> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      toast.success('Assignment record removed', {
        description: 'It is gone from the history rather than marked as ended.',
      })
      void invalidate()
    },
    onError: reportVendorError,
  })
}

// --- Documents -------------------------------------------------------------

export function useDocuments(
  vendorId: string | undefined,
  params: DocumentListParams,
  enabled = true,
): UseQueryResult<ListResult<DocumentRecord>, ApiError> {
  return useQuery({
    queryKey: fleetKeys.documents(vendorId ?? '', params),
    queryFn: () => fetchDocuments(vendorId as string, params),
    enabled: Boolean(vendorId) && enabled,
    staleTime: LIST_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: 2,
  })
}

export function useCreateDocument(): UseMutationResult<
  DocumentRecord,
  ApiError,
  { ownerType: DocumentOwnerType; ownerId: string; input: DocumentInput }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: ({ ownerType, ownerId, input }) => createDocument(ownerType, ownerId, input),
    onSuccess: (document) => {
      toast.success(`${document.documentType} filed for ${document.ownerLabel}`, {
        description: document.expiryDate ? document.expiryPhrase : undefined,
      })
      void invalidate()
    },
    onError: reportVendorError,
  })
}

export function useUpdateDocument(): UseMutationResult<
  DocumentRecord,
  ApiError,
  Partial<DocumentInput> & { id: string }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: updateDocument,
    onSuccess: (document) => {
      toast.success(`${document.documentType} updated`, {
        description: document.expiryDate ? document.expiryPhrase : undefined,
      })
      void invalidate()
    },
    onError: reportVendorError,
  })
}

export function useDeleteDocument(): UseMutationResult<
  { id: string },
  ApiError,
  { id: string; label: string }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: ({ id }) => deleteDocument(id),
    onSuccess: (_result, variables) => {
      toast.success(`${variables.label} removed`)
      void invalidate()
    },
    onError: reportVendorError,
  })
}
