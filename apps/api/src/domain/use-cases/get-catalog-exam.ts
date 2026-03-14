import { DomainError } from "@/domain/errors/DomainError"
import type { ICommerceRepository } from "@/domain/repositories/ICommerceRepository"

export const getCatalogExam = async (
  repository: ICommerceRepository,
  slug: string,
) => {
  const exam = await repository.findPublishedExamBySlug(slug)

  if (!exam) {
    throw DomainError.notFound("Exam product not found")
  }

  return exam
}
