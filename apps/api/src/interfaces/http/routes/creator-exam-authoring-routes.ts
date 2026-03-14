import { ExamAuthoringReviewService } from "@/application/services/exam-authoring-review-service"
import {
  createExamDraftSchema,
  createExamQuestionSchema,
  examIdParamSchema,
  examQuestionParamSchema,
  listCreatorExamDraftsQuerySchema,
  submitExamReviewSchema,
  updateExamDraftSchema,
  updateExamQuestionSchema,
} from "@/application/validators/exam-authoring-review.schemas"
import { PrismaExamAuthoringReviewRepository } from "@/infrastructure/database/PrismaExamAuthoringReviewRepository"
import { ExamAuthoringReviewController } from "@/interfaces/http/controllers/exam-authoring-review-controller"
import {
  authSessionMiddleware,
  requireRoles,
} from "@/interfaces/http/middleware/auth-session"
import { zValidator } from "@/interfaces/http/utils/validation"
import { Hono } from "hono"

const repository = new PrismaExamAuthoringReviewRepository()
const service = new ExamAuthoringReviewService({ repository })
const controller = new ExamAuthoringReviewController(service)

export const creatorExamAuthoringRoutes = new Hono()
  .use(authSessionMiddleware)
  .use(requireRoles(["creator", "admin"]))
  .get(
    "/",
    zValidator("query", listCreatorExamDraftsQuerySchema),
    controller.listCreatorDrafts,
  )
  .post("/", zValidator("json", createExamDraftSchema), controller.createDraft)
  .get("/:id", zValidator("param", examIdParamSchema), controller.getDraft)
  .put(
    "/:id",
    zValidator("param", examIdParamSchema),
    zValidator("json", updateExamDraftSchema),
    controller.updateDraft,
  )
  .post(
    "/:id/questions",
    zValidator("param", examIdParamSchema),
    zValidator("json", createExamQuestionSchema),
    controller.addQuestion,
  )
  .put(
    "/:id/questions/:questionId",
    zValidator("param", examQuestionParamSchema),
    zValidator("json", updateExamQuestionSchema),
    controller.updateQuestion,
  )
  .delete(
    "/:id/questions/:questionId",
    zValidator("param", examQuestionParamSchema),
    controller.deleteQuestion,
  )
  .post(
    "/:id/submit-review",
    zValidator("param", examIdParamSchema),
    zValidator("json", submitExamReviewSchema),
    controller.submitReview,
  )
