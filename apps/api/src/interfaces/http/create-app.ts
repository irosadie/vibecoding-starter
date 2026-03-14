import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { SystemService } from "../../application/services/system-service.js"
import type { GetAppInfoUseCase } from "../../application/use-cases/get-app-info.js"
import type { GetHealthUseCase } from "../../application/use-cases/get-health.js"
import { SystemController } from "./controllers/system-controller.js"
import { errorHandler } from "./middleware/errorHandler.js"
import { adminCreatorApplicationRoutes } from "./routes/admin-creator-application-routes.js"
import { authRoutes } from "./routes/auth-routes.js"
import { catalogRoutes } from "./routes/catalog-routes.js"
import { commerceRoutes } from "./routes/commerce-routes.js"
import { creatorApplicationRoutes } from "./routes/creator-application-routes.js"
import { registerHealthRoute } from "./routes/health-route.js"
import { registerRootRoute } from "./routes/root-route.js"

type AppDependencies = {
  getAppInfoUseCase: GetAppInfoUseCase
  getHealthUseCase: GetHealthUseCase
}

export const createApp = ({
  getAppInfoUseCase,
  getHealthUseCase,
}: AppDependencies) => {
  const app = new Hono()
  const systemService = new SystemService({
    getAppInfoUseCase,
    getHealthUseCase,
  })
  const systemController = new SystemController(systemService)

  app.use("/*", cors({ origin: "*" }))
  app.use("/uploads/*", serveStatic({ root: "./" }))
  app.onError(errorHandler)

  registerRootRoute(app, systemController)
  registerHealthRoute(app, systemController)
  app.route("/api/v1/auth", authRoutes)
  app.route("/api/v1/catalog", catalogRoutes)
  app.route("/api/v1/commerce", commerceRoutes)
  app.route("/api/v1/creator-applications", creatorApplicationRoutes)
  app.route("/api/v1/admin/creator-applications", adminCreatorApplicationRoutes)

  return app
}
