import Redis from "ioredis"
import { getWorkerSummary } from "./application/use-cases/get-worker-summary.js"
import { env } from "./infrastructure/config/env.js"
import { createWorkers } from "./infrastructure/queue/create-workers.js"

const writeStdout = (message: string) => {
  process.stdout.write(`${message}\n`)
}

const writeStderr = (message: string) => {
  process.stderr.write(`${message}\n`)
}

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
})

const workers = createWorkers(redis)
const summary = getWorkerSummary(workers.length)

redis.on("ready", () => {
  writeStdout(summary.message)
})

redis.on("error", (error) => {
  writeStderr(`[worker] redis connection error: ${error.message}`)
})

const shutdown = async (signal: string) => {
  writeStdout(`Received ${signal}, stopping worker...`)
  await Promise.all(workers.map((worker) => worker.close()))
  await redis.quit()
  process.exit(0)
}

process.on("SIGINT", () => {
  void shutdown("SIGINT")
})

process.on("SIGTERM", () => {
  void shutdown("SIGTERM")
})
