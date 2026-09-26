import * as z from 'zod'

/**
 * The messages are **translation keys**, not sentences.
 *
 * A schema is built once when this module is evaluated and can never re-run
 * because somebody changed the language — so the only honest thing it can
 * carry is a key, resolved wherever the error is finally drawn. `FormField`
 * and `AuthError` both translate whatever they are handed, and an unknown key
 * resolves to itself, so a message that came from the API rather than from
 * here passes through untouched.
 */

export const signInSchema = z.object({
  email: z.email('auth.validation.emailInvalid'),
  password: z.string().min(1, 'auth.validation.passwordRequired'),
})

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'auth.validation.nameTooShort')
      .max(80, 'auth.validation.nameTooLong'),
    email: z.email('auth.validation.emailInvalid'),
    password: z
      .string()
      .min(8, 'auth.validation.passwordTooShort')
      .regex(/[a-z]/, 'auth.validation.needsLowercase')
      .regex(/[A-Z]/, 'auth.validation.needsUppercase')
      .regex(/[0-9]/, 'auth.validation.needsNumber'),
    confirmPassword: z.string().min(1, 'auth.validation.confirmRequired'),
    acceptTerms: z.literal(true, 'auth.validation.acceptTerms'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'auth.validation.passwordsDoNotMatch',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.email('auth.validation.emailInvalid'),
})

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
