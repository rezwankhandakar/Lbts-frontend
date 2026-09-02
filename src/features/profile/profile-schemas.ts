import * as z from 'zod'

/**
 * Mirrors `LBTS-Backend/src/modules/profile/profile.validation.ts`. The server
 * is the authority; this exists so a mistake is caught before a request is
 * made, and so the messages read the same on both sides. Change one, change
 * both.
 *
 * Neither schema carries `role`, `status` or `email`. Those are not omitted by
 * accident — the profile module has no path to them at all.
 */
const PHONE_PATTERN = /^\+?[0-9][0-9\s()-]{5,23}$/

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be 80 characters or fewer'),
  /** Optional. An empty field is how the number is cleared. */
  phone: z
    .string()
    .trim()
    .max(24, 'Phone number must be 24 characters or fewer')
    .refine((value) => value.length === 0 || PHONE_PATTERN.test(value), {
      message: 'Enter a valid phone number, for example +880 1712 345678',
    }),
})

/**
 * The same policy `signUpSchema` enforces, so the two can never disagree about
 * what a valid password is. Firebase stores it; nothing here ever sees it
 * again after the request.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Include at least one lowercase letter')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'Choose a password you have not used here before',
    path: ['newPassword'],
  })

export type EditProfileValues = z.infer<typeof editProfileSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
