import * as z from 'zod'

/**
 * Mirrors `LBTS-Backend/src/modules/profile/profile.validation.ts`. The server
 * is the authority; this exists so a mistake is caught before a request is
 * made, and so the messages read the same on both sides. Change one, change
 * both.
 *
 * The messages are translation keys, for the reason `auth-schemas.ts` gives:
 * a schema is evaluated once and cannot re-run for a language change, so
 * `FormField` resolves them where they are drawn. The password rules reach
 * into `auth.validation` deliberately — they are the *same* rules
 * `signUpSchema` enforces, and two copies of a wording is how the two forms
 * come to disagree about what a valid password is.
 *
 * Neither schema carries `role`, `status` or `email`. Those are not omitted by
 * accident — the profile module has no path to them at all.
 */
const PHONE_PATTERN = /^\+?[0-9][0-9\s()-]{5,23}$/

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'profile.validation.nameTooShort')
    .max(80, 'profile.validation.nameTooLong'),
  /** Optional. An empty field is how the number is cleared. */
  phone: z
    .string()
    .trim()
    .max(24, 'profile.validation.phoneTooLong')
    .refine((value) => value.length === 0 || PHONE_PATTERN.test(value), {
      message: 'profile.validation.phoneInvalid',
    }),
})

/**
 * The same policy `signUpSchema` enforces, so the two can never disagree about
 * what a valid password is. Firebase stores it; nothing here ever sees it
 * again after the request.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'profile.validation.currentRequired'),
    newPassword: z
      .string()
      .min(8, 'auth.validation.passwordTooShort')
      .regex(/[a-z]/, 'auth.validation.needsLowercase')
      .regex(/[A-Z]/, 'auth.validation.needsUppercase')
      .regex(/[0-9]/, 'auth.validation.needsNumber'),
    confirmPassword: z.string().min(1, 'profile.validation.confirmRequired'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'auth.validation.passwordsDoNotMatch',
    path: ['confirmPassword'],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'profile.validation.sameAsOld',
    path: ['newPassword'],
  })

export type EditProfileValues = z.infer<typeof editProfileSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
