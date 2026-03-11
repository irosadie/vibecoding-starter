import { AuthService } from "@/application/services/auth-service"
import {
  loginSchema,
  registerSchema,
} from "@/application/validators/auth.schemas"
import { PrismaAuthRepository } from "@/infrastructure/database/PrismaAuthRepository"
import { jwtTokenService } from "@/infrastructure/utils/jwtUtils"
import {
  hashPassword,
  verifyPassword,
} from "@/infrastructure/utils/passwordUtils"
import { AuthController } from "@/interfaces/http/controllers/auth-controller"
import {
  authSessionMiddleware,
  requireRoles,
} from "@/interfaces/http/middleware/auth-session"
import { zValidator } from "@/interfaces/http/utils/validation"
import { Hono } from "hono"

const authRepository = new PrismaAuthRepository()
const authService = new AuthService({
  repository: authRepository,
  tokenService: jwtTokenService,
  hashPassword,
  verifyPassword,
})
const authController = new AuthController(authService)

export const authRoutes = new Hono()
  .post(
    "/register",
    zValidator("json", registerSchema),
    authController.register,
  )
  .post("/login", zValidator("json", loginSchema), authController.login)
  .post(
    "/logout",
    authSessionMiddleware,
    requireRoles(["admin", "creator", "user"]),
    authController.logout,
  )
  .get(
    "/me",
    authSessionMiddleware,
    requireRoles(["admin", "creator", "user"]),
    authController.me,
  )
