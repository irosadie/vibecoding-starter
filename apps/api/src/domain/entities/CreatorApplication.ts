export type CreatorApplicationStatus = "PENDING" | "APPROVED" | "REJECTED"

export type CreatorApplication = {
  id: string
  userId: string
  ktpFileUrl: string
  payoutAccountName: string
  payoutBankName: string
  payoutAccountNumber: string
  status: CreatorApplicationStatus
  submittedAt: Date
  reviewedBy: string | null
  reviewedAt: Date | null
  reviewNote: string | null
  createdAt: Date
  updatedAt: Date
}

export type CreatorApplicationApplicant = {
  id: string
  name: string
  email: string
}

export type CreatorApplicationWithApplicant = CreatorApplication & {
  applicant: CreatorApplicationApplicant
}
