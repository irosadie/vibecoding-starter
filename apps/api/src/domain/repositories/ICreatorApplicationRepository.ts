import type {
  CreatorApplication,
  CreatorApplicationStatus,
  CreatorApplicationWithApplicant,
} from "@/domain/entities/CreatorApplication"
import type { CreatorProfile } from "@/domain/entities/CreatorProfile"
import type { UserRole } from "@/domain/entities/User"

export type CreateCreatorApplicationInput = {
  userId: string
  ktpFileUrl: string
  payoutAccountName: string
  payoutBankName: string
  payoutAccountNumber: string
  submittedAt: Date
}

export type CreatorApplicationListFilter = {
  page: number
  perPage: number
  search?: string
  status?: CreatorApplicationStatus
}

export type CreatorApplicationListResult = {
  data: CreatorApplicationWithApplicant[]
  total: number
}

export type ReviewCreatorApplicationInput = {
  id: string
  status: Extract<CreatorApplicationStatus, "APPROVED" | "REJECTED">
  reviewedBy: string
  reviewedAt: Date
  reviewNote: string | null
}

export type UpsertCreatorProfileInput = {
  userId: string
  payoutAccountName: string
  payoutBankName: string
  payoutAccountNumber: string
  approvedAt: Date
}

export interface ICreatorApplicationRepository {
  findCreatorApplicationById(id: string): Promise<CreatorApplication | null>
  findPendingCreatorApplicationByUserId(
    userId: string,
  ): Promise<CreatorApplication | null>
  findLatestCreatorApplicationByUserId(
    userId: string,
  ): Promise<CreatorApplication | null>
  createCreatorApplication(
    input: CreateCreatorApplicationInput,
  ): Promise<CreatorApplication>
  listCreatorApplications(
    filter: CreatorApplicationListFilter,
  ): Promise<CreatorApplicationListResult>
  reviewCreatorApplication(
    input: ReviewCreatorApplicationInput,
  ): Promise<CreatorApplication>
  upsertCreatorProfile(
    input: UpsertCreatorProfileInput,
  ): Promise<CreatorProfile>
  updateUserRole(userId: string, role: UserRole): Promise<void>
}
