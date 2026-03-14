export const PRODUCT_TYPES = ["EXAM", "MENTORING_PACKAGE"] as const
export type ProductType = (typeof PRODUCT_TYPES)[number]

export const EXAM_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const
export type ExamLevel = (typeof EXAM_LEVELS)[number]

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "FAILED",
  "EXPIRED",
] as const
export type CommerceOrderStatus = (typeof ORDER_STATUSES)[number]

export type CommerceCatalogExam = {
  id: string
  slug: string
  title: string
  category: string
  level: ExamLevel
  shortDescription: string
  description: string
  priceAmount: number
  isPublished: boolean
}

export type CommerceCartItem = {
  id: string
  userId: string
  productType: ProductType
  productId: string
  titleSnapshot: string
  unitPrice: number
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export type CommerceCartSummary = {
  totalItems: number
  subtotalAmount: number
  discountAmount: number
  grandTotalAmount: number
}

export type CommerceOrderItem = {
  id: string
  orderId: string
  productType: ProductType
  productId: string
  titleSnapshot: string
  priceAmount: number
  quantity: number
}

export type CommerceOrder = {
  id: string
  userId: string
  status: CommerceOrderStatus
  totalAmount: number
  paymentProvider: string | null
  paymentReference: string | null
  paidAt: Date | null
  failedAt: Date | null
  expiredAt: Date | null
  items: CommerceOrderItem[]
}

export type CommerceOwnership = {
  id: string
  userId: string
  orderId: string
  productType: ProductType
  productId: string
  grantedAt: Date
}
