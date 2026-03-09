import { serve } from "@hono/node-server"
import { GetAppInfoUseCase } from "./application/use-cases/get-app-info.js"
import { GetHealthUseCase } from "./application/use-cases/get-health.js"
import { env } from "./infrastructure/config/env.js"
import { createApp } from "./interfaces/http/create-app.js"

const writeStdout = (message: string) => {
  process.stdout.write(`${message}\n`)
}

const app = createApp({
  getAppInfoUseCase: new GetAppInfoUseCase(),
  getHealthUseCase: new GetHealthUseCase(),
})

const server = serve(
  {
    fetch: app.fetch,
    port: env.API_PORT,
  },
  () => {
    writeStdout(`API running on http://localhost:${env.API_PORT}`)
  },
)

const shutdown = async (signal: string) => {
  writeStdout(`Received ${signal}, stopping API...`)
  server.close(async () => {
    process.exit(0)
  })
}

process.on("SIGINT", () => {
  void shutdown("SIGINT")
})

process.on("SIGTERM", () => {
  void shutdown("SIGTERM")
})
