import { Hono } from "hono"
import { cors } from "hono/cors"
import { SystemService } from "../../application/services/system-service.js"
import type { GetAppInfoUseCase } from "../../application/use-cases/get-app-info.js"
import type { GetHealthUseCase } from "../../application/use-cases/get-health.js"
import { SystemController } from "./controllers/system-controller.js"
import { errorHandler } from "./middleware/errorHandler.js"
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
  app.onError(errorHandler)

  registerRootRoute(app, systemController)
  registerHealthRoute(app, systemController)

  return app
}
