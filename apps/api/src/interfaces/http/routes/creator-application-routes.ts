import { CreatorApplicationService } from "@/application/services/creator-application-service"
import { submitCreatorApplicationFormSchema } from "@/application/validators/creator-application.schemas"
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

export const creatorApplicationRoutes = new Hono()
  .use(authSessionMiddleware)
  .post(
    "/",
    requireRoles(["user", "admin"]),
    zValidator("form", submitCreatorApplicationFormSchema),
    creatorApplicationController.submit,
  )
  .get(
    "/me",
    requireRoles(["user", "admin", "creator"]),
    creatorApplicationController.me,
  )
