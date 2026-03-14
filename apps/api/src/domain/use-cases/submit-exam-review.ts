import { DomainError } from "@/domain/errors/DomainError"
import type { ExamVersion } from "@/domain/entities/ExamAuthoringReview"
import type {
  IExamAuthoringReviewRepository,
  SubmitExamReviewInput,
} from "@/domain/repositories/IExamAuthoringReviewRepository"

export async function submitExamReview(
  repository: IExamAuthoringReviewRepository,
  input: SubmitExamReviewInput,
): Promise<ExamVersion> {
  const draft = await repository.getCreatorExamDraft(input.examId, input.creatorId)

  if (!draft) {
    throw DomainError.notFound("Exam draft not found")
  }

  if (draft.activeVersion.status === "IN_REVIEW") {
    throw DomainError.conflict("Exam draft is already in review")
  }

  if (draft.questions.length === 0) {
    throw DomainError.validationError("Exam must contain at least one question")
  }

  const hasTextExplanation = draft.questions.some(
    (question) => !!question.explanationText?.trim(),
  )
  const hasVideoExplanation = draft.questions.some(
    (question) => !!question.explanationVideoUrl?.trim(),
  )

  if (!hasTextExplanation && !hasVideoExplanation) {
    throw DomainError.validationError(
      "At least one explanation type must be active before submit review",
    )
  }

  return repository.submitExamReview(input)
}
