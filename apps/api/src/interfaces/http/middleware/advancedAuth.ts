import { verifyAccessToken } from "@/infrastructure/utils/jwtUtils"
import { isTokenBlacklisted } from "@/infrastructure/utils/tokenBlacklist"
import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"

/**
 * JWT middleware with better error messages
 * Note: Token refresh should be handled by client calling /auth/refresh endpoint
 */
export async function jwtWithRefreshMiddleware(
  c: Context,
  next: () => Promise<void>,
) {
  const authHeader = c.req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Authorization token required" })
  }

  const accessToken = authHeader.substring(7) // Remove 'Bearer ' prefix

  // Check if token has been blacklisted (user logged out)
  if (isTokenBlacklisted(accessToken)) {
    throw new HTTPException(401, {
      message: "Token has been revoked. Please login again.",
    })
  }

  try {
    const payload = verifyAccessToken(accessToken)

    // Validate payload structure
    if (!payload.id || !payload.email || !payload.type) {
      throw new HTTPException(401, {
        message: "Invalid token payload: missing required fields",
      })
    }

    // Add user data to context based on type
    c.set("userId", payload.id)
    c.set("userEmail", payload.email)
    c.set("userType", payload.type)

    if (payload.type === "creator") {
      c.set("creatorId", payload.id)
    }

    await next()
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }

    // Handle JWT specific errors with better messages
    const errorMessage =
      error instanceof Error ? error.message : "Invalid or expired token"

    if (errorMessage.includes("expired")) {
      throw new HTTPException(401, {
        message: "Token has expired. Please refresh your token or login again.",
      })
    }

    if (errorMessage.includes("invalid")) {
      throw new HTTPException(401, { message: "Invalid token format" })
    }

    throw new HTTPException(401, { message: "Authentication failed" })
  }
}

/**
 * Optional middleware that only checks for valid token but doesn't require it
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
export async function optionalJwtMiddleware(
  c: Context,
  next: () => Promise<void>,
) {
  const authHeader = c.req.header("Authorization")

  if (authHeader?.startsWith("Bearer ")) {
    const accessToken = authHeader.substring(7)

    try {
      const payload = verifyAccessToken(accessToken)

      // Add user data to context
      c.set("userId", payload.id)
      c.set("userEmail", payload.email)
      c.set("userType", payload.type)
      c.set("isAuthenticated", true)

      if (payload.type === "creator") {
        c.set("creatorId", payload.id)
      }
    } catch {
      // Invalid token, but we don't throw error - just mark as unauthenticated
      c.set("isAuthenticated", false)
    }
  } else {
    c.set("isAuthenticated", false)
  }

  await next()
}

/**
 * Middleware specifically for company users only
 */
export async function creatorOnlyMiddleware(
  c: Context,
  next: () => Promise<void>,
) {
  const userType = c.get("userType") as string

  if (!userType) {
    throw new HTTPException(401, { message: "Authentication required" })
  }

  if (userType !== "creator") {
    throw new HTTPException(403, {
      message: "Access denied. Creator users only.",
    })
  }

  await next()
}

export const vendorOnlyMiddleware = creatorOnlyMiddleware

/**
 * Middleware for driver users only
 */
export async function driverOnlyMiddleware(
  c: Context,
  next: () => Promise<void>,
) {
  const userType = c.get("userType") as string

  if (!userType) {
    throw new HTTPException(401, { message: "Authentication required" })
  }

  if (userType !== "driver") {
    throw new HTTPException(403, {
      message: "Access denied. Driver users only.",
    })
  }

  await next()
}

/** * Middleware for admin users only
 */
export async function adminOnlyMiddleware(
  c: Context,
  next: () => Promise<void>,
) {
  const userType = c.get("userType") as string

  if (!userType) {
    throw new HTTPException(401, { message: "Authentication required" })
  }

  if (userType !== "admin") {
    throw new HTTPException(403, {
      message: "Access denied. Admin users only.",
    })
  }

  await next()
}

/** * Middleware for regular users only
 */
export async function userOnlyMiddleware(
  c: Context,
  next: () => Promise<void>,
) {
  const userType = c.get("userType") as string

  if (!userType) {
    throw new HTTPException(401, { message: "Authentication required" })
  }

  if (userType !== "user") {
    throw new HTTPException(403, {
      message: "Access denied. Regular users only.",
    })
  }

  await next()
}
