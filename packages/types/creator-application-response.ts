export type CreatorApplicationStatus = "PENDING" | "APPROVED" | "REJECTED"

export type CreatorApplicationApplicantResponseProps = {
  id: string
  name: string
  email: string
}

export type CreatorApplicationResponseProps = {
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

export type CreatorApplicationWithApplicantResponseProps =
  CreatorApplicationResponseProps & {
    applicant: CreatorApplicationApplicantResponseProps
  }

export type CreatorApplicationGetOneResponseProps = {
  application: CreatorApplicationResponseProps | null
}

export type CreatorApplicationApproveResponseProps = {
  application: CreatorApplicationResponseProps
  promoted_user: {
    id: string
    role: "CREATOR"
  }
}
