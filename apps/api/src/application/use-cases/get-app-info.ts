import type { AppInfoDto } from "../dtos/system.js"

export class GetAppInfoUseCase {
  execute(): AppInfoDto {
    return {
      name: "vibecoding-starter-api",
      message: "Hono clean architecture API scaffold is ready",
    }
  }
}
