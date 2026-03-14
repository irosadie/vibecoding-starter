import type {
  CatalogExamDto,
  CatalogExamListDto,
  CommerceCartDto,
  CommerceOrderDto,
} from "@/application/dtos/commerce"
import type {
  AddCartItemPayload,
  CatalogExamQuery,
  CheckoutPayload,
  PaymentWebhookPayload,
} from "@/application/validators/commerce.schemas"
import type {
  CommerceCartItem,
  CommerceCatalogExam,
  CommerceOrder,
  CommerceOrderItem,
} from "@/domain/entities/Commerce"
import type { ICommerceRepository } from "@/domain/repositories/ICommerceRepository"
import { addCommerceCartItem } from "@/domain/use-cases/add-commerce-cart-item"
import { checkoutCommerceCart } from "@/domain/use-cases/checkout-commerce-cart"
import { getCatalogExam } from "@/domain/use-cases/get-catalog-exam"
import { getCommerceCart } from "@/domain/use-cases/get-commerce-cart"
import { getCommerceOrder } from "@/domain/use-cases/get-commerce-order"
import { handleCommercePaymentWebhook } from "@/domain/use-cases/handle-commerce-payment-webhook"
import { listCatalogExams } from "@/domain/use-cases/list-catalog-exams"
import { removeCommerceCartItem } from "@/domain/use-cases/remove-commerce-cart-item"
import { randomUUID } from "node:crypto"

type CommerceServiceDependencies = {
  repository: ICommerceRepository
}

export class CommerceService {
  constructor(private readonly dependencies: CommerceServiceDependencies) {}

  async listCatalog(query: CatalogExamQuery): Promise<CatalogExamListDto> {
    const result = await listCatalogExams(this.dependencies.repository, query)

    return {
      list: result.data.map((exam) => toCatalogExamDto(exam)),
      total: result.total,
      page: query.page,
      perPage: query.perPage,
    }
  }

  async getCatalogDetail(slug: string): Promise<CatalogExamDto> {
    const exam = await getCatalogExam(this.dependencies.repository, slug)
    return toCatalogExamDto(exam, true)
  }

  async getCart(userId: string): Promise<CommerceCartDto> {
    const cart = await getCommerceCart(this.dependencies.repository, userId)

    return {
      items: cart.items.map(toCommerceCartItemDto),
      summary: {
        total_items: cart.summary.totalItems,
        subtotal_amount: cart.summary.subtotalAmount,
        discount_amount: cart.summary.discountAmount,
        grand_total_amount: cart.summary.grandTotalAmount,
      },
    }
  }

  async addCartItem(userId: string, payload: AddCartItemPayload) {
    const item = await addCommerceCartItem(this.dependencies.repository, {
      userId,
      productType: payload.product_type,
      productId: payload.product_id,
      quantity: payload.quantity,
    })

    return toCommerceCartItemDto(item)
  }

  async removeCartItem(userId: string, itemId: string) {
    await removeCommerceCartItem(this.dependencies.repository, userId, itemId)
  }

  async checkout(userId: string, payload: CheckoutPayload): Promise<CommerceOrderDto> {
    const paymentReference = `INV-${Date.now()}-${randomUUID().slice(0, 8)}`

    const order = await checkoutCommerceCart(this.dependencies.repository, {
      userId,
      paymentProvider: `XENDIT_${payload.payment_method}`,
      paymentReference,
    })

    return toCommerceOrderDto(order)
  }

  async getOrder(userId: string, orderId: string): Promise<CommerceOrderDto> {
    const order = await getCommerceOrder(this.dependencies.repository, userId, orderId)
    return toCommerceOrderDto(order)
  }

  async handlePaymentWebhook(payload: PaymentWebhookPayload): Promise<CommerceOrderDto> {
    const order = await handleCommercePaymentWebhook(this.dependencies.repository, {
      referenceId: payload.reference_id,
      status: payload.status,
      paidAt: payload.paid_at ? new Date(payload.paid_at) : undefined,
    })

    return toCommerceOrderDto(order)
  }
}

function toCatalogExamDto(
  exam: CommerceCatalogExam,
  includeDescription = false,
): CatalogExamDto {
  return {
    id: exam.id,
    slug: exam.slug,
    title: exam.title,
    category: exam.category,
    level: exam.level,
    short_description: exam.shortDescription,
    description: includeDescription ? exam.description : undefined,
    price_amount: exam.priceAmount,
    is_published: exam.isPublished,
  }
}

function toCommerceCartItemDto(item: CommerceCartItem) {
  return {
    id: item.id,
    product_type: item.productType,
    product_id: item.productId,
    title: item.titleSnapshot,
    price_amount: item.unitPrice,
    quantity: item.quantity,
    subtotal_amount: item.unitPrice * item.quantity,
  }
}

function toCommerceOrderItemDto(item: CommerceOrderItem) {
  return {
    product_type: item.productType,
    product_id: item.productId,
    title: item.titleSnapshot,
    price_amount: item.priceAmount,
    quantity: item.quantity,
  }
}

function toCommerceOrderDto(order: CommerceOrder): CommerceOrderDto {
  return {
    id: order.id,
    status: order.status,
    total_amount: order.totalAmount,
    payment_provider: order.paymentProvider,
    payment_reference: order.paymentReference,
    paid_at: order.paidAt?.toISOString() ?? null,
    failed_at: order.failedAt?.toISOString() ?? null,
    expired_at: order.expiredAt?.toISOString() ?? null,
    items: order.items.map(toCommerceOrderItemDto),
  }
}
