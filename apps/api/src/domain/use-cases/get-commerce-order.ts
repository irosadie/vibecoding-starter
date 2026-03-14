import { DomainError } from "@/domain/errors/DomainError"
import type { ICommerceRepository } from "@/domain/repositories/ICommerceRepository"

export const getCommerceOrder = async (
  repository: ICommerceRepository,
  userId: string,
  orderId: string,
) => {
  const order = await repository.findOrderById(userId, orderId)

  if (!order) {
    throw DomainError.notFound("Order not found")
  }

  return order
}
