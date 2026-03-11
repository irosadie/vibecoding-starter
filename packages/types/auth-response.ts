export type AccountRole = "USER" | "CREATOR" | "ADMIN"

export type AccountStatus = "ACTIVE" | "SUSPENDED"

export type AuthUserResponse = {
  id: string
  email: string
  name: string
  role: AccountRole
  status: AccountStatus
  photo?: string | null
}

export type AuthTokensResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type AuthLoginResponse = {
  user: AuthUserResponse
  tokens: AuthTokensResponse
}

export type AuthRegisterResponse = {
  user: AuthUserResponse
}
