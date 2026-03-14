import { randomUUID } from "node:crypto"
import type {
  AdminExamReviewAggregate,
  AdminExamReviewSummary,
  CreatorExamDraftAggregate,
  CreatorExamDraftSummary,
  Exam,
  ExamQuestion,
  ExamVersion,
} from "@/domain/entities/ExamAuthoringReview"
import type {
  AdminExamReviewFilter,
  AdminExamReviewListResult,
  ApproveExamReviewInput,
  CreateExamDraftInput,
  CreateExamQuestionInput,
  CreatorExamDraftFilter,
  CreatorExamDraftListResult,
  DeleteExamQuestionInput,
  IExamAuthoringReviewRepository,
  RejectExamReviewInput,
  SubmitExamReviewInput,
  UpdateExamDraftMetadataInput,
  UpdateExamQuestionInput,
} from "@/domain/repositories/IExamAuthoringReviewRepository"
import { approveExamReview } from "@/domain/use-cases/approve-exam-review"
import { createExamDraft } from "@/domain/use-cases/create-exam-draft"
import { rejectExamReview } from "@/domain/use-cases/reject-exam-review"
import { submitExamReview } from "@/domain/use-cases/submit-exam-review"
import { beforeEach, describe, expect, it } from "vitest"

class InMemoryExamAuthoringRepository
  implements IExamAuthoringReviewRepository
{
  private exams = new Map<string, Exam>()
  private versions = new Map<string, ExamVersion>()
  private questions = new Map<string, ExamQuestion[]>()

  async listCreatorExamDrafts(
    _filter: CreatorExamDraftFilter,
    creatorId: string,
  ): Promise<CreatorExamDraftListResult> {
    const data: CreatorExamDraftSummary[] = []

    for (const exam of this.exams.values()) {
      if (exam.creatorId !== creatorId) {
        continue
      }

      const latestVersion = this.findLatestVersion(exam.id)
      if (!latestVersion) {
        continue
      }

      data.push({
        exam,
        activeVersion: latestVersion,
        questionCount: this.questions.get(latestVersion.id)?.length || 0,
      })
    }

    return {
      data,
      total: data.length,
    }
  }

  async createExamDraft(input: CreateExamDraftInput): Promise<CreatorExamDraftAggregate> {
    const now = new Date()
    const exam: Exam = {
      id: randomUUID(),
      creatorId: input.creatorId,
      slug: input.title.toLowerCase().replace(/\s+/g, "-"),
      title: input.title,
      category: input.category,
      level: input.level,
      shortDescription: input.shortDescription,
      description: input.description,
      durationMinutes: input.durationMinutes,
      currentStatus: "DRAFT",
      createdAt: now,
      updatedAt: now,
    }

    const version: ExamVersion = {
      id: randomUUID(),
      examId: exam.id,
      versionNumber: 1,
      status: "DRAFT",
      metadataSnapshot: {
        title: input.title,
        category: input.category,
        level: input.level,
        shortDescription: input.shortDescription,
        description: input.description,
        durationMinutes: input.durationMinutes,
      },
      submittedAt: null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    }

    this.exams.set(exam.id, exam)
    this.versions.set(version.id, version)
    this.questions.set(version.id, [])

    return {
      exam,
      activeVersion: version,
      questions: [],
    }
  }

  async getCreatorExamDraft(
    examId: string,
    creatorId: string,
  ): Promise<CreatorExamDraftAggregate | null> {
    const exam = this.exams.get(examId)

    if (!exam || exam.creatorId !== creatorId) {
      return null
    }

    const version = this.findEditableVersion(exam.id) || this.findLatestVersion(exam.id)

    if (!version) {
      return null
    }

    return {
      exam,
      activeVersion: version,
      questions: [...(this.questions.get(version.id) || [])],
    }
  }

  async updateExamDraftMetadata(
    input: UpdateExamDraftMetadataInput,
  ): Promise<CreatorExamDraftAggregate> {
    const draft = await this.getCreatorExamDraft(input.examId, input.creatorId)

    if (!draft) {
      throw new Error("draft not found")
    }

    const updatedExam: Exam = {
      ...draft.exam,
      title: input.title ?? draft.exam.title,
      category: input.category ?? draft.exam.category,
      level: input.level ?? draft.exam.level,
      shortDescription: input.shortDescription ?? draft.exam.shortDescription,
      description: input.description ?? draft.exam.description,
      durationMinutes: input.durationMinutes ?? draft.exam.durationMinutes,
      updatedAt: new Date(),
    }

    const updatedVersion: ExamVersion = {
      ...draft.activeVersion,
      status: draft.activeVersion.status === "REJECTED" ? "DRAFT" : draft.activeVersion.status,
      metadataSnapshot: {
        title: updatedExam.title,
        category: updatedExam.category,
        level: updatedExam.level,
        shortDescription: updatedExam.shortDescription,
        description: updatedExam.description,
        durationMinutes: updatedExam.durationMinutes,
      },
      updatedAt: new Date(),
    }

    this.exams.set(updatedExam.id, updatedExam)
    this.versions.set(updatedVersion.id, updatedVersion)

    return {
      exam: updatedExam,
      activeVersion: updatedVersion,
      questions: draft.questions,
    }
  }

  async addExamQuestion(input: CreateExamQuestionInput): Promise<ExamQuestion> {
    const draft = await this.getCreatorExamDraft(input.examId, input.creatorId)

    if (!draft) {
      throw new Error("draft not found")
    }

    const currentQuestions = this.questions.get(draft.activeVersion.id) || []
    const question: ExamQuestion = {
      id: randomUUID(),
      examVersionId: draft.activeVersion.id,
      orderNumber: currentQuestions.length + 1,
      prompt: input.prompt,
      optionA: input.optionA,
      optionB: input.optionB,
      optionC: input.optionC,
      optionD: input.optionD,
      correctOption: input.correctOption,
      explanationText: input.explanationText || null,
      explanationVideoUrl: input.explanationVideoUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.questions.set(draft.activeVersion.id, [...currentQuestions, question])

    return question
  }

  async updateExamQuestion(input: UpdateExamQuestionInput): Promise<ExamQuestion> {
    const draft = await this.getCreatorExamDraft(input.examId, input.creatorId)

    if (!draft) {
      throw new Error("draft not found")
    }

    const currentQuestions = this.questions.get(draft.activeVersion.id) || []
    const index = currentQuestions.findIndex((question) => question.id === input.questionId)

    if (index < 0) {
      throw new Error("question not found")
    }

    const currentQuestion = currentQuestions[index]
    if (!currentQuestion) {
      throw new Error("question not found")
    }

    const updatedQuestion: ExamQuestion = {
      ...currentQuestion,
      prompt: input.prompt ?? currentQuestion.prompt,
      optionA: input.optionA ?? currentQuestion.optionA,
      optionB: input.optionB ?? currentQuestion.optionB,
      optionC: input.optionC ?? currentQuestion.optionC,
      optionD: input.optionD ?? currentQuestion.optionD,
      correctOption: input.correctOption ?? currentQuestion.correctOption,
      explanationText:
        input.explanationText !== undefined
          ? input.explanationText || null
          : currentQuestion.explanationText,
      explanationVideoUrl:
        input.explanationVideoUrl !== undefined
          ? input.explanationVideoUrl || null
          : currentQuestion.explanationVideoUrl,
      updatedAt: new Date(),
    }

    const nextQuestions = [...currentQuestions]
    nextQuestions[index] = updatedQuestion
    this.questions.set(draft.activeVersion.id, nextQuestions)

    return updatedQuestion
  }

  async deleteExamQuestion(input: DeleteExamQuestionInput): Promise<void> {
    const draft = await this.getCreatorExamDraft(input.examId, input.creatorId)

    if (!draft) {
      throw new Error("draft not found")
    }

    const currentQuestions = this.questions.get(draft.activeVersion.id) || []
    this.questions.set(
      draft.activeVersion.id,
      currentQuestions.filter((question) => question.id !== input.questionId),
    )
  }

  async submitExamReview(input: SubmitExamReviewInput): Promise<ExamVersion> {
    const draft = await this.getCreatorExamDraft(input.examId, input.creatorId)

    if (!draft) {
      throw new Error("draft not found")
    }

    const updatedVersion: ExamVersion = {
      ...draft.activeVersion,
      status: "IN_REVIEW",
      submittedAt: new Date(),
      reviewNote: input.submitNote || null,
      updatedAt: new Date(),
    }

    this.versions.set(updatedVersion.id, updatedVersion)
    this.exams.set(draft.exam.id, {
      ...draft.exam,
      currentStatus: "IN_REVIEW",
      updatedAt: new Date(),
    })

    return updatedVersion
  }

  async listAdminExamReviews(
    _filter: AdminExamReviewFilter,
  ): Promise<AdminExamReviewListResult> {
    const data: AdminExamReviewSummary[] = []

    for (const version of this.versions.values()) {
      const exam = this.exams.get(version.examId)
      if (!exam) {
        continue
      }

      data.push({
        exam,
        version,
        creator: {
          id: exam.creatorId,
          name: "Creator",
          email: "creator@example.com",
        },
        questionCount: this.questions.get(version.id)?.length || 0,
      })
    }

    return {
      data,
      total: data.length,
    }
  }

  async getAdminExamReview(reviewId: string): Promise<AdminExamReviewAggregate | null> {
    const version = this.versions.get(reviewId)

    if (!version) {
      return null
    }

    const exam = this.exams.get(version.examId)

    if (!exam) {
      return null
    }

    return {
      exam,
      version,
      creator: {
        id: exam.creatorId,
        name: "Creator",
        email: "creator@example.com",
      },
      questions: [...(this.questions.get(version.id) || [])],
    }
  }

  async approveExamReview(
    input: ApproveExamReviewInput,
  ): Promise<AdminExamReviewAggregate> {
    const current = await this.getAdminExamReview(input.reviewId)

    if (!current) {
      throw new Error("review not found")
    }

    const approvedVersion: ExamVersion = {
      ...current.version,
      status: "PUBLISHED",
      reviewedBy: input.reviewedBy,
      reviewedAt: new Date(),
      reviewNote: input.reviewNote || null,
      publishedAt: new Date(),
      updatedAt: new Date(),
    }

    this.versions.set(approvedVersion.id, approvedVersion)

    this.exams.set(current.exam.id, {
      ...current.exam,
      currentStatus: "PUBLISHED",
      updatedAt: new Date(),
    })

    const nextVersion: ExamVersion = {
      id: randomUUID(),
      examId: current.exam.id,
      versionNumber: approvedVersion.versionNumber + 1,
      status: "DRAFT",
      metadataSnapshot: approvedVersion.metadataSnapshot,
      submittedAt: null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.versions.set(nextVersion.id, nextVersion)
    this.questions.set(
      nextVersion.id,
      current.questions.map((question) => ({
        ...question,
        id: randomUUID(),
        examVersionId: nextVersion.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    )

    const updated = await this.getAdminExamReview(approvedVersion.id)

    if (!updated) {
      throw new Error("review not found")
    }

    return updated
  }

  async rejectExamReview(input: RejectExamReviewInput): Promise<AdminExamReviewAggregate> {
    const current = await this.getAdminExamReview(input.reviewId)

    if (!current) {
      throw new Error("review not found")
    }

    const rejectedVersion: ExamVersion = {
      ...current.version,
      status: "REJECTED",
      reviewedBy: input.reviewedBy,
      reviewedAt: new Date(),
      reviewNote: input.reviewNote,
      updatedAt: new Date(),
    }

    this.versions.set(rejectedVersion.id, rejectedVersion)
    this.exams.set(current.exam.id, {
      ...current.exam,
      currentStatus: "NEEDS_REVISION",
      updatedAt: new Date(),
    })

    const updated = await this.getAdminExamReview(rejectedVersion.id)

    if (!updated) {
      throw new Error("review not found")
    }

    return updated
  }

  async getExamById(examId: string): Promise<Exam | null> {
    return this.exams.get(examId) || null
  }

  private findLatestVersion(examId: string) {
    const versions = [...this.versions.values()]
      .filter((version) => version.examId === examId)
      .sort((left, right) => right.versionNumber - left.versionNumber)

    return versions[0]
  }

  private findEditableVersion(examId: string) {
    const versions = [...this.versions.values()]
      .filter((version) => version.examId === examId)
      .sort((left, right) => right.versionNumber - left.versionNumber)

    return versions.find((version) => version.status === "DRAFT" || version.status === "REJECTED")
  }
}

describe("exam authoring review use cases", () => {
  let repository: InMemoryExamAuthoringRepository

  beforeEach(() => {
    repository = new InMemoryExamAuthoringRepository()
  })

  it("rejects submit review when no explanation type is provided", async () => {
    const draft = await createExamDraft(repository, {
      creatorId: randomUUID(),
      title: "Tryout CPNS",
      category: "CPNS",
      level: "INTERMEDIATE",
      shortDescription: "Tryout CPNS",
      description: "Draft CPNS",
      durationMinutes: 90,
    })

    await repository.addExamQuestion({
      creatorId: draft.exam.creatorId,
      examId: draft.exam.id,
      prompt: "Soal 1",
      optionA: "A",
      optionB: "B",
      optionC: "C",
      optionD: "D",
      correctOption: "A",
    })

    await expect(
      submitExamReview(repository, {
        creatorId: draft.exam.creatorId,
        examId: draft.exam.id,
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      status: 400,
    })
  })

  it("approves in-review submission and creates next draft snapshot", async () => {
    const draft = await createExamDraft(repository, {
      creatorId: randomUUID(),
      title: "Tryout UTBK",
      category: "UTBK",
      level: "ADVANCED",
      shortDescription: "Tryout UTBK",
      description: "Draft UTBK",
      durationMinutes: 120,
    })

    await repository.addExamQuestion({
      creatorId: draft.exam.creatorId,
      examId: draft.exam.id,
      prompt: "Soal 1",
      optionA: "A",
      optionB: "B",
      optionC: "C",
      optionD: "D",
      correctOption: "A",
      explanationText: "Pembahasan teks",
    })

    const submitted = await submitExamReview(repository, {
      creatorId: draft.exam.creatorId,
      examId: draft.exam.id,
    })

    const approved = await approveExamReview(repository, {
      reviewId: submitted.id,
      reviewedBy: randomUUID(),
      reviewNote: "Good to publish",
    })

    expect(approved.version.status).toBe("PUBLISHED")

    const refreshedDraft = await repository.getCreatorExamDraft(
      draft.exam.id,
      draft.exam.creatorId,
    )

    expect(refreshedDraft?.activeVersion.status).toBe("DRAFT")
    expect(refreshedDraft?.questions.length).toBe(1)
  })

  it("rejects in-review submission and marks exam needs revision", async () => {
    const draft = await createExamDraft(repository, {
      creatorId: randomUUID(),
      title: "Tryout Bahasa Inggris",
      category: "Language",
      level: "BEGINNER",
      shortDescription: "Tryout English",
      description: "Draft English",
      durationMinutes: 75,
    })

    await repository.addExamQuestion({
      creatorId: draft.exam.creatorId,
      examId: draft.exam.id,
      prompt: "Soal 1",
      optionA: "A",
      optionB: "B",
      optionC: "C",
      optionD: "D",
      correctOption: "A",
      explanationVideoUrl: "https://example.com/video.mp4",
    })

    const submitted = await submitExamReview(repository, {
      creatorId: draft.exam.creatorId,
      examId: draft.exam.id,
    })

    const rejected = await rejectExamReview(repository, {
      reviewId: submitted.id,
      reviewedBy: randomUUID(),
      reviewNote: "Perbaiki opsi jawaban",
    })

    expect(rejected.version.status).toBe("REJECTED")

    const exam = await repository.getExamById(draft.exam.id)

    expect(exam?.currentStatus).toBe("NEEDS_REVISION")
  })
})
