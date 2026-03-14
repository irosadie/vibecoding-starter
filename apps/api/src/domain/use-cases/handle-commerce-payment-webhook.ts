import { DomainError } from "@/domain/errors/DomainError"
import type { ICommerceRepository } from "@/domain/repositories/ICommerceRepository"

type PaymentWebhookStatus = "PAID" | "FAILED" | "EXPIRED"

type HandleCommercePaymentWebhookInput = {
  referenceId: string
  status: PaymentWebhookStatus
  paidAt?: Date
}

export const handleCommercePaymentWebhook = async (
  repository: ICommerceRepository,
  input: HandleCommercePaymentWebhookInput,
) => {
  const order = await repository.findOrderByPaymentReference(input.referenceId)

  if (!order) {
    throw DomainError.notFound("Order reference not found")
  }

  if (order.status === "PAID" && input.status === "PAID") {
    return order
  }

  if (input.status === "PAID") {
    const updatedOrder = await repository.updateOrderStatus(order.id, "PAID", {
      paidAt: input.paidAt ?? new Date(),
    })

    const orderItems = await repository.listOrderItems(order.id)
    await repository.createOwnerships(
      orderItems.map((item) => ({
        userId: updatedOrder.userId,
        orderId: updatedOrder.id,
        productType: item.productType,
        productId: item.productId,
        grantedAt: input.paidAt ?? new Date(),
      })),
    )

    return updatedOrder
  }

  if (input.status === "FAILED") {
    return repository.updateOrderStatus(order.id, "FAILED", {
      failedAt: new Date(),
    })
  }

  return repository.updateOrderStatus(order.id, "EXPIRED", {
    expiredAt: new Date(),
  })
}
