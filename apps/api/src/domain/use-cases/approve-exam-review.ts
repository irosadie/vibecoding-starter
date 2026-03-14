import { DomainError } from "@/domain/errors/DomainError"
import type { AdminExamReviewAggregate } from "@/domain/entities/ExamAuthoringReview"
import type {
  ApproveExamReviewInput,
  IExamAuthoringReviewRepository,
} from "@/domain/repositories/IExamAuthoringReviewRepository"

export async function approveExamReview(
  repository: IExamAuthoringReviewRepository,
  input: ApproveExamReviewInput,
): Promise<AdminExamReviewAggregate> {
  const review = await repository.getAdminExamReview(input.reviewId)

  if (!review) {
    throw DomainError.notFound("Exam review submission not found")
  }

  if (review.version.status !== "IN_REVIEW") {
    throw DomainError.conflict("Only in-review submission can be approved")
  }

  return repository.approveExamReview(input)
}
