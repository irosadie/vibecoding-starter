import { z } from "zod"

export const productTypeSchema = z.enum(["EXAM", "MENTORING_PACKAGE"])
export const examLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
export const orderStatusSchema = z.enum([
  "PENDING_PAYMENT",
  "PAID",
  "FAILED",
  "EXPIRED",
])

export const catalogExamSlugParamSchema = z.object({
  slug: z.string().trim().min(1, "Exam slug is required"),
})

export const catalogExamQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  level: examLevelSchema.optional(),
  sortBy: z.enum(["popularity", "price", "latest"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
})

export const cartItemParamSchema = z.object({
  id: z.string().uuid("Cart item id is invalid"),
})

export const addCartItemSchema = z.object({
  product_type: productTypeSchema,
  product_id: z.string().uuid("Product id is invalid"),
  quantity: z.coerce.number().int().positive().default(1),
})

export const checkoutSchema = z.object({
  payment_method: z.enum(["BANK_TRANSFER", "EWALLET", "VIRTUAL_ACCOUNT"]),
  channel_code: z.string().trim().min(1, "Channel code is required"),
  success_redirect_url: z.string().url().optional(),
  failure_redirect_url: z.string().url().optional(),
})

export const orderParamSchema = z.object({
  id: z.string().uuid("Order id is invalid"),
})

export const paymentWebhookSchema = z.object({
  reference_id: z.string().trim().min(1, "Reference id is required"),
  status: z.enum(["PAID", "FAILED", "EXPIRED"]),
  paid_amount: z.coerce.number().int().nonnegative().optional(),
  paid_at: z.string().datetime().optional(),
  raw_payload: z.record(z.string(), z.unknown()),
})

export type CatalogExamQuery = z.infer<typeof catalogExamQuerySchema>
export type AddCartItemPayload = z.infer<typeof addCartItemSchema>
export type CheckoutPayload = z.infer<typeof checkoutSchema>
export type PaymentWebhookPayload = z.infer<typeof paymentWebhookSchema>
