import type {
  CreatorApplicationApplicant,
  CreatorApplicationStatus,
} from "@/domain/entities/CreatorApplication"

export type CreatorApplicationDto = {
  id: string
  user_id: string
  ktp_file_url: string
  payout_account_name: string
  payout_bank_name: string
  payout_account_number: string
  status: CreatorApplicationStatus
  submitted_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
}

export type CreatorApplicationWithApplicantDto = CreatorApplicationDto & {
  applicant: CreatorApplicationApplicant
}

export type CreatorApplicationListDto = {
  list: CreatorApplicationWithApplicantDto[]
  total: number
  page: number
  perPage: number
}

export type CreatorApplicationApproveDto = {
  application: CreatorApplicationDto
  promoted_user: {
    id: string
    role: "CREATOR"
  }
}
