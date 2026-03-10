import type { UserRole, UserStatus } from "@/domain/entities/User"

export type AuthUserDto = {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  photo: string | null
}

export type AuthTokensDto = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type AuthRegisterDto = {
  user: AuthUserDto
}

export type AuthLoginDto = {
  user: AuthUserDto
  tokens: AuthTokensDto
}

export type AuthSessionDto = {
  expiresAt: string | null
}

export type AuthCurrentUserDto = {
  user: AuthUserDto
  session: AuthSessionDto
}
