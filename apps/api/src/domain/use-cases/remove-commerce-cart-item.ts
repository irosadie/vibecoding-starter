import { DomainError } from "@/domain/errors/DomainError"
import type { ICommerceRepository } from "@/domain/repositories/ICommerceRepository"

export const removeCommerceCartItem = async (
  repository: ICommerceRepository,
  userId: string,
  itemId: string,
) => {
  const item = await repository.findCartItemById(userId, itemId)

  if (!item) {
    throw DomainError.notFound("Cart item not found")
  }

  await repository.removeCartItem(item.id)
}
