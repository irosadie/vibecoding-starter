import type {
  CommerceCartItem,
  CommerceCatalogExam,
  CommerceOrder,
  CommerceOrderItem,
  CommerceOrderStatus,
  CommerceOwnership,
  ExamLevel,
  ProductType,
} from "@/domain/entities/Commerce"

export type ListPublishedExamsInput = {
  page: number
  perPage: number
  search?: string
  category?: string
  level?: ExamLevel
}

export type ListPublishedExamsResult = {
  data: CommerceCatalogExam[]
  total: number
}

export type AddCartItemInput = {
  userId: string
  productType: ProductType
  productId: string
  titleSnapshot: string
  unitPrice: number
  quantity: number
}

export type CreateOrderInput = {
  userId: string
  totalAmount: number
  paymentProvider: string
  paymentReference: string
  items: {
    productType: ProductType
    productId: string
    titleSnapshot: string
    priceAmount: number
    quantity: number
  }[]
}

export type CreateOwnershipInput = {
  userId: string
  orderId: string
  productType: ProductType
  productId: string
  grantedAt: Date
}

export interface ICommerceRepository {
  listPublishedExams(input: ListPublishedExamsInput): Promise<ListPublishedExamsResult>
  findPublishedExamBySlug(slug: string): Promise<CommerceCatalogExam | null>
  findExamById(id: string): Promise<CommerceCatalogExam | null>
  findCartItemsByUserId(userId: string): Promise<CommerceCartItem[]>
  findCartItemById(userId: string, itemId: string): Promise<CommerceCartItem | null>
  findCartItemByProduct(
    userId: string,
    productType: ProductType,
    productId: string,
  ): Promise<CommerceCartItem | null>
  addCartItem(input: AddCartItemInput): Promise<CommerceCartItem>
  removeCartItem(itemId: string): Promise<void>
  clearCart(userId: string): Promise<void>
  findOwnership(
    userId: string,
    productType: ProductType,
    productId: string,
  ): Promise<CommerceOwnership | null>
  createOrder(input: CreateOrderInput): Promise<CommerceOrder>
  findOrderById(userId: string, orderId: string): Promise<CommerceOrder | null>
  findOrderByPaymentReference(reference: string): Promise<CommerceOrder | null>
  updateOrderStatus(
    orderId: string,
    status: CommerceOrderStatus,
    options?: {
      paidAt?: Date
      failedAt?: Date
      expiredAt?: Date
    },
  ): Promise<CommerceOrder>
  createOwnerships(
    entries: CreateOwnershipInput[],
  ): Promise<CommerceOwnership[]>
  listOrderItems(orderId: string): Promise<CommerceOrderItem[]>
}
