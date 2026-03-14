import { z } from "zod"

export const creatorApplicationStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
])

export const creatorApplicationIdParamSchema = z.object({
  id: z.string().uuid("Creator application id is invalid"),
})

export const submitCreatorApplicationFormSchema = z.object({
  payout_account_name: z
    .string()
    .trim()
    .min(1, "Payout account name is required")
    .max(255, "Payout account name cannot exceed 255 characters"),
  payout_bank_name: z
    .string()
    .trim()
    .min(1, "Payout bank name is required")
    .max(100, "Payout bank name cannot exceed 100 characters"),
  payout_account_number: z
    .string()
    .trim()
    .min(6, "Payout account number must be at least 6 characters")
    .max(100, "Payout account number cannot exceed 100 characters"),
  ktp_file: z.instanceof(File, { message: "KTP file is required" }),
})

export const listCreatorApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().min(1).optional(),
  status: creatorApplicationStatusSchema.optional(),
})

export const approveCreatorApplicationSchema = z.object({
  review_note: z
    .string()
    .trim()
    .min(1, "Review note must be at least 1 character")
    .max(1000, "Review note cannot exceed 1000 characters")
    .optional(),
})

export const rejectCreatorApplicationSchema = z.object({
  review_note: z
    .string()
    .trim()
    .min(3, "Review note must be at least 3 characters")
    .max(1000, "Review note cannot exceed 1000 characters"),
})

export type SubmitCreatorApplicationFormPayload = z.infer<
  typeof submitCreatorApplicationFormSchema
>
export type ListCreatorApplicationsQuery = z.infer<
  typeof listCreatorApplicationsQuerySchema
>
export type ApproveCreatorApplicationPayload = z.infer<
  typeof approveCreatorApplicationSchema
>
export type RejectCreatorApplicationPayload = z.infer<
  typeof rejectCreatorApplicationSchema
>
