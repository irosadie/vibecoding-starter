import type {
  CommerceCartItem,
  CommerceCatalogExam,
  CommerceOrder,
  CommerceOrderItem,
  CommerceOrderStatus,
  CommerceOwnership,
} from "@/domain/entities/Commerce"
import type {
  AddCartItemInput,
  CreateOrderInput,
  CreateOwnershipInput,
  ICommerceRepository,
  ListPublishedExamsInput,
  ListPublishedExamsResult,
} from "@/domain/repositories/ICommerceRepository"
import { prisma } from "@/infrastructure/config/database"
import type {
  CommerceCartItem as PrismaCommerceCartItem,
  CommerceOrder as PrismaCommerceOrder,
  CommerceOrderItem as PrismaCommerceOrderItem,
  CommerceOwnership as PrismaCommerceOwnership,
  ExamProduct as PrismaExamProduct,
} from "@prisma/client"

export class PrismaCommerceRepository implements ICommerceRepository {
  async listPublishedExams(
    input: ListPublishedExamsInput,
  ): Promise<ListPublishedExamsResult> {
    const page = Math.max(1, input.page)
    const perPage = Math.min(100, Math.max(1, input.perPage))
    const skip = (page - 1) * perPage

    const where = {
      isPublished: true,
      deletedAt: null,
      ...(input.search
        ? {
            title: {
              contains: input.search,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.level ? { level: input.level } : {}),
    }

    const [rows, total] = await Promise.all([
      prisma.examProduct.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: perPage,
      }),
      prisma.examProduct.count({ where }),
    ])

    return {
      data: rows.map(toCommerceCatalogExam),
      total,
    }
  }

  async findPublishedExamBySlug(slug: string): Promise<CommerceCatalogExam | null> {
    const row = await prisma.examProduct.findFirst({
      where: {
        slug,
        isPublished: true,
        deletedAt: null,
      },
    })

    if (!row) {
      return null
    }

    return toCommerceCatalogExam(row)
  }

  async findExamById(id: string): Promise<CommerceCatalogExam | null> {
    const row = await prisma.examProduct.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!row) {
      return null
    }

