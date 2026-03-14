import { GetAppInfoUseCase } from "@/application/use-cases/get-app-info"
import { GetHealthUseCase } from "@/application/use-cases/get-health"
import { createApp } from "@/interfaces/http/create-app"
import { describe, expect, it } from "vitest"

type ErrorResponse = {
  success: false
  errors: Array<{
    code: string
    message: string
  }>
}

describe("exam authoring review routes", () => {
  it("requires authorization token for creator exam draft list endpoint", async () => {
    const app = createApp({
      getAppInfoUseCase: new GetAppInfoUseCase(),
      getHealthUseCase: new GetHealthUseCase(),
    })

    const response = await app.request("http://localhost/api/v1/creator/exams")
    const body = (await response.json()) as ErrorResponse

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.errors[0]?.code).toBe("UNAUTHORIZED")
  })

  it("requires authorization token for admin exam review queue endpoint", async () => {
    const app = createApp({
      getAppInfoUseCase: new GetAppInfoUseCase(),
      getHealthUseCase: new GetHealthUseCase(),
    })

    const response = await app.request("http://localhost/api/v1/admin/exam-reviews")
    const body = (await response.json()) as ErrorResponse

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.errors[0]?.code).toBe("UNAUTHORIZED")
  })
})
