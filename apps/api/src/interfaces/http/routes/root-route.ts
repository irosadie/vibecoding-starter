import type { Hono } from "hono"
import type { SystemController } from "../controllers/system-controller.js"

export const registerRootRoute = (app: Hono, controller: SystemController) => {
  app.get("/", controller.root)
}
