import { useCallback, useMemo, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import type { DriverRecord } from '@/features/vendor/types'
import {
  createTrip,
  fetchChallanCandidates,
  overagesFrom,
  updateTrip,
} from '../api/delivery-api'
import { EMPTY_CART, toPayload } from '../lib/cart'
import { localToday, newSubmissionKey, shortTripNumber } from '../lib/delivery-meta'
import type {
  CartState,
  TripDriverRef,
  TripOverage,
  TripRecord,
  TripVehicleOption,
} from '../types'
import { reportDeliveryError, useInvalidateDeliveries } from './use-deliveries'
import { useTripCart } from './use-trip-cart'
import type { TripCart } from './use-trip-cart'

/** A driver as the trip holds them — whichever list they were picked from. */
export type TripDriverChoice = Omit<TripDriverRef, 'blocker'>

export function driverChoiceFrom(driver: TripDriverRef | DriverRecord): TripDriverChoice {
  return {
    id: driver.id,
    driverCode: driver.driverCode,
    name: driver.name,
    mobile: driver.mobile,
    photoUrl: driver.photoUrl,
    licenseNumber: driver.licenseNumber,
    licenseExpiry: driver.licenseExpiry,
    licenceStatus: driver.licenceStatus,
    licencePhrase: driver.licencePhrase,
    status: driver.status,
  }
}

interface WorkspaceSeed {
  /** The trip being corrected, or undefined for a new one. */
  trip?: TripRecord
  vehicle?: TripVehicleOption | null
  driver?: TripDriverChoice | null
  cart?: CartState
}

export interface TripWorkspace {
  editing: TripRecord | null
  vehicle: TripVehicleOption | null
  driver: TripDriverChoice | null
  tripDate: string
  note: string
  cart: TripCart
  /** What stands between this cart and Confirm, in words. Empty when it can go. */
  blockers: string[]
  isDirty: boolean
  isSaving: boolean
  /** The over-allocation question the server asked, awaiting an answer. */
  overages: TripOverage[] | null
  /** The trip a confirmation just produced. */
  created: TripRecord | null
  selectVehicle: (option: TripVehicleOption | null) => void
  selectDriver: (driver: TripDriverChoice | null) => void
  setTripDate: (value: string) => void
  setNote: (value: string) => void
  confirm: (acknowledgeOverage?: boolean) => void
  dismissOverages: () => void
  startAnother: () => void
}

/**
 * The state behind one trip being built or corrected.
 *
 * It holds four things — the vehicle, the driver for this run, the day and the
 * cart — and the one rule tying them together: choosing a vehicle offers its
 * assigned driver as the default, **only when that driver can drive**. An
 * assigned driver on leave is not silently put on the trip; the driver card
 * explains why the slot is empty instead.
 *
 * Choosing a different driver changes this trip and nothing else. The
 * vehicle's assignment in the Vendor module is not touched, here or on the
 * server.
 */
export function useTripWorkspace(seed: WorkspaceSeed = {}): TripWorkspace {
  const editing = seed.trip ?? null
  const [vehicle, setVehicle] = useState<TripVehicleOption | null>(seed.vehicle ?? null)
  const [driver, setDriver] = useState<TripDriverChoice | null>(seed.driver ?? null)
  const [tripDate, setTripDate] = useState(editing?.tripDate ?? localToday())
  const [note, setNote] = useState(editing?.note ?? '')
  const [overages, setOverages] = useState<TripOverage[] | null>(null)
  const [created, setCreated] = useState<TripRecord | null>(null)
  const [touched, setTouched] = useState(false)

  // Read once: the seed is what the workspace opened with, whatever the caller
  // passes on later renders.
  const [initialCart] = useState(seed.cart ?? EMPTY_CART)
  const cart = useTripCart(initialCart)
  const submissionKey = useRef(newSubmissionKey())
  const invalidate = useInvalidateDeliveries()

  const selectVehicle = useCallback(
    (option: TripVehicleOption | null) => {
      if (option && editing && option.vendor.id !== editing.vendor.id) {
        toast.error(`${shortTripNumber(editing.tripNumber)} is ${editing.vendor.name}'s trip`, {
          description: `Choose one of their vehicles, or delete this trip and confirm a new one under ${option.vendor.name}.`,
        })
        return
      }

      setVehicle(option)
      setTouched(true)
      const assigned = option?.currentDriver
      setDriver(assigned && assigned.blocker === null ? driverChoiceFrom(assigned) : null)
    },
    [editing],
  )

  const selectDriver = useCallback((next: TripDriverChoice | null) => {
    setDriver(next)
    setTouched(true)
  }, [])

  const mutation = useMutation<TripRecord, ApiError, boolean>({
    mutationFn: (acknowledgeOverage) => {
      const payload = {
        vehicleId: vehicle?.vehicle.id ?? '',
        driverId: driver?.id ?? '',
        tripDate,
        note: note.trim(),
        challans: toPayload(cart.state),
        acknowledgeOverage,
      }
      return editing
        ? updateTrip({ id: editing.id, ...payload })
        : createTrip({ ...payload, submissionKey: submissionKey.current })
    },
    onSuccess: (trip) => {
      setOverages(null)
      setCreated(trip)
      setTouched(false)
      void invalidate()
    },
    onError: (error) => {
      const asked = error.statusCode === 409 ? overagesFrom(error.body) : null

      // Another trip may have taken some of these challans since they were
      // added, so "remaining" on every card is re-read either way. Best
      // effort: a failure here leaves the figures as they were.
      const ids = cart.state.challans.map((challan) => challan.challanId)
      if (ids.length > 0) {
        void fetchChallanCandidates(ids, editing?.id)
          .then(cart.refresh)
          .catch(() => undefined)
      }

      if (asked) {
        setOverages(asked)
        return
      }
      setOverages(null)
      reportDeliveryError(error)
    },
  })

  const blockers = useMemo(() => {
    const reasons: string[] = []
    if (!vehicle) {
      reasons.push('Choose a vehicle.')
    } else if (vehicle.blocker) {
      reasons.push(`${vehicle.vehicle.registrationNo} cannot take a trip. ${vehicle.blocker}`)
    }
    if (!driver) {
      reasons.push('Choose the driver for this trip.')
    } else if (driver.status !== 'Active') {
      reasons.push(`${driver.name} is ${driver.status} and cannot drive.`)
    }
    if (cart.summary.challans === 0) {
      reasons.push('Add at least one challan.')
    }
    if (!tripDate) {
      reasons.push('Choose the trip date.')
    }
    return reasons
  }, [vehicle, driver, cart.summary.challans, tripDate])

  const isDirty = !created && (touched || cart.state !== initialCart)
  useUnsavedChanges(isDirty && cart.summary.challans > 0)

  const confirm = useCallback(
    (acknowledgeOverage = false) => {
      if (blockers.length === 0 && !mutation.isPending) {
        mutation.mutate(acknowledgeOverage)
      }
    },
    [blockers.length, mutation],
  )

  const startAnother = useCallback(() => {
    submissionKey.current = newSubmissionKey()
    setCreated(null)
    setVehicle(null)
    setDriver(null)
    setNote('')
    setTripDate(localToday())
    setTouched(false)
    cart.reset()
  }, [cart])

  return {
    editing,
    vehicle,
    driver,
    tripDate,
    note,
    cart,
    blockers,
    isDirty,
    isSaving: mutation.isPending,
    overages,
    created,
    selectVehicle,
    selectDriver,
    setTripDate: (value) => {
      setTripDate(value)
      setTouched(true)
    },
    setNote: (value) => {
      setNote(value)
      setTouched(true)
    },
    confirm,
    dismissOverages: () => setOverages(null),
    startAnother,
  }
}
