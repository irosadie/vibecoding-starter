import { z } from "zod"

export const examProductLevels = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const

export const examProductLevelLabels = [
  { label: "Beginner", value: "BEGINNER" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Advanced", value: "ADVANCED" },
] as const

export const getExamProductLevelLabel = (
  value: (typeof examProductLevels)[number],
) => {
  const level = examProductLevelLabels.find(
    (levelOption) => levelOption.value === value,
  )

  return level?.label ?? value
}

export const commerceProductTypes = ["EXAM", "MENTORING_PACKAGE"] as const

export const commerceOrderStatuses = [
  "PENDING_PAYMENT",
  "PAID",
  "FAILED",
  "EXPIRED",
] as const

export const commerceProductTypeSchema = z.enum(commerceProductTypes)
export const commerceOrderStatusSchema = z.enum(commerceOrderStatuses)
export const examProductLevelSchema = z.enum(examProductLevels)

export const examCatalogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  level: examProductLevelSchema.optional(),
})

export const addCommerceCartItemSchema = z.object({
  product_type: commerceProductTypeSchema,
  product_id: z.string().uuid("Product id is invalid"),
  quantity: z.coerce.number().int().positive().default(1),
})

export const checkoutCommerceSchema = z.object({
  payment_method: z.enum(["BANK_TRANSFER", "EWALLET", "VIRTUAL_ACCOUNT"]),
  channel_code: z.string().trim().min(1, "Channel code is required"),
  success_redirect_url: z.string().url().optional(),
  failure_redirect_url: z.string().url().optional(),
})

export type ExamCatalogQuerySchemaProps = z.infer<typeof examCatalogQuerySchema>
export type AddCommerceCartItemSchemaProps = z.infer<
  typeof addCommerceCartItemSchema
>
export type CheckoutCommerceSchemaProps = z.infer<typeof checkoutCommerceSchema>
export type CommerceOrderStatus = z.infer<typeof commerceOrderStatusSchema>
