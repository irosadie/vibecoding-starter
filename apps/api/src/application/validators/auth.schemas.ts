import { z } from "zod"

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name cannot exceed 120 characters"),
  email: z
    .string()
    .trim()
    .email("Email format is invalid")
    .max(255, "Email cannot exceed 255 characters"),
  password: passwordSchema,
})

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email format is invalid")
    .max(255, "Email cannot exceed 255 characters"),
  password: passwordSchema,
})

export type RegisterPayload = z.infer<typeof registerSchema>
export type LoginPayload = z.infer<typeof loginSchema>
