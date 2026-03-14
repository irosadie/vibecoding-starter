import type { CommerceCartSummary } from "@/domain/entities/Commerce"
import type { ICommerceRepository } from "@/domain/repositories/ICommerceRepository"

export const getCommerceCart = async (
  repository: ICommerceRepository,
  userId: string,
) => {
  const items = await repository.findCartItemsByUserId(userId)

  const summary: CommerceCartSummary = items.reduce(
    (acc, item) => {
      const subtotal = item.unitPrice * item.quantity
      return {
        totalItems: acc.totalItems + item.quantity,
        subtotalAmount: acc.subtotalAmount + subtotal,
        discountAmount: 0,
        grandTotalAmount: acc.grandTotalAmount + subtotal,
      }
    },
    {
      totalItems: 0,
      subtotalAmount: 0,
      discountAmount: 0,
      grandTotalAmount: 0,
    },
  )

  return {
    items,
    summary,
  }
}
