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
