import { DomainError } from "@/domain/errors/DomainError"
import type {
  AdminExamReviewAggregate,
  AdminExamReviewSummary,
  CreatorExamDraftAggregate,
  CreatorExamDraftSummary,
  Exam,
  ExamMetadataSnapshot,
  ExamQuestion,
  ExamReviewAction,
  ExamVersion,
  ExamVersionStatus,
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
import { prisma } from "@/infrastructure/config/database"
import type {
  Exam as PrismaExam,
  ExamQuestion as PrismaExamQuestion,
  ExamVersion as PrismaExamVersion,
  Prisma,
} from "@prisma/client"

type PrismaTransactionClient = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

const EDITABLE_VERSION_STATUSES: ExamVersionStatus[] = ["DRAFT", "REJECTED"]

export class PrismaExamAuthoringReviewRepository
  implements IExamAuthoringReviewRepository
{
  async listCreatorExamDrafts(
    filter: CreatorExamDraftFilter,
    creatorId: string,
  ): Promise<CreatorExamDraftListResult> {
    const where: Prisma.ExamWhereInput = {
      creatorId,
      ...(filter.status && { currentStatus: filter.status }),
      ...(filter.search && {
        OR: [
          {
            title: {
              contains: filter.search,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: filter.search,
              mode: "insensitive",
            },
          },
        ],
      }),
    }

    const [rows, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        orderBy: {
          updatedAt: "desc",
        },
        skip: (filter.page - 1) * filter.perPage,
        take: filter.perPage,
        include: {
          versions: {
            orderBy: {
              versionNumber: "desc",
            },
            take: 1,
            include: {
              _count: {
                select: {
                  questions: true,
                },
              },
            },
          },
        },
      }),
      prisma.exam.count({ where }),
    ])

    const data: CreatorExamDraftSummary[] = rows.flatMap((row) => {
      const activeVersion = row.versions[0]

      if (!activeVersion) {
        return []
      }

      return [
        {
          exam: toExamEntity(row),
          activeVersion: toExamVersionEntity(activeVersion),
          questionCount: activeVersion._count.questions,
        },
      ]
    })

    return {
      data,
      total,
    }
  }

  async createExamDraft(input: CreateExamDraftInput): Promise<CreatorExamDraftAggregate> {
    const slug = await this.generateUniqueSlug(input.title)
    const metadataSnapshot: ExamMetadataSnapshot = {
      title: input.title,
      category: input.category,
      level: input.level,
      shortDescription: input.shortDescription,
      description: input.description,
      durationMinutes: input.durationMinutes,
    }

    const created = await prisma.exam.create({
      data: {
        creatorId: input.creatorId,
        slug,
        title: input.title,
        category: input.category,
        level: input.level,
        shortDescription: input.shortDescription,
        description: input.description,
        durationMinutes: input.durationMinutes,
        currentStatus: "DRAFT",
        versions: {
          create: {
            versionNumber: 1,
            status: "DRAFT",
            metadataSnapshot: metadataSnapshot as unknown as Prisma.InputJsonValue,
          },
        },
      },
      include: {
        versions: {
          include: {
            questions: {
              orderBy: {
                orderNumber: "asc",
              },
            },
          },
        },
      },
    })

    const activeVersion = created.versions[0]

    if (!activeVersion) {
      throw DomainError.internalError("Failed to create exam draft version")
    }

    return {
      exam: toExamEntity(created),
      activeVersion: toExamVersionEntity(activeVersion),
      questions: activeVersion.questions.map(toExamQuestionEntity),
    }
  }

  async getCreatorExamDraft(
    examId: string,
    creatorId: string,
  ): Promise<CreatorExamDraftAggregate | null> {
    const row = await prisma.exam.findFirst({
      where: {
        id: examId,
        creatorId,
      },
      include: {
        versions: {
          orderBy: {
            versionNumber: "desc",
          },
          include: {
            questions: {
              orderBy: {
                orderNumber: "asc",
              },
            },
          },
        },
      },
    })

    if (!row) {
      return null
    }

    const activeVersion =
      row.versions.find((version) =>
        EDITABLE_VERSION_STATUSES.includes(version.status as ExamVersionStatus),
      ) ?? row.versions[0]

    if (!activeVersion) {
      return null
    }

    return {
      exam: toExamEntity(row),
      activeVersion: toExamVersionEntity(activeVersion),
      questions: activeVersion.questions.map(toExamQuestionEntity),
    }
  }

  async updateExamDraftMetadata(
    input: UpdateExamDraftMetadataInput,
  ): Promise<CreatorExamDraftAggregate> {
    const result = await prisma.$transaction(async (tx) => {
      const draft = await this.getCreatorExamDraftTx(tx, input.examId, input.creatorId)

      if (!draft) {
        throw DomainError.notFound("Exam draft not found")
      }

      const editableVersion = await this.getEditableVersionTx(tx, input.examId)

      if (!editableVersion) {
        throw DomainError.conflict("No editable exam version available")
      }

      const nextMetadata: ExamMetadataSnapshot = {
        title: input.title ?? draft.exam.title,
        category: input.category ?? draft.exam.category,
        level: input.level ?? draft.exam.level,
        shortDescription: input.shortDescription ?? draft.exam.shortDescription,
        description: input.description ?? draft.exam.description,
        durationMinutes: input.durationMinutes ?? draft.exam.durationMinutes,
      }

      await tx.exam.update({
        where: {
          id: input.examId,
        },
        data: {
          title: nextMetadata.title,
          category: nextMetadata.category,
          level: nextMetadata.level,
          shortDescription: nextMetadata.shortDescription,
          description: nextMetadata.description,
          durationMinutes: nextMetadata.durationMinutes,
          currentStatus:
            editableVersion.status === "REJECTED" ? "DRAFT" : draft.exam.currentStatus,
        },
      })

      await tx.examVersion.update({
        where: {
          id: editableVersion.id,
        },
        data: {
          status: editableVersion.status === "REJECTED" ? "DRAFT" : editableVersion.status,
          metadataSnapshot: nextMetadata as unknown as Prisma.InputJsonValue,
        },
      })

      const updated = await this.getCreatorExamDraftTx(tx, input.examId, input.creatorId)

      if (!updated) {
        throw DomainError.notFound("Exam draft not found")
      }

      return updated
    })

    return result
  }

  async addExamQuestion(input: CreateExamQuestionInput): Promise<ExamQuestion> {
    const question = await prisma.$transaction(async (tx) => {
      const draft = await this.getCreatorExamDraftTx(tx, input.examId, input.creatorId)

      if (!draft) {
        throw DomainError.notFound("Exam draft not found")
      }

      const editableVersion = await this.getEditableVersionTx(tx, input.examId)

      if (!editableVersion) {
        throw DomainError.conflict("No editable exam version available")
      }

      const latestQuestion = await tx.examQuestion.findFirst({
        where: {
          examVersionId: editableVersion.id,
        },
        orderBy: {
          orderNumber: "desc",
        },
      })
      const nextOrderNumber = (latestQuestion?.orderNumber ?? 0) + 1

      const created = await tx.examQuestion.create({
        data: {
          examVersionId: editableVersion.id,
          orderNumber: nextOrderNumber,
          prompt: input.prompt,
          optionA: input.optionA,
          optionB: input.optionB,
          optionC: input.optionC,
          optionD: input.optionD,
          correctOption: input.correctOption,
          explanationText: input.explanationText || null,
          explanationVideoUrl: input.explanationVideoUrl || null,
        },
      })

      if (editableVersion.status === "REJECTED") {
        await tx.examVersion.update({
          where: { id: editableVersion.id },
          data: {
            status: "DRAFT",
          },
        })

        await tx.exam.update({
          where: { id: input.examId },
          data: {
            currentStatus: "DRAFT",
          },
        })
      }

      return created
    })

    return toExamQuestionEntity(question)
  }

  async updateExamQuestion(input: UpdateExamQuestionInput): Promise<ExamQuestion> {
    const question = await prisma.$transaction(async (tx) => {
      const draft = await this.getCreatorExamDraftTx(tx, input.examId, input.creatorId)

      if (!draft) {
        throw DomainError.notFound("Exam draft not found")
      }

      const editableVersion = await this.getEditableVersionTx(tx, input.examId)

      if (!editableVersion) {
        throw DomainError.conflict("No editable exam version available")
      }

      const currentQuestion = await tx.examQuestion.findFirst({
        where: {
          id: input.questionId,
          examVersionId: editableVersion.id,
        },
      })

      if (!currentQuestion) {
        throw DomainError.notFound("Exam question not found")
      }

      const updated = await tx.examQuestion.update({
        where: {
          id: currentQuestion.id,
        },
        data: {
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
        },
      })

      if (editableVersion.status === "REJECTED") {
        await tx.examVersion.update({
          where: { id: editableVersion.id },
          data: {
            status: "DRAFT",
          },
        })

        await tx.exam.update({
          where: { id: input.examId },
          data: {
            currentStatus: "DRAFT",
          },
        })
      }

      return updated
    })

    return toExamQuestionEntity(question)
  }

  async deleteExamQuestion(input: DeleteExamQuestionInput): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const draft = await this.getCreatorExamDraftTx(tx, input.examId, input.creatorId)

      if (!draft) {
        throw DomainError.notFound("Exam draft not found")
      }

      const editableVersion = await this.getEditableVersionTx(tx, input.examId)

      if (!editableVersion) {
        throw DomainError.conflict("No editable exam version available")
      }

      const deleted = await tx.examQuestion.deleteMany({
        where: {
          id: input.questionId,
          examVersionId: editableVersion.id,
        },
      })

      if (deleted.count === 0) {
        throw DomainError.notFound("Exam question not found")
      }

      const remainingQuestions = await tx.examQuestion.findMany({
        where: {
          examVersionId: editableVersion.id,
        },
        orderBy: {
          orderNumber: "asc",
        },
      })

      await Promise.all(
        remainingQuestions.map((question, index) =>
          tx.examQuestion.update({
            where: {
              id: question.id,
            },
            data: {
              orderNumber: index + 1,
            },
          }),
        ),
      )
    })
  }

  async submitExamReview(input: SubmitExamReviewInput): Promise<ExamVersion> {
    const version = await prisma.$transaction(async (tx) => {
      const draft = await this.getCreatorExamDraftTx(tx, input.examId, input.creatorId)

      if (!draft) {
        throw DomainError.notFound("Exam draft not found")
      }

      const editableVersion = await this.getEditableVersionTx(tx, input.examId)

      if (!editableVersion) {
        throw DomainError.conflict("No editable exam version available")
      }

      const submittedAt = new Date()
      const updated = await tx.examVersion.update({
        where: {
          id: editableVersion.id,
        },
        data: {
          status: "IN_REVIEW",
          submittedAt,
          reviewNote: input.submitNote || null,
        },
      })

      await tx.exam.update({
        where: {
          id: input.examId,
        },
        data: {
          currentStatus: "IN_REVIEW",
        },
      })

      await this.createReviewLogTx(tx, {
        examVersionId: editableVersion.id,
        actorId: input.creatorId,
        action: "SUBMITTED",
        note: input.submitNote || null,
      })

      return updated
    })

    return toExamVersionEntity(version)
  }

  async listAdminExamReviews(
    filter: AdminExamReviewFilter,
  ): Promise<AdminExamReviewListResult> {
    const where: Prisma.ExamVersionWhereInput = {
      status: filter.status ?? "IN_REVIEW",
      ...(filter.search && {
        OR: [
          {
            exam: {
              title: {
                contains: filter.search,
                mode: "insensitive",
              },
            },
          },
          {
            exam: {
              creator: {
                name: {
                  contains: filter.search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            exam: {
              creator: {
                email: {
                  contains: filter.search,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      }),
    }

    const [rows, total] = await Promise.all([
      prisma.examVersion.findMany({
        where,
        orderBy: {
          submittedAt: "desc",
        },
        skip: (filter.page - 1) * filter.perPage,
        take: filter.perPage,
        include: {
          exam: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              questions: true,
            },
          },
        },
      }),
      prisma.examVersion.count({ where }),
    ])

    const data: AdminExamReviewSummary[] = rows.map((row) => ({
      exam: toExamEntity(row.exam),
      version: toExamVersionEntity(row),
      questionCount: row._count.questions,
      creator: {
        id: row.exam.creator.id,
        name: row.exam.creator.name,
        email: row.exam.creator.email,
      },
    }))

    return {
      data,
      total,
    }
  }

  async getAdminExamReview(
    reviewId: string,
  ): Promise<AdminExamReviewAggregate | null> {
    const row = await prisma.examVersion.findUnique({
      where: {
        id: reviewId,
      },
      include: {
        exam: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        questions: {
          orderBy: {
            orderNumber: "asc",
          },
        },
      },
    })

    if (!row) {
      return null
    }

    return {
      exam: toExamEntity(row.exam),
      version: toExamVersionEntity(row),
      questions: row.questions.map(toExamQuestionEntity),
      creator: {
        id: row.exam.creator.id,
        name: row.exam.creator.name,
        email: row.exam.creator.email,
      },
    }
  }

  async approveExamReview(
    input: ApproveExamReviewInput,
  ): Promise<AdminExamReviewAggregate> {
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.examVersion.findUnique({
        where: {
          id: input.reviewId,
        },
        include: {
          exam: true,
          questions: {
            orderBy: {
              orderNumber: "asc",
            },
          },
        },
      })

      if (!review) {
        throw DomainError.notFound("Exam review submission not found")
      }

      const reviewedAt = new Date()
      await tx.examVersion.update({
        where: {
          id: review.id,
        },
        data: {
          status: "PUBLISHED",
          reviewedBy: input.reviewedBy,
          reviewedAt,
          reviewNote: input.reviewNote || null,
          publishedAt: reviewedAt,
        },
      })

      await tx.exam.update({
        where: {
          id: review.examId,
        },
        data: {
          currentStatus: "PUBLISHED",
        },
      })

      await this.createReviewLogTx(tx, {
        examVersionId: review.id,
        actorId: input.reviewedBy,
        action: "APPROVED",
        note: input.reviewNote || null,
      })

      const nextVersion = await tx.examVersion.create({
        data: {
          examId: review.examId,
          versionNumber: review.versionNumber + 1,
          status: "DRAFT",
          metadataSnapshot:
            review.metadataSnapshot as unknown as Prisma.InputJsonValue,
        },
      })

      if (review.questions.length > 0) {
        await tx.examQuestion.createMany({
          data: review.questions.map((question) => ({
            examVersionId: nextVersion.id,
            orderNumber: question.orderNumber,
            prompt: question.prompt,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctOption: question.correctOption,
            explanationText: question.explanationText,
            explanationVideoUrl: question.explanationVideoUrl,
          })),
        })
      }

      const updated = await this.getAdminExamReviewTx(tx, review.id)

      if (!updated) {
        throw DomainError.notFound("Exam review submission not found")
      }

      return updated
    })

    return result
  }

  async rejectExamReview(
    input: RejectExamReviewInput,
  ): Promise<AdminExamReviewAggregate> {
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.examVersion.findUnique({
        where: {
          id: input.reviewId,
        },
      })

      if (!review) {
        throw DomainError.notFound("Exam review submission not found")
      }

      const reviewedAt = new Date()
      await tx.examVersion.update({
        where: {
          id: review.id,
        },
        data: {
          status: "REJECTED",
          reviewedBy: input.reviewedBy,
          reviewedAt,
          reviewNote: input.reviewNote,
        },
      })

      await tx.exam.update({
        where: {
          id: review.examId,
        },
        data: {
          currentStatus: "NEEDS_REVISION",
        },
      })

      await this.createReviewLogTx(tx, {
        examVersionId: review.id,
        actorId: input.reviewedBy,
        action: "REJECTED",
        note: input.reviewNote,
      })

      const updated = await this.getAdminExamReviewTx(tx, review.id)

      if (!updated) {
        throw DomainError.notFound("Exam review submission not found")
      }

      return updated
    })

    return result
  }

  async getExamById(examId: string): Promise<Exam | null> {
    const row = await prisma.exam.findUnique({
      where: {
        id: examId,
      },
    })

    return row ? toExamEntity(row) : null
  }

  private async getCreatorExamDraftTx(
    tx: PrismaTransactionClient,
    examId: string,
    creatorId: string,
  ): Promise<CreatorExamDraftAggregate | null> {
    const row = await tx.exam.findFirst({
      where: {
        id: examId,
        creatorId,
      },
      include: {
        versions: {
          orderBy: {
            versionNumber: "desc",
          },
          include: {
            questions: {
              orderBy: {
                orderNumber: "asc",
              },
            },
          },
        },
      },
    })

    if (!row) {
      return null
    }

    const activeVersion =
      row.versions.find((version) =>
        EDITABLE_VERSION_STATUSES.includes(version.status as ExamVersionStatus),
      ) ?? row.versions[0]

    if (!activeVersion) {
      return null
    }

    return {
      exam: toExamEntity(row),
      activeVersion: toExamVersionEntity(activeVersion),
      questions: activeVersion.questions.map(toExamQuestionEntity),
    }
  }

  private async getEditableVersionTx(
    tx: PrismaTransactionClient,
    examId: string,
  ): Promise<PrismaExamVersion | null> {
    return tx.examVersion.findFirst({
      where: {
        examId,
        status: {
          in: EDITABLE_VERSION_STATUSES,
        },
      },
      orderBy: {
        versionNumber: "desc",
      },
    })
  }

  private async getAdminExamReviewTx(
    tx: PrismaTransactionClient,
    reviewId: string,
  ): Promise<AdminExamReviewAggregate | null> {
    const row = await tx.examVersion.findUnique({
      where: {
        id: reviewId,
      },
      include: {
        exam: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        questions: {
          orderBy: {
            orderNumber: "asc",
          },
        },
      },
    })

    if (!row) {
      return null
    }

    return {
      exam: toExamEntity(row.exam),
      version: toExamVersionEntity(row),
      questions: row.questions.map(toExamQuestionEntity),
      creator: {
        id: row.exam.creator.id,
        name: row.exam.creator.name,
        email: row.exam.creator.email,
      },
    }
  }

  private async createReviewLogTx(
    tx: PrismaTransactionClient,
    input: {
      examVersionId: string
      actorId: string
      action: ExamReviewAction
      note: string | null
    },
  ) {
    await tx.examReviewLog.create({
      data: {
        examVersionId: input.examVersionId,
        actorId: input.actorId,
        action: input.action,
        note: input.note,
      },
    })
  }

  private async generateUniqueSlug(title: string) {
    const normalizedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    const baseSlug = normalizedSlug || "exam-draft"
    let candidate = baseSlug
    let suffixCounter = 0

    while (true) {
      const existing = await prisma.exam.findUnique({
        where: {
          slug: candidate,
        },
        select: {
          id: true,
        },
      })

      if (!existing) {
        return candidate
      }

      suffixCounter += 1
      candidate = `${baseSlug}-${suffixCounter}`
    }
  }
}

function toExamEntity(row: PrismaExam): Exam {
  return {
    id: row.id,
    creatorId: row.creatorId,
    slug: row.slug,
    title: row.title,
    category: row.category,
    level: row.level,
    shortDescription: row.shortDescription,
    description: row.description,
    durationMinutes: row.durationMinutes,
    currentStatus: row.currentStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toExamVersionEntity(row: PrismaExamVersion): ExamVersion {
  const metadataSnapshot = row.metadataSnapshot as unknown as ExamMetadataSnapshot

  return {
    id: row.id,
    examId: row.examId,
    versionNumber: row.versionNumber,
    status: row.status,
    metadataSnapshot: {
      title: metadataSnapshot.title,
      category: metadataSnapshot.category,
      level: metadataSnapshot.level,
      shortDescription: metadataSnapshot.shortDescription,
      description: metadataSnapshot.description,
      durationMinutes: metadataSnapshot.durationMinutes,
    },
    submittedAt: row.submittedAt,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt,
    reviewNote: row.reviewNote,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toExamQuestionEntity(row: PrismaExamQuestion): ExamQuestion {
  return {
    id: row.id,
    examVersionId: row.examVersionId,
    orderNumber: row.orderNumber,
    prompt: row.prompt,
    optionA: row.optionA,
    optionB: row.optionB,
    optionC: row.optionC,
    optionD: row.optionD,
    correctOption: row.correctOption,
    explanationText: row.explanationText,
    explanationVideoUrl: row.explanationVideoUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
