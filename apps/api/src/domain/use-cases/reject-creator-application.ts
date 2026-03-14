import type { CreatorApplication } from "@/domain/entities/CreatorApplication"
import { DomainError } from "@/domain/errors/DomainError"
import type { ICreatorApplicationRepository } from "@/domain/repositories/ICreatorApplicationRepository"

type RejectCreatorApplicationInput = {
  applicationId: string
  reviewedBy: string
  reviewNote: string
}

export async function rejectCreatorApplication(
  repository: ICreatorApplicationRepository,
  input: RejectCreatorApplicationInput,
): Promise<CreatorApplication> {
  const application = await repository.findCreatorApplicationById(
    input.applicationId,
  )

  if (!application) {
    throw DomainError.notFound("Creator application not found")
  }

  if (application.status !== "PENDING") {
    throw DomainError.conflict("Creator application has been reviewed")
  }

  const normalizedReviewNote = input.reviewNote.trim()

  if (!normalizedReviewNote) {
    throw DomainError.validationError("Review note is required")
  }

  return repository.reviewCreatorApplication({
    id: application.id,
    status: "REJECTED",
    reviewedBy: input.reviewedBy,
    reviewedAt: new Date(),
    reviewNote: normalizedReviewNote,
  })
}
