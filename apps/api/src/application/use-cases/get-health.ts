import type { HealthDto } from "../dtos/system.js"

export class GetHealthUseCase {
  execute(): HealthDto {
    return {
      status: "ok",
      service: "vibecoding-starter-api",
      timestamp: new Date().toISOString(),
    }
  }
}
