import { CreatorApplicationService } from "@/application/services/creator-application-service"
import {
  approveCreatorApplicationSchema,
  creatorApplicationIdParamSchema,
  listCreatorApplicationsQuerySchema,
  rejectCreatorApplicationSchema,
} from "@/application/validators/creator-application.schemas"
import { PrismaCreatorApplicationRepository } from "@/infrastructure/database/PrismaCreatorApplicationRepository"
import { LocalStorageService } from "@/infrastructure/services/local-storage-service"
import { CreatorApplicationController } from "@/interfaces/http/controllers/creator-application-controller"
import {
  authSessionMiddleware,
  requireRoles,
} from "@/interfaces/http/middleware/auth-session"
import { zValidator } from "@/interfaces/http/utils/validation"
import { Hono } from "hono"

const repository = new PrismaCreatorApplicationRepository()
const storageService = new LocalStorageService()
const creatorApplicationService = new CreatorApplicationService({
  repository,
  storageService,
})
const creatorApplicationController = new CreatorApplicationController(
  creatorApplicationService,
)

export const adminCreatorApplicationRoutes = new Hono()
  .use(authSessionMiddleware, requireRoles(["admin"]))
  .get(
    "/",
    zValidator("query", listCreatorApplicationsQuerySchema),
    creatorApplicationController.list,
  )
  .post(
    "/:id/approve",
    zValidator("param", creatorApplicationIdParamSchema),
    zValidator("json", approveCreatorApplicationSchema),
    creatorApplicationController.approve,
  )
  .post(
    "/:id/reject",
    zValidator("param", creatorApplicationIdParamSchema),
    zValidator("json", rejectCreatorApplicationSchema),
    creatorApplicationController.reject,
  )
