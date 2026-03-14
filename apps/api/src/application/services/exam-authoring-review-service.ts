import type {
  AdminExamReviewDetailDto,
  AdminExamReviewListDto,
  CreatorExamDraftDetailDto,
  CreatorExamDraftListDto,
  ExamQuestionDto,
} from "@/application/dtos/exam-authoring-review"
import type {
  ApproveExamReviewPayload,
  CreateExamDraftPayload,
  CreateExamQuestionPayload,
  ListAdminExamReviewsQuery,
  ListCreatorExamDraftsQuery,
  RejectExamReviewPayload,
  SubmitExamReviewPayload,
  UpdateExamDraftPayload,
  UpdateExamQuestionPayload,
} from "@/application/validators/exam-authoring-review.schemas"
import type {
  AdminExamReviewAggregate,
  AdminExamReviewSummary,
  CreatorExamDraftAggregate,
  CreatorExamDraftSummary,
  ExamQuestion,
} from "@/domain/entities/ExamAuthoringReview"
import { DomainError } from "@/domain/errors/DomainError"
import type {
  IExamAuthoringReviewRepository,
  RejectExamReviewInput,
} from "@/domain/repositories/IExamAuthoringReviewRepository"
import { approveExamReview } from "@/domain/use-cases/approve-exam-review"
import { createExamDraft } from "@/domain/use-cases/create-exam-draft"
import { rejectExamReview } from "@/domain/use-cases/reject-exam-review"
import { submitExamReview } from "@/domain/use-cases/submit-exam-review"
import { updateExamDraft } from "@/domain/use-cases/update-exam-draft"

type ExamAuthoringReviewServiceDependencies = {
  repository: IExamAuthoringReviewRepository
}

export class ExamAuthoringReviewService {
  constructor(private readonly dependencies: ExamAuthoringReviewServiceDependencies) {}

  async listCreatorDrafts(
    creatorId: string,
    query: ListCreatorExamDraftsQuery,
  ): Promise<CreatorExamDraftListDto> {
    const result = await this.dependencies.repository.listCreatorExamDrafts(
      {
        page: query.page,
        perPage: query.perPage,
        search: query.search,
        status: query.status,
      },
      creatorId,
    )

    return {
      list: result.data.map(toCreatorExamDraftSummaryDto),
      total: result.total,
      page: query.page,
      perPage: query.perPage,
    }
  }

  async createDraft(
    creatorId: string,
    payload: CreateExamDraftPayload,
  ): Promise<CreatorExamDraftDetailDto> {
    const draft = await createExamDraft(this.dependencies.repository, {
      creatorId,
      title: payload.title,
      category: payload.category,
      level: payload.level,
      shortDescription: payload.short_description,
      description: payload.description,
      durationMinutes: payload.duration_minutes,
    })

    return toCreatorExamDraftDetailDto(draft)
  }

  async getDraft(
    creatorId: string,
    examId: string,
  ): Promise<CreatorExamDraftDetailDto> {
    const draft = await this.dependencies.repository.getCreatorExamDraft(
      examId,
      creatorId,
    )

    if (!draft) {
      throw DomainError.notFound("Exam draft not found")
    }

    return toCreatorExamDraftDetailDto(draft)
  }

  async updateDraft(
    creatorId: string,
    examId: string,
    payload: UpdateExamDraftPayload,
  ): Promise<CreatorExamDraftDetailDto> {
    const draft = await updateExamDraft(this.dependencies.repository, {
      creatorId,
      examId,
      title: payload.title,
      category: payload.category,
      level: payload.level,
      shortDescription: payload.short_description,
      description: payload.description,
      durationMinutes: payload.duration_minutes,
    })

    return toCreatorExamDraftDetailDto(draft)
  }

  async addQuestion(
    creatorId: string,
    examId: string,
    payload: CreateExamQuestionPayload,
  ): Promise<ExamQuestionDto> {
    const question = await this.dependencies.repository.addExamQuestion({
      creatorId,
      examId,
      prompt: payload.prompt,
      optionA: payload.option_a,
      optionB: payload.option_b,
      optionC: payload.option_c,
      optionD: payload.option_d,
      correctOption: payload.correct_option,
      explanationText: payload.explanation_text,
      explanationVideoUrl: payload.explanation_video_url,
    })

    return toExamQuestionDto(question)
  }

  async updateQuestion(
    creatorId: string,
    examId: string,
    questionId: string,
    payload: UpdateExamQuestionPayload,
  ): Promise<ExamQuestionDto> {
    const question = await this.dependencies.repository.updateExamQuestion({
      creatorId,
      examId,
      questionId,
      prompt: payload.prompt,
      optionA: payload.option_a,
      optionB: payload.option_b,
      optionC: payload.option_c,
      optionD: payload.option_d,
      correctOption: payload.correct_option,
      explanationText: payload.explanation_text,
      explanationVideoUrl: payload.explanation_video_url,
    })

    return toExamQuestionDto(question)
  }

  async deleteQuestion(
    creatorId: string,
    examId: string,
    questionId: string,
  ): Promise<void> {
    await this.dependencies.repository.deleteExamQuestion({
      creatorId,
      examId,
      questionId,
    })
  }

