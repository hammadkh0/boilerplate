import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/, {
    message: 'Password must be 8 to 72 characters and include upper, lower, and a number',
  });

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(72),
});

export const registerSchema = z
  .object({
    email: z.email().max(254),
    fullName: z.string().trim().min(1).max(120),
    password: passwordSchema,
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const forgotPasswordSchema = z.object({
  email: z.email().max(254),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(128),
    password: passwordSchema,
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(72),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
