import type { Hono } from "hono"
import type { SystemController } from "../controllers/system-controller.js"

export const registerHealthRoute = (
  app: Hono,
  controller: SystemController,
) => {
  app.get("/health", controller.health)
}
