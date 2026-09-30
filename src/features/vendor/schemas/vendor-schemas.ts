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
  .min(1, 'vendor.validation.mobileRequired')
  .max(32)
  .refine(
    (value) => /^(?:\+?88)?0?1\d{9}$/.test(value.replace(/[\s-]/g, '')),
    'vendor.validation.mobileInvalid',
  )

export const vendorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'vendor.validation.vendorNameTooShort')
    .max(160, 'vendor.validation.vendorNameTooLong'),
  mobile,
  address: z.string().trim().max(400, 'vendor.validation.addressTooLong'),
})
export type VendorFormValues = z.infer<typeof vendorFormSchema>

export const vehicleFormSchema = z.object({
  registrationNo: z
    .string()
    .trim()
    .min(4, 'vendor.validation.registrationTooShort')
    .max(60, 'vendor.validation.registrationTooLong'),
  brand: z.string().trim().max(80),
  model: z.string().trim().max(80),
  ownershipType: z.enum(VEHICLE_OWNERSHIP_TYPES, {
    error: 'vendor.validation.ownershipRequired',
  }),
})
export type VehicleFormValues = z.infer<typeof vehicleFormSchema>

/** A calendar day as the API wants it, or nothing at all. */
const optionalDay = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'vendor.validation.dateInvalid')

export const driverFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'vendor.validation.driverNameTooShort')
      .max(160, 'vendor.validation.driverNameTooLong'),
    mobile,
    nidNumber: z.string().trim().max(40, 'vendor.validation.nidTooLong'),
    address: z.string().trim().max(400),
    licenseNumber: z.string().trim().max(60, 'vendor.validation.licenceTooLong'),
    licenseExpiry: optionalDay,
  })
  /**
   * The same rule the API enforces, restated so it is caught beside the field:
   * an expiry date with no licence number behind it is a deadline attached to
   * nothing, and it would raise a compliance alert nobody could act on because
   * there is no document to go and renew.
   */
  .refine((value) => value.licenseExpiry === '' || value.licenseNumber.length > 0, {
    message: 'vendor.validation.licenceNumberNeeded',
    path: ['licenseNumber'],
  })
export type DriverFormValues = z.infer<typeof driverFormSchema>

export const assignmentFormSchema = z
  .object({
    vehicleId: z.string().min(1, 'vendor.validation.vehicleRequired'),
    driverId: z.string().min(1, 'vendor.validation.driverRequired'),
    assignedFrom: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'vendor.validation.assignedFromRequired'),
    assignedUntil: optionalDay,
    note: z.string().trim().max(400),
  })
  .refine(
    (value) => value.assignedUntil === '' || value.assignedUntil >= value.assignedFrom,
    { message: 'vendor.validation.endBeforeStart', path: ['assignedUntil'] },
  )
export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>

export const documentFormSchema = z
  .object({
    documentType: z.enum(DOCUMENT_TYPES, { error: 'vendor.validation.documentTypeRequired' }),
    documentNumber: z.string().trim().max(80),
    issueDate: optionalDay,
    expiryDate: optionalDay,
    note: z.string().trim().max(400),
  })
  .refine(
    (value) =>
      value.issueDate === '' || value.expiryDate === '' || value.expiryDate >= value.issueDate,
    { message: 'vendor.validation.expiryBeforeIssue', path: ['expiryDate'] },
  )
export type DocumentFormValues = z.infer<typeof documentFormSchema>
