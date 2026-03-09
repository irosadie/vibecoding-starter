export type WorkerSummary = {
  registeredQueues: number
  mode: "idle" | "active"
  message: string
}

export const getWorkerSummary = (registeredQueues: number): WorkerSummary => {
  if (registeredQueues === 0) {
    return {
      registeredQueues,
      mode: "idle",
      message: "Worker scaffold ready. No queues registered yet.",
    }
  }

  return {
    registeredQueues,
    mode: "active",
    message: `Worker scaffold ready. Registered queues: ${registeredQueues}.`,
  }
}
