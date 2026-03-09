import { describe, expect, it } from "vitest"
import { getWorkerSummary } from "./get-worker-summary.js"

describe("getWorkerSummary", () => {
  it("returns idle mode when no queues are registered", () => {
    expect(getWorkerSummary(0)).toEqual({
      registeredQueues: 0,
      mode: "idle",
      message: "Worker scaffold ready. No queues registered yet.",
    })
  })

  it("returns active mode when queues are registered", () => {
    expect(getWorkerSummary(2)).toEqual({
      registeredQueues: 2,
      mode: "active",
      message: "Worker scaffold ready. Registered queues: 2.",
    })
  })
})
