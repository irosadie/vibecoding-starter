import type {
  AdminExamReviewAggregate,
  AdminExamReviewSummary,
  Exam,
  ExamDraftStatus,
  ExamLevel,
  ExamQuestion,
  ExamVersion,
} from "@/domain/entities/ExamAuthoringReview"
import type {
  CreatorExamDraftAggregate,
  CreatorExamDraftSummary,
  QuestionCorrectOption,
} from "@/domain/entities/ExamAuthoringReview"

export type CreatorExamDraftFilter = {
  page: number
  perPage: number
  search?: string
  status?: ExamDraftStatus
}

export type AdminExamReviewFilter = {
  page: number
  perPage: number
  search?: string
  status?: "IN_REVIEW" | "PUBLISHED" | "REJECTED"
}

export type CreatorExamDraftListResult = {
  data: CreatorExamDraftSummary[]
  total: number
}

export type AdminExamReviewListResult = {
  data: AdminExamReviewSummary[]
  total: number
}

export type CreateExamDraftInput = {
  creatorId: string
  title: string
  category: string
  level: ExamLevel
  shortDescription: string
  description: string
  durationMinutes: number
}

export type UpdateExamDraftMetadataInput = {
  creatorId: string
  examId: string
  title?: string
  category?: string
  level?: ExamLevel
  shortDescription?: string
  description?: string
  durationMinutes?: number
}

export type CreateExamQuestionInput = {
  creatorId: string
  examId: string
  prompt: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: QuestionCorrectOption
  explanationText?: string
  explanationVideoUrl?: string
}

export type UpdateExamQuestionInput = {
  creatorId: string
  examId: string
  questionId: string
  prompt?: string
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctOption?: QuestionCorrectOption
  explanationText?: string
  explanationVideoUrl?: string
}

export type DeleteExamQuestionInput = {
  creatorId: string
  examId: string
  questionId: string
}

export type SubmitExamReviewInput = {
  creatorId: string
  examId: string
  submitNote?: string | null
}

export type ApproveExamReviewInput = {
  reviewId: string
  reviewedBy: string
  reviewNote?: string | null
}

export type RejectExamReviewInput = {
  reviewId: string
  reviewedBy: string
  reviewNote: string
}

export interface IExamAuthoringReviewRepository {
  listCreatorExamDrafts(
    filter: CreatorExamDraftFilter,
    creatorId: string,
  ): Promise<CreatorExamDraftListResult>
  createExamDraft(input: CreateExamDraftInput): Promise<CreatorExamDraftAggregate>
  getCreatorExamDraft(
    examId: string,
    creatorId: string,
  ): Promise<CreatorExamDraftAggregate | null>
  updateExamDraftMetadata(
    input: UpdateExamDraftMetadataInput,
  ): Promise<CreatorExamDraftAggregate>
  addExamQuestion(input: CreateExamQuestionInput): Promise<ExamQuestion>
  updateExamQuestion(input: UpdateExamQuestionInput): Promise<ExamQuestion>
  deleteExamQuestion(input: DeleteExamQuestionInput): Promise<void>
  submitExamReview(input: SubmitExamReviewInput): Promise<ExamVersion>
  listAdminExamReviews(
    filter: AdminExamReviewFilter,
  ): Promise<AdminExamReviewListResult>
  getAdminExamReview(reviewId: string): Promise<AdminExamReviewAggregate | null>
  approveExamReview(input: ApproveExamReviewInput): Promise<AdminExamReviewAggregate>
  rejectExamReview(input: RejectExamReviewInput): Promise<AdminExamReviewAggregate>
  getExamById(examId: string): Promise<Exam | null>
}
