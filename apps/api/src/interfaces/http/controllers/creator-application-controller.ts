import type { CreatorApplicationService } from "@/application/services/creator-application-service"
import {
  approveCreatorApplicationSchema,
  creatorApplicationIdParamSchema,
  listCreatorApplicationsQuerySchema,
  rejectCreatorApplicationSchema,
  submitCreatorApplicationFormSchema,
} from "@/application/validators/creator-application.schemas"
import { getAuthSession } from "@/interfaces/http/middleware/auth-session"
import { successResponse } from "@/interfaces/http/utils/response"
import type { Context } from "hono"

export class CreatorApplicationController {
  constructor(
    private readonly creatorApplicationService: CreatorApplicationService,
  ) {}

  submit = async (c: Context) => {
    const formData = await c.req.formData()
    const payload = submitCreatorApplicationFormSchema.parse({
      payout_account_name: formData.get("payout_account_name"),
      payout_bank_name: formData.get("payout_bank_name"),
      payout_account_number: formData.get("payout_account_number"),
      ktp_file: formData.get("ktp_file"),
    })
    const session = getAuthSession(c)
    const file = payload.ktp_file
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const result = await this.creatorApplicationService.submit({
      ...payload,
      userId: session.userId,
      ktpFileBuffer: fileBuffer,
      ktpFilename: file.name || "ktp-file",
      ktpMimeType: file.type || "application/octet-stream",
    })

    return successResponse(
      c,
      {
        message: "Creator application submitted",
        data: result,
      },
      201,
    )
  }

  me = async (c: Context) => {
    const session = getAuthSession(c)
    const result = await this.creatorApplicationService.getMy(session.userId)

    return successResponse(c, {
      message: "Creator application status loaded",
      data: {
        application: result,
      },
    })
  }

  list = async (c: Context) => {
    const query = listCreatorApplicationsQuerySchema.parse(c.req.query())
    const result = await this.creatorApplicationService.listForAdmin(query)

    return successResponse(c, {
      message: "Creator applications loaded",
      data: result.list,
      meta: {
        total: result.total,
        currentPage: result.page,
        perPage: result.perPage,
        lastPage: Math.max(1, Math.ceil(result.total / result.perPage)),
      },
    })
  }

  approve = async (c: Context) => {
    const params = creatorApplicationIdParamSchema.parse(c.req.param())
    const payload = approveCreatorApplicationSchema.parse(await c.req.json())
    const session = getAuthSession(c)
    const result = await this.creatorApplicationService.approve({
      ...payload,
      applicationId: params.id,
      reviewedBy: session.userId,
    })

    return successResponse(c, {
      message: "Creator application approved",
      data: result,
    })
  }

  reject = async (c: Context) => {
    const params = creatorApplicationIdParamSchema.parse(c.req.param())
    const payload = rejectCreatorApplicationSchema.parse(await c.req.json())
    const session = getAuthSession(c)
    const result = await this.creatorApplicationService.reject({
      ...payload,
      applicationId: params.id,
      reviewedBy: session.userId,
    })

    return successResponse(c, {
      message: "Creator application rejected",
      data: result,
    })
  }
}
