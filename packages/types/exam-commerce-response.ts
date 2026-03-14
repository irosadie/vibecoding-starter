export type CatalogExamLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
export type CommerceOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "FAILED"
  | "EXPIRED"

export type CatalogExamResponseProps = {
  id: string
  slug: string
  title: string
  category: string
  level: CatalogExamLevel
  short_description: string
  thumbnail_url?: string
  benefits?: string[]
  is_owned?: boolean
  description?: string
  price_amount: number
  is_published: boolean
}

export type CommerceCartItemResponseProps = {
  id: string
  product_type: "EXAM" | "MENTORING_PACKAGE"
  product_id: string
  title: string
  price_amount: number
  quantity: number
  subtotal_amount: number
}

export type CommerceCartResponseProps = {
  items: CommerceCartItemResponseProps[]
  summary: {
    total_items: number
    subtotal_amount: number
    discount_amount: number
    grand_total_amount: number
  }
}

export type CommerceOrderItemResponseProps = {
  product_type: "EXAM" | "MENTORING_PACKAGE"
  product_id: string
  title: string
  price_amount: number
  quantity: number
}

export type CommerceOrderResponseProps = {
  id: string
  status: CommerceOrderStatus
  total_amount: number
  payment_provider: string | null
  payment_reference: string | null
  paid_at: string | null
  failed_at: string | null
  expired_at: string | null
  items: CommerceOrderItemResponseProps[]
}

export type CommerceOwnershipResponseProps = {
  id: string
  user_id: string
  product_type: "EXAM" | "MENTORING_PACKAGE"
  product_id: string
  order_id: string
  granted_at: string
}
