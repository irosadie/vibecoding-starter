import { DomainError } from "@/domain/errors/DomainError"
import type { CreatorExamDraftAggregate } from "@/domain/entities/ExamAuthoringReview"
import type {
  IExamAuthoringReviewRepository,
  UpdateExamDraftMetadataInput,
} from "@/domain/repositories/IExamAuthoringReviewRepository"

export async function updateExamDraft(
  repository: IExamAuthoringReviewRepository,
  input: UpdateExamDraftMetadataInput,
): Promise<CreatorExamDraftAggregate> {
  const draft = await repository.getCreatorExamDraft(input.examId, input.creatorId)

  if (!draft) {
    throw DomainError.notFound("Exam draft not found")
  }

  if (draft.activeVersion.status === "IN_REVIEW") {
    throw DomainError.conflict(
      "Exam is currently in review and cannot be edited",
    )
  }

  return repository.updateExamDraftMetadata(input)
}
