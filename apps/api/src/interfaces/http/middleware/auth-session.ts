import { DomainError } from "@/domain/errors/DomainError"
import type { JwtPayload } from "@/domain/services/TokenService"
import { verifyAccessToken } from "@/infrastructure/utils/jwtUtils"
import { isTokenBlacklisted } from "@/infrastructure/utils/tokenBlacklist"
import type { Context } from "hono"

const AUTH_CONTEXT_KEY = "authSession"

const JWT_USER_TYPES: JwtPayload["type"][] = ["admin", "creator", "user"]
const USER_STATUSES: JwtPayload["status"][] = ["ACTIVE", "SUSPENDED"]

export type AuthSessionContext = {
  userId: string
  email: string
  userType: JwtPayload["type"]
  status: JwtPayload["status"]
  sessionId: string | null
  accessToken: string
}

export async function authSessionMiddleware(
  c: Context,
  next: () => Promise<void>,
) {
  const authHeader = c.req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw DomainError.unauthorized("Authorization token required")
  }

  const accessToken = authHeader.substring(7).trim()

  if (!accessToken) {
    throw DomainError.unauthorized("Authorization token required")
  }

  if (isTokenBlacklisted(accessToken)) {
    throw DomainError.invalidToken("Token has been revoked")
  }

  let payload: JwtPayload
  try {
    payload = verifyAccessToken(accessToken)
  } catch {
    throw DomainError.invalidToken("Invalid or expired token")
  }

  if (!isJwtPayload(payload)) {
    throw DomainError.invalidToken("Invalid token payload")
  }

  if (payload.status === "SUSPENDED") {
    throw DomainError.forbidden("Account is suspended")
  }

  c.set(AUTH_CONTEXT_KEY, {
    userId: payload.id,
    email: payload.email,
    userType: payload.type,
    status: payload.status,
    sessionId: payload.sessionId ?? null,
    accessToken,
  } satisfies AuthSessionContext)

  await next()
}

export function requireRoles(allowedRoles: JwtPayload["type"][]) {
  return async (c: Context, next: () => Promise<void>) => {
    const session = getAuthSession(c)
    if (!allowedRoles.includes(session.userType)) {
      throw DomainError.forbidden("Insufficient permissions")
    }

    await next()
  }
}

export function getAuthSession(c: Context): AuthSessionContext {
  const session = c.get(AUTH_CONTEXT_KEY) as AuthSessionContext | undefined

  if (!session) {
    throw DomainError.unauthorized("Authentication required")
  }

  return session
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (!value || typeof value !== "object") {
    return false
  }

  if (!("id" in value) || typeof value.id !== "string") {
    return false
  }

  if (!("email" in value) || typeof value.email !== "string") {
    return false
  }

  if (
    !("type" in value) ||
    typeof value.type !== "string" ||
    !JWT_USER_TYPES.includes(value.type as JwtPayload["type"])
  ) {
    return false
  }

  if (
    !("status" in value) ||
    typeof value.status !== "string" ||
    !USER_STATUSES.includes(value.status as JwtPayload["status"])
  ) {
    return false
  }

  if (
    "sessionId" in value &&
    value.sessionId !== null &&
    typeof value.sessionId !== "string"
  ) {
    return false
  }

  return true
}
