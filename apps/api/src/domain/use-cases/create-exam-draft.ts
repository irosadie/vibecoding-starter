import { DomainError } from "@/domain/errors/DomainError"
import type { CreatorExamDraftAggregate } from "@/domain/entities/ExamAuthoringReview"
import type {
  CreateExamDraftInput,
  IExamAuthoringReviewRepository,
} from "@/domain/repositories/IExamAuthoringReviewRepository"

export async function createExamDraft(
  repository: IExamAuthoringReviewRepository,
  input: CreateExamDraftInput,
): Promise<CreatorExamDraftAggregate> {
  if (!input.title.trim()) {
    throw DomainError.validationError("Exam title is required")
  }

  return repository.createExamDraft(input)
}
