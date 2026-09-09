import * as z from 'zod'
import { DOCUMENT_TYPES, VEHICLE_OWNERSHIP_TYPES } from '../types'

/**
 * Mirrors `LBTS-Backend/src/modules/vendor/vendor.validation.ts`.
 *
 * The server enforces every one of these; this exists so somebody sees the
 * problem beside the field rather than in a toast after a round trip to a
 * sleeping instance. Change one, change both.
 *
 * What is deliberately absent from all of them is the same list the backend
 * schemas leave out: a vendor code, a vehicle code, a driver code, any
 * comparison key, a document status, and — everywhere — a `vendorId`. The owner
 * comes from the URL and is scope-checked; a field for it here would be a
 * second source for something that must have exactly one.
 */

/**
 * The same loose check the API applies: eleven digits starting `01`, however it
 * is written. Loose rather than strict on purpose — a mobile number is what a
 * dispatcher rings, and a directory full of half-typed numbers is a directory
 * nobody trusts, but refusing an unusual but real number is worse.
 */
const mobile = z
  .string()
  .trim()
  .min(1, 'Mobile number is required')
  .max(32)
  .refine(
    (value) => /^(?:\+?88)?0?1\d{9}$/.test(value.replace(/[\s-]/g, '')),
    'Enter an 11-digit mobile number, for example 01712345678.',
  )

export const vendorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Vendor name must be at least 2 characters')
    .max(160, 'Vendor name must be 160 characters or fewer'),
  mobile,
  address: z.string().trim().max(400, 'Address must be 400 characters or fewer'),
})
export type VendorFormValues = z.infer<typeof vendorFormSchema>

export const vehicleFormSchema = z.object({
  registrationNo: z
    .string()
    .trim()
    .min(4, 'Registration number must be at least 4 characters')
    .max(60, 'Registration number must be 60 characters or fewer'),
  brand: z.string().trim().max(80),
  model: z.string().trim().max(80),
  ownershipType: z.enum(VEHICLE_OWNERSHIP_TYPES, { error: 'Choose how the vehicle is owned.' }),
})
export type VehicleFormValues = z.infer<typeof vehicleFormSchema>

/** A calendar day as the API wants it, or nothing at all. */
const optionalDay = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Use a valid date.')

export const driverFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Driver name must be at least 2 characters')
      .max(160, 'Driver name must be 160 characters or fewer'),
    mobile,
    nidNumber: z.string().trim().max(40, 'NID must be 40 characters or fewer'),
    address: z.string().trim().max(400),
    licenseNumber: z.string().trim().max(60, 'Licence number must be 60 characters or fewer'),
    licenseExpiry: optionalDay,
  })
  /**
   * The same rule the API enforces, restated so it is caught beside the field:
   * an expiry date with no licence number behind it is a deadline attached to
   * nothing, and it would raise a compliance alert nobody could act on because
   * there is no document to go and renew.
   */
  .refine((value) => value.licenseExpiry === '' || value.licenseNumber.length > 0, {
    message: 'Add the licence number this expiry date belongs to.',
    path: ['licenseNumber'],
  })
export type DriverFormValues = z.infer<typeof driverFormSchema>

export const assignmentFormSchema = z
  .object({
    vehicleId: z.string().min(1, 'Choose a vehicle.'),
    driverId: z.string().min(1, 'Choose a driver.'),
    assignedFrom: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose the date the assignment starts.'),
    assignedUntil: optionalDay,
    note: z.string().trim().max(400),
  })
  .refine(
    (value) => value.assignedUntil === '' || value.assignedUntil >= value.assignedFrom,
    { message: 'The end date cannot be before the start date.', path: ['assignedUntil'] },
  )
export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>

export const documentFormSchema = z
  .object({
    documentType: z.enum(DOCUMENT_TYPES, { error: 'Choose a document type.' }),
    documentNumber: z.string().trim().max(80),
    issueDate: optionalDay,
    expiryDate: optionalDay,
    note: z.string().trim().max(400),
  })
  .refine(
    (value) =>
      value.issueDate === '' || value.expiryDate === '' || value.expiryDate >= value.issueDate,
    { message: 'The expiry date cannot be before the issue date.', path: ['expiryDate'] },
  )
export type DocumentFormValues = z.infer<typeof documentFormSchema>
