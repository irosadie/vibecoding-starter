import type { ExamLevel } from "@/domain/entities/Commerce"
import type { ICommerceRepository } from "@/domain/repositories/ICommerceRepository"

type ListCatalogExamsInput = {
  page: number
  perPage: number
  search?: string
  category?: string
  level?: ExamLevel
}

export const listCatalogExams = async (
  repository: ICommerceRepository,
  input: ListCatalogExamsInput,
) => {
  return repository.listPublishedExams({
    page: input.page,
    perPage: input.perPage,
    search: input.search?.trim() || undefined,
    category: input.category?.trim() || undefined,
    level: input.level,
  })
}
