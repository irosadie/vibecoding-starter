import type { AppInfoDto, HealthDto } from "../dtos/system.js"
import type { GetAppInfoUseCase } from "../use-cases/get-app-info.js"
import type { GetHealthUseCase } from "../use-cases/get-health.js"

type SystemServiceDependencies = {
  getAppInfoUseCase: GetAppInfoUseCase
  getHealthUseCase: GetHealthUseCase
}

export class SystemService {
  constructor(private readonly dependencies: SystemServiceDependencies) {}

  getAppInfo(): AppInfoDto {
    return this.dependencies.getAppInfoUseCase.execute()
  }

  getHealth(): HealthDto {
    return this.dependencies.getHealthUseCase.execute()
  }
}
