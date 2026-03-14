export type ExamAuthoringLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
export type ExamAuthoringDraftStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "NEEDS_REVISION"
  | "PUBLISHED"
export type ExamAuthoringReviewStatus =
  | "IN_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
export type ExamAuthoringQuestionCorrectOption = "A" | "B" | "C" | "D"

export type CreatorExamQuestionResponseProps = {
  id: string
  order_number: number
  prompt: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: ExamAuthoringQuestionCorrectOption
  explanation_text: string | null
  explanation_video_url: string | null
}

export type CreatorExamDraftSummaryResponseProps = {
  id: string
  title: string
  category: string
  level: ExamAuthoringLevel
  status: ExamAuthoringDraftStatus
  question_count: number
  updated_at: string
  version_label: string
}

export type CreatorExamDraftResponseProps = {
  id: string
  slug: string
  title: string
  category: string
  level: ExamAuthoringLevel
  short_description: string
  description: string
  duration_minutes: number
  status: ExamAuthoringDraftStatus
  active_version: {
    id: string
    status: ExamAuthoringReviewStatus
    version_label: string
    submitted_at: string | null
    review_note: string | null
  }
  questions: CreatorExamQuestionResponseProps[]
}

export type CreatorExamSubmitReviewResponseProps = {
  exam_id: string
  version_id: string
  status: ExamAuthoringReviewStatus
}

export type CreatorExamQuestionDeleteResponseProps = {
  id: string
  removed: boolean
}

export type AdminExamReviewCreatorResponseProps = {
  id: string
  name: string
  email: string
}

export type AdminExamReviewSummaryResponseProps = {
  id: string
  exam_id: string
  exam_title: string
  category: string
  level: ExamAuthoringLevel
  version_label: string
  submitted_at: string | null
  status: ExamAuthoringReviewStatus
  question_count: number
  creator: AdminExamReviewCreatorResponseProps
}

export type AdminExamReviewResponseProps = {
  id: string
  exam_id: string
  exam_title: string
  category: string
  level: ExamAuthoringLevel
  version_label: string
  submitted_at: string | null
  status: ExamAuthoringReviewStatus
  review_note: string | null
  creator: AdminExamReviewCreatorResponseProps
  questions: CreatorExamQuestionResponseProps[]
}
