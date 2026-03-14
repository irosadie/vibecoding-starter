import type {
  CreatorApplicationApproveDto,
  CreatorApplicationDto,
  CreatorApplicationListDto,
  CreatorApplicationWithApplicantDto,
} from "@/application/dtos/creator-application"
import type {
  ApproveCreatorApplicationPayload,
  ListCreatorApplicationsQuery,
  RejectCreatorApplicationPayload,
  SubmitCreatorApplicationFormPayload,
} from "@/application/validators/creator-application.schemas"
import type {
  CreatorApplication,
  CreatorApplicationWithApplicant,
} from "@/domain/entities/CreatorApplication"
import type { ICreatorApplicationRepository } from "@/domain/repositories/ICreatorApplicationRepository"
import type { StorageService } from "@/domain/services/StorageService"
import { approveCreatorApplication } from "@/domain/use-cases/approve-creator-application"
import { getMyCreatorApplication } from "@/domain/use-cases/get-my-creator-application"
import { listCreatorApplications } from "@/domain/use-cases/list-creator-applications"
import { rejectCreatorApplication } from "@/domain/use-cases/reject-creator-application"
import { submitCreatorApplication } from "@/domain/use-cases/submit-creator-application"

type CreatorApplicationServiceDependencies = {
  repository: ICreatorApplicationRepository
  storageService: StorageService
}

type SubmitCreatorApplicationPayload = SubmitCreatorApplicationFormPayload & {
  userId: string
  ktpFileBuffer: Buffer
  ktpFilename: string
  ktpMimeType: string
}

type ApproveCreatorApplicationServicePayload =
  ApproveCreatorApplicationPayload & {
    applicationId: string
    reviewedBy: string
  }

type RejectCreatorApplicationServicePayload =
  RejectCreatorApplicationPayload & {
    applicationId: string
    reviewedBy: string
  }

export class CreatorApplicationService {
  constructor(
    private readonly dependencies: CreatorApplicationServiceDependencies,
  ) {}

  async submit(
    payload: SubmitCreatorApplicationPayload,
  ): Promise<CreatorApplicationDto> {
    const application = await submitCreatorApplication(
      this.dependencies.repository,
      this.dependencies.storageService,
      {
        userId: payload.userId,
        payoutAccountName: payload.payout_account_name,
        payoutBankName: payload.payout_bank_name,
        payoutAccountNumber: payload.payout_account_number,
        ktpFileBuffer: payload.ktpFileBuffer,
        ktpFilename: payload.ktpFilename,
        ktpMimeType: payload.ktpMimeType,
      },
    )

    return toCreatorApplicationDto(application)
  }

  async getMy(userId: string): Promise<CreatorApplicationDto | null> {
    const application = await getMyCreatorApplication(
      this.dependencies.repository,
      userId,
    )

    if (!application) {
      return null
    }

    return toCreatorApplicationDto(application)
  }

  async listForAdmin(
    query: ListCreatorApplicationsQuery,
  ): Promise<CreatorApplicationListDto> {
    const result = await listCreatorApplications(this.dependencies.repository, {
      page: query.page,
      perPage: query.perPage,
      search: query.search,
      status: query.status,
    })

    return {
      list: result.data.map(toCreatorApplicationWithApplicantDto),
      total: result.total,
      page: query.page,
      perPage: query.perPage,
    }
  }

  async approve(
    payload: ApproveCreatorApplicationServicePayload,
  ): Promise<CreatorApplicationApproveDto> {
    const result = await approveCreatorApplication(
      this.dependencies.repository,
      {
        applicationId: payload.applicationId,
        reviewedBy: payload.reviewedBy,
        reviewNote: payload.review_note?.trim() || null,
      },
    )

    return {
      application: toCreatorApplicationDto(result.application),
      promoted_user: result.promotedUser,
    }
  }

  async reject(
    payload: RejectCreatorApplicationServicePayload,
  ): Promise<CreatorApplicationDto> {
    const application = await rejectCreatorApplication(
      this.dependencies.repository,
      {
        applicationId: payload.applicationId,
        reviewedBy: payload.reviewedBy,
        reviewNote: payload.review_note,
      },
    )

    return toCreatorApplicationDto(application)
  }
}

function toCreatorApplicationDto(
  application: CreatorApplication,
): CreatorApplicationDto {
  return {
    id: application.id,
    user_id: application.userId,
    ktp_file_url: application.ktpFileUrl,
    payout_account_name: application.payoutAccountName,
    payout_bank_name: application.payoutBankName,
    payout_account_number: application.payoutAccountNumber,
    status: application.status,
    submitted_at: application.submittedAt.toISOString(),
    reviewed_by: application.reviewedBy,
    reviewed_at: application.reviewedAt?.toISOString() ?? null,
    review_note: application.reviewNote,
  }
}

function toCreatorApplicationWithApplicantDto(
  application: CreatorApplicationWithApplicant,
): CreatorApplicationWithApplicantDto {
  return {
    ...toCreatorApplicationDto(application),
    applicant: application.applicant,
  }
}
