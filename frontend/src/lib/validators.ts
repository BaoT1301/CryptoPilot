import { z } from 'zod';

// Schema definitions
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: emailSchema,
  password: passwordSchema,
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});


// Type exports
export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;