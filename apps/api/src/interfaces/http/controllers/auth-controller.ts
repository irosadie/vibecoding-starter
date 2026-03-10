import type { AuthService } from "@/application/services/auth-service"
import type {
  LoginPayload,
  RegisterPayload,
} from "@/application/validators/auth.schemas"
import { getAuthSession } from "@/interfaces/http/middleware/auth-session"
import { successResponse } from "@/interfaces/http/utils/response"
import type { Context } from "hono"

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (c: Context) => {
    const payload = (await c.req.json()) as RegisterPayload
    const result = await this.authService.register(payload)

    return successResponse(
      c,
      {
        message: "Register success",
        data: result,
      },
      201,
    )
  }

  login = async (c: Context) => {
    const payload = (await c.req.json()) as LoginPayload
    const result = await this.authService.login(payload)

    return successResponse(c, {
      message: "Login success",
      data: result,
    })
  }

  logout = async (c: Context) => {
    const session = getAuthSession(c)
    await this.authService.logout({
      userId: session.userId,
      sessionId: session.sessionId,
      accessToken: session.accessToken,
    })

    return successResponse(c, {
      message: "Logout success",
      data: { success: true },
    })
  }

  me = async (c: Context) => {
    const session = getAuthSession(c)
    const result = await this.authService.getCurrentUser({
      userId: session.userId,
      sessionId: session.sessionId,
    })

    return successResponse(c, {
      message: "Current user loaded",
      data: result,
    })
  }
}