  async submitReview(
    creatorId: string,
    examId: string,
    payload: SubmitExamReviewPayload,
  ) {
    const version = await submitExamReview(this.dependencies.repository, {
      creatorId,
      examId,
      submitNote: payload.submit_note || null,
    })

    return {
      exam_id: examId,
      version_id: version.id,
      status: version.status,
    }
  }

  async listAdminReviews(
    query: ListAdminExamReviewsQuery,
  ): Promise<AdminExamReviewListDto> {
    const result = await this.dependencies.repository.listAdminExamReviews({
      page: query.page,
      perPage: query.perPage,
      search: query.search,
      status: query.status,
    })

    return {
      list: result.data.map(toAdminExamReviewSummaryDto),
      total: result.total,
      page: query.page,
      perPage: query.perPage,
    }
  }

  async getAdminReview(reviewId: string): Promise<AdminExamReviewDetailDto> {
    const review = await this.dependencies.repository.getAdminExamReview(reviewId)

    if (!review) {
      throw DomainError.notFound("Exam review submission not found")
    }

    return toAdminExamReviewDetailDto(review)
  }

  async approveReview(
    reviewId: string,
    reviewedBy: string,
    payload: ApproveExamReviewPayload,
  ): Promise<AdminExamReviewDetailDto> {
    const review = await approveExamReview(this.dependencies.repository, {
      reviewId,
      reviewedBy,
      reviewNote: payload.review_note || null,
    })

    return toAdminExamReviewDetailDto(review)
  }

  async rejectReview(
    reviewId: string,
    reviewedBy: string,
    payload: RejectExamReviewPayload,
  ): Promise<AdminExamReviewDetailDto> {
    const rejectPayload: RejectExamReviewInput = {
      reviewId,
      reviewedBy,
      reviewNote: payload.review_note,
    }

    const review = await rejectExamReview(this.dependencies.repository, rejectPayload)

    return toAdminExamReviewDetailDto(review)
  }
}

function toCreatorExamDraftSummaryDto(
  data: CreatorExamDraftSummary,
): CreatorExamDraftListDto["list"][number] {
  return {
    id: data.exam.id,
    title: data.exam.title,
    category: data.exam.category,
    level: data.exam.level,
    status: data.exam.currentStatus,
    question_count: data.questionCount,
    updated_at: data.exam.updatedAt.toISOString(),
    version_label: toVersionLabel(data.activeVersion.versionNumber),
  }
}

function toExamQuestionDto(question: ExamQuestion): ExamQuestionDto {
  return {
    id: question.id,
    order_number: question.orderNumber,
    prompt: question.prompt,
    option_a: question.optionA,
    option_b: question.optionB,
    option_c: question.optionC,
    option_d: question.optionD,
    correct_option: question.correctOption,
    explanation_text: question.explanationText,
    explanation_video_url: question.explanationVideoUrl,
  }
}

function toCreatorExamDraftDetailDto(
  draft: CreatorExamDraftAggregate,
): CreatorExamDraftDetailDto {
  return {
    id: draft.exam.id,
    slug: draft.exam.slug,
    title: draft.exam.title,
    category: draft.exam.category,
    level: draft.exam.level,
    short_description: draft.exam.shortDescription,
    description: draft.exam.description,
    duration_minutes: draft.exam.durationMinutes,
    status: draft.exam.currentStatus,
    active_version: {
      id: draft.activeVersion.id,
      status: draft.activeVersion.status,
      version_label: toVersionLabel(draft.activeVersion.versionNumber),
      submitted_at: draft.activeVersion.submittedAt?.toISOString() || null,
      review_note: draft.activeVersion.reviewNote,
    },
    questions: draft.questions
      .sort((left, right) => left.orderNumber - right.orderNumber)
      .map(toExamQuestionDto),
  }
}

function toAdminExamReviewSummaryDto(
  summary: AdminExamReviewSummary,
): AdminExamReviewListDto["list"][number] {
  return {
    id: summary.version.id,
    exam_id: summary.exam.id,
    exam_title: summary.exam.title,
    category: summary.exam.category,
    level: summary.exam.level,
    version_label: toVersionLabel(summary.version.versionNumber),
    submitted_at: summary.version.submittedAt?.toISOString() || null,
    status: summary.version.status,
    question_count: summary.questionCount,
    creator: summary.creator,
  }
}

function toAdminExamReviewDetailDto(
  review: AdminExamReviewAggregate,
): AdminExamReviewDetailDto {
  return {
    id: review.version.id,
    exam_id: review.exam.id,
    exam_title: review.exam.title,
    category: review.exam.category,
    level: review.exam.level,
    version_label: toVersionLabel(review.version.versionNumber),
    submitted_at: review.version.submittedAt?.toISOString() || null,
    status: review.version.status,
    review_note: review.version.reviewNote,
    creator: review.creator,
    questions: review.questions
      .sort((left, right) => left.orderNumber - right.orderNumber)
      .map(toExamQuestionDto),
  }
}

function toVersionLabel(versionNumber: number) {
  return `v${versionNumber}.0`
}
