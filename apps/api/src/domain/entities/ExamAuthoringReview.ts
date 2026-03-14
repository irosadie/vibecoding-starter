export type ExamLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

export type ExamDraftStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "NEEDS_REVISION"
  | "PUBLISHED"

export type ExamVersionStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "REJECTED"
  | "PUBLISHED"

export type QuestionCorrectOption = "A" | "B" | "C" | "D"

export type ExamReviewAction = "SUBMITTED" | "APPROVED" | "REJECTED"

export type ExamMetadataSnapshot = {
  title: string
  category: string
  level: ExamLevel
  shortDescription: string
  description: string
  durationMinutes: number
}

export type Exam = {
  id: string
  creatorId: string
  slug: string
  title: string
  category: string
  level: ExamLevel
  shortDescription: string
  description: string
  durationMinutes: number
  currentStatus: ExamDraftStatus
  createdAt: Date
  updatedAt: Date
}

export type ExamVersion = {
  id: string
  examId: string
  versionNumber: number
  status: ExamVersionStatus
  metadataSnapshot: ExamMetadataSnapshot
  submittedAt: Date | null
  reviewedBy: string | null
  reviewedAt: Date | null
  reviewNote: string | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type ExamQuestion = {
  id: string
  examVersionId: string
  orderNumber: number
  prompt: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: QuestionCorrectOption
  explanationText: string | null
  explanationVideoUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export type ExamReviewLog = {
  id: string
  examVersionId: string
  actorId: string
  action: ExamReviewAction
  note: string | null
  createdAt: Date
}

export type CreatorExamDraftAggregate = {
  exam: Exam
  activeVersion: ExamVersion
  questions: ExamQuestion[]
}

export type AdminExamReviewAggregate = {
  exam: Exam
  version: ExamVersion
  questions: ExamQuestion[]
  creator: {
    id: string
    name: string
    email: string
  }
}

export type CreatorExamDraftSummary = {
  exam: Exam
  activeVersion: ExamVersion
  questionCount: number
}

export type AdminExamReviewSummary = {
  exam: Exam
  version: ExamVersion
  creator: {
    id: string
    name: string
    email: string
  }
  questionCount: number
}
