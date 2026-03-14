import type {
  ExamDraftStatus,
  ExamLevel,
  ExamVersionStatus,
  QuestionCorrectOption,
} from "@/domain/entities/ExamAuthoringReview"

export type CreatorExamDraftSummaryDto = {
  id: string
  title: string
  category: string
  level: ExamLevel
  status: ExamDraftStatus
  question_count: number
  updated_at: string
  version_label: string
}

export type CreatorExamDraftListDto = {
  list: CreatorExamDraftSummaryDto[]
  total: number
  page: number
  perPage: number
}

export type ExamQuestionDto = {
  id: string
  order_number: number
  prompt: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: QuestionCorrectOption
  explanation_text: string | null
  explanation_video_url: string | null
}

export type CreatorExamDraftDetailDto = {
  id: string
  slug: string
  title: string
  category: string
  level: ExamLevel
  short_description: string
  description: string
  duration_minutes: number
  status: ExamDraftStatus
  active_version: {
    id: string
    status: ExamVersionStatus
    version_label: string
    submitted_at: string | null
    review_note: string | null
  }
  questions: ExamQuestionDto[]
}

export type AdminExamReviewSummaryDto = {
  id: string
  exam_id: string
  exam_title: string
  category: string
  level: ExamLevel
  version_label: string
  submitted_at: string | null
  status: ExamVersionStatus
  question_count: number
  creator: {
    id: string
    name: string
    email: string
  }
}

export type AdminExamReviewListDto = {
  list: AdminExamReviewSummaryDto[]
  total: number
  page: number
  perPage: number
}

export type AdminExamReviewDetailDto = {
  id: string
  exam_id: string
  exam_title: string
  category: string
  level: ExamLevel
  version_label: string
  submitted_at: string | null
  status: ExamVersionStatus
  review_note: string | null
  creator: {
    id: string
    name: string
    email: string
  }
  questions: ExamQuestionDto[]
}
