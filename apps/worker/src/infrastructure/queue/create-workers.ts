import type { Worker } from "bullmq"
import type Redis from "ioredis"

export const createWorkers = (_connection: Redis): Worker[] => []
