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

describe("auth routes", () => {
  it("validates register payload", async () => {
    const app = createApp({
      getAppInfoUseCase: new GetAppInfoUseCase(),
      getHealthUseCase: new GetHealthUseCase(),
    })

    const response = await app.request(
      "http://localhost/api/v1/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      },
    )
    const body = (await response.json()) as ErrorResponse

    expect(response.status).toBe(422)
    expect(body.success).toBe(false)
    expect(body.errors[0]?.code).toBe("VALIDATION_ERROR")
  })

  it("requires authorization token for current user endpoint", async () => {
    const app = createApp({
      getAppInfoUseCase: new GetAppInfoUseCase(),
      getHealthUseCase: new GetHealthUseCase(),
    })

    const response = await app.request("http://localhost/api/v1/auth/me")
    const body = (await response.json()) as ErrorResponse

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.errors[0]?.code).toBe("UNAUTHORIZED")
  })
})
