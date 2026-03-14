import { DomainError } from "@/domain/errors/DomainError"
import type { ICommerceRepository } from "@/domain/repositories/ICommerceRepository"

type CheckoutCommerceCartInput = {
  userId: string
  paymentProvider: string
  paymentReference: string
}

export const checkoutCommerceCart = async (
  repository: ICommerceRepository,
  input: CheckoutCommerceCartInput,
) => {
  const cartItems = await repository.findCartItemsByUserId(input.userId)

  if (cartItems.length === 0) {
    throw DomainError.conflict("Cart is empty")
  }

  for (const item of cartItems) {
    const ownership = await repository.findOwnership(
      input.userId,
      item.productType,
      item.productId,
    )

    if (ownership) {
      throw DomainError.conflict(
        `Duplicate purchase detected for ${item.productType}`,
      )
    }
  }

  const orderItems = cartItems.map((item) => ({
    productType: item.productType,
    productId: item.productId,
    titleSnapshot: item.titleSnapshot,
    priceAmount: item.unitPrice,
    quantity: item.quantity,
  }))

  const totalAmount = orderItems.reduce(
    (acc, item) => acc + item.priceAmount * item.quantity,
    0,
  )

  const order = await repository.createOrder({
    userId: input.userId,
    totalAmount,
    paymentProvider: input.paymentProvider,
    paymentReference: input.paymentReference,
    items: orderItems,
  })

  await repository.clearCart(input.userId)

  return order
}
