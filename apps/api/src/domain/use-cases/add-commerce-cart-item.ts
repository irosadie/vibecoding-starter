import type { ProductType } from "@/domain/entities/Commerce"
import { DomainError } from "@/domain/errors/DomainError"
import type { ICommerceRepository } from "@/domain/repositories/ICommerceRepository"

type AddCommerceCartItemInput = {
  userId: string
  productType: ProductType
  productId: string
  quantity: number
}

export const addCommerceCartItem = async (
  repository: ICommerceRepository,
  input: AddCommerceCartItemInput,
) => {
  const ownership = await repository.findOwnership(
    input.userId,
    input.productType,
    input.productId,
  )

  if (ownership) {
    throw DomainError.conflict("You already own this product")
  }

  const duplicateInCart = await repository.findCartItemByProduct(
    input.userId,
    input.productType,
    input.productId,
  )

  if (duplicateInCart) {
    throw DomainError.conflict("Product already exists in cart")
  }

  if (input.productType === "EXAM") {
    const exam = await repository.findExamById(input.productId)
    if (!exam || !exam.isPublished) {
      throw DomainError.notFound("Exam product not found")
    }

    return repository.addCartItem({
      userId: input.userId,
      productType: input.productType,
      productId: input.productId,
      titleSnapshot: exam.title,
      unitPrice: exam.priceAmount,
      quantity: input.quantity,
    })
  }

  return repository.addCartItem({
    userId: input.userId,
    productType: input.productType,
    productId: input.productId,
    titleSnapshot: "Mentoring Package",
    unitPrice: 0,
    quantity: input.quantity,
  })
}
