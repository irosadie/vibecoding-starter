import type { CreatorApplication } from "@/domain/entities/CreatorApplication"
import { DomainError } from "@/domain/errors/DomainError"
import type { ICreatorApplicationRepository } from "@/domain/repositories/ICreatorApplicationRepository"

type ApproveCreatorApplicationInput = {
  applicationId: string
  reviewedBy: string
  reviewNote: string | null
}

type ApproveCreatorApplicationResult = {
  application: CreatorApplication
  promotedUser: {
    id: string
    role: "CREATOR"
  }
}

export async function approveCreatorApplication(
  repository: ICreatorApplicationRepository,
  input: ApproveCreatorApplicationInput,
): Promise<ApproveCreatorApplicationResult> {
  const application = await repository.findCreatorApplicationById(
    input.applicationId,
  )

  if (!application) {
    throw DomainError.notFound("Creator application not found")
  }

  if (application.status !== "PENDING") {
    throw DomainError.conflict("Creator application has been reviewed")
  }

  const reviewedAt = new Date()
  const reviewedApplication = await repository.reviewCreatorApplication({
    id: application.id,
    status: "APPROVED",
    reviewedBy: input.reviewedBy,
    reviewedAt,
    reviewNote: input.reviewNote,
  })

  await repository.upsertCreatorProfile({
    userId: application.userId,
    payoutAccountName: application.payoutAccountName,
    payoutBankName: application.payoutBankName,
    payoutAccountNumber: application.payoutAccountNumber,
    approvedAt: reviewedAt,
  })

  await repository.updateUserRole(application.userId, "CREATOR")

  return {
    application: reviewedApplication,
    promotedUser: {
      id: application.userId,
      role: "CREATOR",
    },
  }
}
