import type { ExamAuthoringReviewService } from "@/application/services/exam-authoring-review-service"
import {
  approveExamReviewSchema,
  createExamDraftSchema,
  createExamQuestionSchema,
  examIdParamSchema,
  examQuestionParamSchema,
  examReviewIdParamSchema,
  listAdminExamReviewsQuerySchema,
  listCreatorExamDraftsQuerySchema,
  rejectExamReviewSchema,
  submitExamReviewSchema,
  updateExamDraftSchema,
  updateExamQuestionSchema,
} from "@/application/validators/exam-authoring-review.schemas"
import { getAuthSession } from "@/interfaces/http/middleware/auth-session"
import { successResponse } from "@/interfaces/http/utils/response"
import type { Context } from "hono"

export class ExamAuthoringReviewController {
  constructor(private readonly service: ExamAuthoringReviewService) {}

  listCreatorDrafts = async (c: Context) => {
    const query = listCreatorExamDraftsQuerySchema.parse(c.req.query())
    const session = getAuthSession(c)
    const result = await this.service.listCreatorDrafts(session.userId, query)

    return successResponse(c, {
      message: "Creator exam drafts loaded",
      data: result.list,
      meta: {
        total: result.total,
        currentPage: result.page,
        perPage: result.perPage,
        lastPage: Math.max(1, Math.ceil(result.total / result.perPage)),
      },
    })
  }

  createDraft = async (c: Context) => {
    const payload = createExamDraftSchema.parse(await c.req.json())
    const session = getAuthSession(c)
    const result = await this.service.createDraft(session.userId, payload)

    return successResponse(
      c,
      {
        message: "Exam draft created",
        data: result,
      },
      201,
    )
  }

  getDraft = async (c: Context) => {
    const params = examIdParamSchema.parse(c.req.param())
    const session = getAuthSession(c)
    const result = await this.service.getDraft(session.userId, params.id)

    return successResponse(c, {
      message: "Exam draft loaded",
      data: result,
    })
  }

  updateDraft = async (c: Context) => {
    const params = examIdParamSchema.parse(c.req.param())
    const payload = updateExamDraftSchema.parse(await c.req.json())
    const session = getAuthSession(c)
    const result = await this.service.updateDraft(session.userId, params.id, payload)

    return successResponse(c, {
      message: "Exam draft updated",
      data: result,
    })
  }

  addQuestion = async (c: Context) => {
    const params = examIdParamSchema.parse(c.req.param())
    const payload = createExamQuestionSchema.parse(await c.req.json())
    const session = getAuthSession(c)
    const result = await this.service.addQuestion(session.userId, params.id, payload)

    return successResponse(
      c,
      {
        message: "Exam question added",
        data: result,
      },
      201,
    )
  }

  updateQuestion = async (c: Context) => {
    const params = examQuestionParamSchema.parse(c.req.param())
    const payload = updateExamQuestionSchema.parse(await c.req.json())
    const session = getAuthSession(c)
    const result = await this.service.updateQuestion(
      session.userId,
      params.id,
      params.questionId,
      payload,
    )

    return successResponse(c, {
      message: "Exam question updated",
      data: result,
    })
  }

  deleteQuestion = async (c: Context) => {
    const params = examQuestionParamSchema.parse(c.req.param())
    const session = getAuthSession(c)

    await this.service.deleteQuestion(session.userId, params.id, params.questionId)

    return successResponse(c, {
      message: "Exam question deleted",
      data: {
        id: params.questionId,
        removed: true,
      },
    })
  }

  submitReview = async (c: Context) => {
    const params = examIdParamSchema.parse(c.req.param())
    const payload = submitExamReviewSchema.parse(await c.req.json())
    const session = getAuthSession(c)
    const result = await this.service.submitReview(session.userId, params.id, payload)

    return successResponse(c, {
      message: "Exam draft submitted to review",
      data: result,
    })
  }

  listAdminReviews = async (c: Context) => {
    const query = listAdminExamReviewsQuerySchema.parse(c.req.query())
    const result = await this.service.listAdminReviews(query)

    return successResponse(c, {
      message: "Exam review queue loaded",
      data: result.list,
      meta: {
        total: result.total,
        currentPage: result.page,
        perPage: result.perPage,
        lastPage: Math.max(1, Math.ceil(result.total / result.perPage)),
      },
    })
  }

  getAdminReview = async (c: Context) => {
    const params = examReviewIdParamSchema.parse(c.req.param())
    const result = await this.service.getAdminReview(params.id)

    return successResponse(c, {
      message: "Exam review detail loaded",
      data: result,
    })
  }

  approveAdminReview = async (c: Context) => {
    const params = examReviewIdParamSchema.parse(c.req.param())
    const payload = approveExamReviewSchema.parse(await c.req.json())
    const session = getAuthSession(c)
    const result = await this.service.approveReview(
      params.id,
      session.userId,
      payload,
    )

    return successResponse(c, {
      message: "Exam review approved",
      data: result,
    })
  }

  rejectAdminReview = async (c: Context) => {
    const params = examReviewIdParamSchema.parse(c.req.param())
    const payload = rejectExamReviewSchema.parse(await c.req.json())
    const session = getAuthSession(c)
    const result = await this.service.rejectReview(
      params.id,
      session.userId,
      payload,
    )

    return successResponse(c, {
      message: "Exam review rejected",
      data: result,
    })
  }
}
