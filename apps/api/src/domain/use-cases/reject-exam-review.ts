import { DomainError } from "@/domain/errors/DomainError"
import type { AdminExamReviewAggregate } from "@/domain/entities/ExamAuthoringReview"
import type {
  IExamAuthoringReviewRepository,
  RejectExamReviewInput,
} from "@/domain/repositories/IExamAuthoringReviewRepository"

export async function rejectExamReview(
  repository: IExamAuthoringReviewRepository,
  input: RejectExamReviewInput,
): Promise<AdminExamReviewAggregate> {
  const review = await repository.getAdminExamReview(input.reviewId)

  if (!review) {
    throw DomainError.notFound("Exam review submission not found")
  }

  if (review.version.status !== "IN_REVIEW") {
    throw DomainError.conflict("Only in-review submission can be rejected")
  }

  return repository.rejectExamReview(input)
}
