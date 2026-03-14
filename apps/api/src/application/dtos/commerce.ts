import type {
  CommerceOrderStatus,
  ExamLevel,
  ProductType,
} from "@/domain/entities/Commerce"

export type CatalogExamDto = {
  id: string
  slug: string
  title: string
  category: string
  level: ExamLevel
  short_description: string
  description?: string
  price_amount: number
  is_published: boolean
}

export type CatalogExamListDto = {
  list: CatalogExamDto[]
  total: number
  page: number
  perPage: number
}

export type CommerceCartItemDto = {
  id: string
  product_type: ProductType
  product_id: string
  title: string
  price_amount: number
  quantity: number
  subtotal_amount: number
}

export type CommerceCartDto = {
  items: CommerceCartItemDto[]
  summary: {
    total_items: number
    subtotal_amount: number
    discount_amount: number
    grand_total_amount: number
  }
}

export type CommerceOrderItemDto = {
  product_type: ProductType
  product_id: string
  title: string
  price_amount: number
  quantity: number
}

export type CommerceOrderDto = {
  id: string
  status: CommerceOrderStatus
  total_amount: number
  payment_provider: string | null
  payment_reference: string | null
  paid_at: string | null
  failed_at: string | null
  expired_at: string | null
  items: CommerceOrderItemDto[]
}
