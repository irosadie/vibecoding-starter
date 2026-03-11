import {
  type JwtPayload,
  verifyAccessToken,
} from "@/infrastructure/utils/jwtUtils"
import { isTokenBlacklisted } from "@/infrastructure/utils/tokenBlacklist"
import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"
import jwt from "jsonwebtoken"

export type { JwtPayload }

export async function jwtMiddleware(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header("Authorization")

  if (!authHeader) {
    throw new HTTPException(401, { message: "Authorization header required" })
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, {
      message: 'Authorization header must start with "Bearer "',
    })
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  if (!token || token.trim() === "") {
    throw new HTTPException(401, { message: "Token cannot be empty" })
  }

  // Check if token has been blacklisted (user logged out)
  if (isTokenBlacklisted(token)) {
    throw new HTTPException(401, {
      message: "Token has been revoked. Please login again.",
    })
  }

  try {
    const payload = verifyAccessToken(token) as JwtPayload

    // Validate payload structure
    if (!payload.id || !payload.email || !payload.type || !payload.status) {
      throw new HTTPException(401, {
        message: "Invalid token payload: missing required fields",
      })
    }

    // Validate user type
    if (!["admin", "creator", "user"].includes(payload.type)) {
      throw new HTTPException(401, {
        message: "Invalid token payload: invalid user type",
      })
    }

    // Add user data to context based on type
    c.set("userId", payload.id)
    c.set("userEmail", payload.email)
    c.set("userType", payload.type)
    c.set("userStatus", payload.status)
    c.set("sessionId", payload.sessionId)

    if (payload.type === "creator") {
      c.set("creatorId", payload.id)
    }

    await next()
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw new HTTPException(401, {
        message: "Token has expired. Please login again or refresh your token.",
      })
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new HTTPException(401, {
        message: `Invalid token format: ${error.message}`,
      })
    }

    if (error instanceof jwt.NotBeforeError) {
      throw new HTTPException(401, { message: "Token not active yet" })
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    throw new HTTPException(401, {
      message: `Authentication failed: ${errorMessage}`,
    })
  }
}
