import { createHash, randomUUID } from "node:crypto"
import type {
  AuthCurrentUserDto,
  AuthLoginDto,
  AuthRegisterDto,
  AuthUserDto,
} from "@/application/dtos/auth"
import type {
  LoginPayload,
  RegisterPayload,
} from "@/application/validators/auth.schemas"
import type { User } from "@/domain/entities/User"
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository"
import type { TokenService } from "@/domain/services/TokenService"
import { getCurrentUser } from "@/domain/use-cases/get-current-user"
import { loginUser } from "@/domain/use-cases/login-user"
import { logoutUser } from "@/domain/use-cases/logout-user"
import { registerUser } from "@/domain/use-cases/register-user"
import { blacklistToken } from "@/infrastructure/utils/tokenBlacklist"

const REFRESH_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

type AuthServiceDependencies = {
  repository: IAuthRepository
  tokenService: TokenService
  hashPassword: (password: string) => string
  verifyPassword: (password: string, passwordHash: string) => boolean
}

type LogoutPayload = {
  userId: string
  sessionId: string | null
  accessToken: string
}

type CurrentUserPayload = {
  userId: string
  sessionId: string | null
}

export class AuthService {
  constructor(private readonly dependencies: AuthServiceDependencies) {}

  async register(payload: RegisterPayload): Promise<AuthRegisterDto> {
    const user = await registerUser(this.dependencies.repository, {
      ...payload,
      hashPassword: this.dependencies.hashPassword,
    })

    return {
      user: toUserDto(user),
    }
  }

  async login(payload: LoginPayload): Promise<AuthLoginDto> {
    const user = await loginUser(this.dependencies.repository, {
      ...payload,
      verifyPassword: this.dependencies.verifyPassword,
    })

    const sessionId = randomUUID()
    const tokens = this.dependencies.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      type: toJwtType(user.role),
      status: user.status,
      sessionId,
    })

    await this.dependencies.repository.deleteAuthSessionsByUserId(user.id)
    await this.dependencies.repository.createAuthSession({
      id: sessionId,
      userId: user.id,
      tokenHash: hashSessionToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_SESSION_TTL_MS),
    })

    return {
      user: toUserDto(user),
      tokens,
    }
  }

  async logout(payload: LogoutPayload): Promise<void> {
    await logoutUser(this.dependencies.repository, payload)
    blacklistToken(payload.accessToken)
  }

  async getCurrentUser(
    payload: CurrentUserPayload,
  ): Promise<AuthCurrentUserDto> {
    const result = await getCurrentUser(this.dependencies.repository, payload)

    return {
      user: toUserDto(result.user),
      session: {
        expiresAt: result.session?.expiresAt.toISOString() ?? null,
      },
    }
  }
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

function toJwtType(role: User["role"]): "admin" | "creator" | "user" {
  if (role === "ADMIN") {
    return "admin"
  }

  if (role === "CREATOR") {
    return "creator"
  }

  return "user"
}

function toUserDto(user: User): AuthUserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    photo: user.photo,
  }
}