    return toCommerceCatalogExam(row)
  }

  async findCartItemsByUserId(userId: string): Promise<CommerceCartItem[]> {
    const rows = await prisma.commerceCartItem.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    })

    return rows.map(toCommerceCartItem)
  }

  async findCartItemById(
    userId: string,
    itemId: string,
  ): Promise<CommerceCartItem | null> {
    const row = await prisma.commerceCartItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
    })

    if (!row) {
      return null
    }

    return toCommerceCartItem(row)
  }

  async findCartItemByProduct(
    userId: string,
    productType: "EXAM" | "MENTORING_PACKAGE",
    productId: string,
  ): Promise<CommerceCartItem | null> {
    const row = await prisma.commerceCartItem.findFirst({
      where: {
        userId,
        productType,
        productId,
      },
    })

    if (!row) {
      return null
    }

    return toCommerceCartItem(row)
  }

  async addCartItem(input: AddCartItemInput): Promise<CommerceCartItem> {
    const row = await prisma.commerceCartItem.create({
      data: {
        userId: input.userId,
        productType: input.productType,
        productId: input.productId,
        titleSnapshot: input.titleSnapshot,
        unitPrice: input.unitPrice,
        quantity: input.quantity,
      },
    })

    return toCommerceCartItem(row)
  }

  async removeCartItem(itemId: string): Promise<void> {
    await prisma.commerceCartItem.delete({
      where: {
        id: itemId,
      },
    })
  }

  async clearCart(userId: string): Promise<void> {
    await prisma.commerceCartItem.deleteMany({
      where: {
        userId,
      },
    })
  }

  async findOwnership(
    userId: string,
    productType: "EXAM" | "MENTORING_PACKAGE",
    productId: string,
  ): Promise<CommerceOwnership | null> {
    const row = await prisma.commerceOwnership.findFirst({
      where: {
        userId,
        productType,
        productId,
      },
    })

    if (!row) {
      return null
    }

    return toCommerceOwnership(row)
  }

  async createOrder(input: CreateOrderInput): Promise<CommerceOrder> {
    const row = await prisma.commerceOrder.create({
      data: {
        userId: input.userId,
        status: "PENDING_PAYMENT",
        totalAmount: input.totalAmount,
        paymentProvider: input.paymentProvider,
        paymentReference: input.paymentReference,
        items: {
          createMany: {
            data: input.items.map((item) => ({
              productType: item.productType,
              productId: item.productId,
              titleSnapshot: item.titleSnapshot,
              priceAmount: item.priceAmount,
              quantity: item.quantity,
            })),
          },
        },
      },
      include: {
        items: true,
      },
    })

    return toCommerceOrder(row, row.items)
  }

  async findOrderById(userId: string, orderId: string): Promise<CommerceOrder | null> {
    const row = await prisma.commerceOrder.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
      },
    })

    if (!row) {
      return null
    }

    return toCommerceOrder(row, row.items)
  }

  async findOrderByPaymentReference(
    reference: string,
  ): Promise<CommerceOrder | null> {
    const row = await prisma.commerceOrder.findFirst({
      where: {
        paymentReference: reference,
      },
      include: {
        items: true,
      },
    })

    if (!row) {
      return null
    }

    return toCommerceOrder(row, row.items)
  }

  async updateOrderStatus(
    orderId: string,
    status: CommerceOrderStatus,
    options?: {
      paidAt?: Date
      failedAt?: Date
      expiredAt?: Date
    },
  ): Promise<CommerceOrder> {
    const row = await prisma.commerceOrder.update({
      where: {
        id: orderId,
      },
      data: {
        status,
        paidAt: options?.paidAt,
        failedAt: options?.failedAt,
        expiredAt: options?.expiredAt,
      },
      include: {
        items: true,
      },
    })

    return toCommerceOrder(row, row.items)
  }

  async createOwnerships(
    entries: CreateOwnershipInput[],
  ): Promise<CommerceOwnership[]> {
    const firstEntry = entries[0]

    if (!firstEntry) {
      return []
    }

    await prisma.commerceOwnership.createMany({
      data: entries.map((entry) => ({
        userId: entry.userId,
        orderId: entry.orderId,
        productType: entry.productType,
        productId: entry.productId,
        grantedAt: entry.grantedAt,
      })),
      skipDuplicates: true,
    })

    const ownerships = await prisma.commerceOwnership.findMany({
      where: {
        orderId: firstEntry.orderId,
      },
    })

    return ownerships.map(toCommerceOwnership)
  }

  async listOrderItems(orderId: string): Promise<CommerceOrderItem[]> {
    const rows = await prisma.commerceOrderItem.findMany({
      where: {
        orderId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return rows.map(toCommerceOrderItem)
  }
}

function toCommerceCatalogExam(row: PrismaExamProduct): CommerceCatalogExam {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    level: row.level,
    shortDescription: row.shortDescription,
    description: row.description,
    priceAmount: row.priceAmount,
    isPublished: row.isPublished,
  }
}

function toCommerceCartItem(row: PrismaCommerceCartItem): CommerceCartItem {
  return {
    id: row.id,
    userId: row.userId,
    productType: row.productType,
    productId: row.productId,
    titleSnapshot: row.titleSnapshot,
    unitPrice: row.unitPrice,
    quantity: row.quantity,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toCommerceOrderItem(row: PrismaCommerceOrderItem): CommerceOrderItem {
  return {
    id: row.id,
    orderId: row.orderId,
    productType: row.productType,
    productId: row.productId,
    titleSnapshot: row.titleSnapshot,
    priceAmount: row.priceAmount,
    quantity: row.quantity,
  }
}

function toCommerceOrder(
  row: PrismaCommerceOrder,
  items: PrismaCommerceOrderItem[],
): CommerceOrder {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    totalAmount: row.totalAmount,
    paymentProvider: row.paymentProvider,
    paymentReference: row.paymentReference,
    paidAt: row.paidAt,
    failedAt: row.failedAt,
    expiredAt: row.expiredAt,
    items: items.map(toCommerceOrderItem),
  }
}

function toCommerceOwnership(row: PrismaCommerceOwnership): CommerceOwnership {
  return {
    id: row.id,
    userId: row.userId,
    orderId: row.orderId,
    productType: row.productType,
    productId: row.productId,
    grantedAt: row.grantedAt,
  }
}
