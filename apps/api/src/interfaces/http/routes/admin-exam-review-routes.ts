import { ExamAuthoringReviewService } from "@/application/services/exam-authoring-review-service"
import {
  approveExamReviewSchema,
  examReviewIdParamSchema,
  listAdminExamReviewsQuerySchema,
  rejectExamReviewSchema,
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

export const adminExamReviewRoutes = new Hono()
  .use(authSessionMiddleware, requireRoles(["admin"]))
  .get(
    "/",
    zValidator("query", listAdminExamReviewsQuerySchema),
    controller.listAdminReviews,
  )
  .get(
    "/:id",
    zValidator("param", examReviewIdParamSchema),
    controller.getAdminReview,
  )
  .post(
    "/:id/approve",
    zValidator("param", examReviewIdParamSchema),
    zValidator("json", approveExamReviewSchema),
    controller.approveAdminReview,
  )
  .post(
    "/:id/reject",
    zValidator("param", examReviewIdParamSchema),
    zValidator("json", rejectExamReviewSchema),
    controller.rejectAdminReview,
  )
