import type {
  CommerceCartItem,
  CommerceOrder,
  CommerceOrderItem,
  CommerceOwnership,
} from "@/domain/entities/Commerce"
import { DomainError } from "@/domain/errors/DomainError"
import type {
  ICommerceRepository,
  ListPublishedExamsResult,
} from "@/domain/repositories/ICommerceRepository"
import { describe, expect, it, vi } from "vitest"
import { addCommerceCartItem } from "./add-commerce-cart-item"
import { checkoutCommerceCart } from "./checkout-commerce-cart"
import { handleCommercePaymentWebhook } from "./handle-commerce-payment-webhook"

const emptyExamsResult: ListPublishedExamsResult = {
  data: [],
  total: 0,
}

const orderBase: CommerceOrder = {
  id: "order-1",
  userId: "user-1",
  status: "PENDING_PAYMENT",
  totalAmount: 149000,
  paymentProvider: "XENDIT_BANK_TRANSFER",
  paymentReference: "INV-001",
  paidAt: null,
  failedAt: null,
  expiredAt: null,
  items: [
    {
      id: "item-1",
      orderId: "order-1",
      productType: "EXAM",
      productId: "exam-1",
      titleSnapshot: "Exam One",
      priceAmount: 149000,
      quantity: 1,
    },
  ],
}

const createRepositoryMock = (): ICommerceRepository => {
  return {
    listPublishedExams: vi.fn().mockResolvedValue(emptyExamsResult),
    findPublishedExamBySlug: vi.fn().mockResolvedValue(null),
    findExamById: vi.fn().mockResolvedValue({
      id: "exam-1",
      slug: "exam-1",
      title: "Exam One",
      category: "CPNS",
      level: "BEGINNER",
      shortDescription: "desc",
      description: "desc",
      priceAmount: 149000,
      isPublished: true,
    }),
    findCartItemsByUserId: vi.fn().mockResolvedValue([]),
    findCartItemById: vi.fn().mockResolvedValue(null),
    findCartItemByProduct: vi.fn().mockResolvedValue(null),
    addCartItem: vi
      .fn()
      .mockImplementation(async (payload): Promise<CommerceCartItem> => ({
        id: "cart-1",
        userId: payload.userId,
        productType: payload.productType,
        productId: payload.productId,
        titleSnapshot: payload.titleSnapshot,
        unitPrice: payload.unitPrice,
        quantity: payload.quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    removeCartItem: vi.fn().mockResolvedValue(undefined),
    clearCart: vi.fn().mockResolvedValue(undefined),
    findOwnership: vi.fn().mockResolvedValue(null),
    createOrder: vi.fn().mockResolvedValue(orderBase),
    findOrderById: vi.fn().mockResolvedValue(orderBase),
    findOrderByPaymentReference: vi.fn().mockResolvedValue(orderBase),
    updateOrderStatus: vi.fn().mockImplementation(
      async (
        orderId,
        status,
        options,
      ): Promise<CommerceOrder> => ({
        ...orderBase,
        id: orderId,
        status,
        paidAt: options?.paidAt ?? null,
        failedAt: options?.failedAt ?? null,
        expiredAt: options?.expiredAt ?? null,
      }),
    ),
    createOwnerships: vi
      .fn()
      .mockResolvedValue([
        {
          id: "own-1",
          userId: "user-1",
          orderId: "order-1",
          productType: "EXAM",
          productId: "exam-1",
          grantedAt: new Date(),
        } satisfies CommerceOwnership,
      ]),
    listOrderItems: vi.fn().mockResolvedValue([
      {
        id: "item-1",
        orderId: "order-1",
        productType: "EXAM",
        productId: "exam-1",
        titleSnapshot: "Exam One",
        priceAmount: 149000,
        quantity: 1,
      } satisfies CommerceOrderItem,
    ]),
  }
}

describe("commerce use cases", () => {
  it("rejects duplicate purchase on add cart", async () => {
    const repository = createRepositoryMock()
    vi.mocked(repository.findOwnership).mockResolvedValue({
      id: "own-1",
      userId: "user-1",
      orderId: "order-1",
      productType: "EXAM",
      productId: "exam-1",
      grantedAt: new Date(),
    })

    await expect(
      addCommerceCartItem(repository, {
        userId: "user-1",
        productType: "EXAM",
        productId: "exam-1",
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(DomainError)
  })

  it("rejects checkout when cart is empty", async () => {
    const repository = createRepositoryMock()
    vi.mocked(repository.findCartItemsByUserId).mockResolvedValue([])

    await expect(
      checkoutCommerceCart(repository, {
        userId: "user-1",
        paymentProvider: "XENDIT_BANK_TRANSFER",
        paymentReference: "INV-001",
      }),
    ).rejects.toBeInstanceOf(DomainError)
  })

  it("creates ownership on paid webhook", async () => {
    const repository = createRepositoryMock()

    const result = await handleCommercePaymentWebhook(repository, {
      referenceId: "INV-001",
      status: "PAID",
    })

    expect(result.status).toBe("PAID")
    expect(repository.createOwnerships).toHaveBeenCalledOnce()
  })
})
