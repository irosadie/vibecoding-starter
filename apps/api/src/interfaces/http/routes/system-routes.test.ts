import { describe, expect, it } from "vitest"
import type { AppInfoDto, HealthDto } from "../../../application/dtos/system.js"
import { GetAppInfoUseCase } from "../../../application/use-cases/get-app-info.js"
import { GetHealthUseCase } from "../../../application/use-cases/get-health.js"
import { createApp } from "../create-app.js"

type AppInfoResponse = {
  success: true
  message: string
  data: AppInfoDto
}

type HealthResponse = {
  success: true
  message: string
  data: HealthDto
}

describe("system routes", () => {
  it("returns application info through the controller stack", async () => {
    const app = createApp({
      getAppInfoUseCase: new GetAppInfoUseCase(),
      getHealthUseCase: new GetHealthUseCase(),
    })

    const response = await app.request("http://localhost/")
    const body = (await response.json()) as AppInfoResponse

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      message: "Application info loaded",
      data: {
        name: "vibecoding-starter-api",
        message: "Hono clean architecture API scaffold is ready",
      } satisfies AppInfoDto,
    })
  })

  it("returns health status through the controller stack", async () => {
    const app = createApp({
      getAppInfoUseCase: new GetAppInfoUseCase(),
      getHealthUseCase: new GetHealthUseCase(),
    })

    const response = await app.request("http://localhost/health")
    const body = (await response.json()) as HealthResponse

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.message).toBe("Health status loaded")
    expect(body.data.status).toBe("ok")
    expect(body.data.service).toBe("vibecoding-starter-api")
    expect(body.data.timestamp).toEqual(expect.any(String) satisfies unknown)
    expect(body.data as HealthDto).toMatchObject({
      status: "ok",
      service: "vibecoding-starter-api",
    })
  })
})
