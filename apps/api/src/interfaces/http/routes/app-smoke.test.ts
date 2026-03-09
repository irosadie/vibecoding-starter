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

describe("app smoke", () => {
  it("serves the baseline system routes through the HTTP stack", async () => {
    const app = createApp({
      getAppInfoUseCase: new GetAppInfoUseCase(),
      getHealthUseCase: new GetHealthUseCase(),
    })

    const appInfoResponse = await app.request("http://localhost/")
    const appInfoBody = (await appInfoResponse.json()) as AppInfoResponse

    expect(appInfoResponse.status).toBe(200)
    expect(appInfoBody.success).toBe(true)
    expect(appInfoBody.data.name).toBe("vibecoding-starter-api")
    expect(appInfoBody.data.message).toBe(
      "Hono clean architecture API scaffold is ready",
    )

    const healthResponse = await app.request("http://localhost/health")
    const healthBody = (await healthResponse.json()) as HealthResponse

    expect(healthResponse.status).toBe(200)
    expect(healthBody.success).toBe(true)
    expect(healthBody.data.status).toBe("ok")
    expect(healthBody.data.service).toBe("vibecoding-starter-api")
  })
})
