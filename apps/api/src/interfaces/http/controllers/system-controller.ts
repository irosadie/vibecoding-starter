import type { Context } from "hono"
import type { SystemService } from "../../../application/services/system-service.js"
import { successResponse } from "../utils/response.js"

export class SystemController {
  constructor(private readonly service: SystemService) {}

  root = async (context: Context) => {
    const data = this.service.getAppInfo()

    return successResponse(context, {
      message: "Application info loaded",
      data,
    })
  }

  health = async (context: Context) => {
    const data = this.service.getHealth()

    return successResponse(context, {
      message: "Health status loaded",
      data,
    })
  }
}
