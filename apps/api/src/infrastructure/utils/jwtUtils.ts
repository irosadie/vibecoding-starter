import type {
  JwtPayload,
  TokenPair,
  TokenService,
} from "@/domain/services/TokenService"
import jwt from "jsonwebtoken"

// Re-export for convenience
export type { JwtPayload, TokenPair }

interface DecodedToken {
  exp?: number
  iat?: number
  iss?: string
  aud?: string
  [key: string]: unknown
}

const ACCESS_TOKEN_EXPIRES = "1h" // 1 hour
const REFRESH_TOKEN_EXPIRES = "7d" // 7 days

function getRequiredEnv(name: "JWT_SECRET"): string {
  const value = process.env[name]

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getJwtSecret(): string {
  return getRequiredEnv("JWT_SECRET")
}

function getRefreshSecret(): string {
  const refreshSecret = process.env.JWT_REFRESH_SECRET?.trim()
  if (refreshSecret) {
    return refreshSecret
  }

  // Fallback to JWT_SECRET if a dedicated refresh secret is not set.
  return getJwtSecret()
}

export function validateJwtConfig(): void {
  getJwtSecret()
}

/**
 * JWT Token Service Implementation
 * Implements TokenService interface from domain layer
 */
export class JwtTokenService implements TokenService {
  /**
   * Generate access and refresh token pair
   */
  generateTokenPair(payload: JwtPayload): TokenPair {
    const accessToken = jwt.sign(payload, getJwtSecret(), {
      expiresIn: ACCESS_TOKEN_EXPIRES,
      issuer: "exam-app-api",
      audience: "exam-app-client",
    })

    const refreshToken = jwt.sign(payload, getRefreshSecret(), {
      expiresIn: REFRESH_TOKEN_EXPIRES,
      issuer: "exam-app-api",
      audience: "exam-app-client",
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
    }
  }

  /**
   * Generate only access token
   */
  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, getJwtSecret(), {
      expiresIn: ACCESS_TOKEN_EXPIRES,
      issuer: "exam-app-api",
      audience: "exam-app-client",
    })
  }

  /**
   * Verify and decode access token
   */
  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, getJwtSecret()) as JwtPayload
  }

  /**
   * Verify refresh token and return payload
   */
  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, getRefreshSecret()) as JwtPayload
  }
}

// Export singleton instance for convenience
export const jwtTokenService = new JwtTokenService()

// Legacy exports for backward compatibility
export function generateTokenPair(payload: JwtPayload): TokenPair {
  return jwtTokenService.generateTokenPair(payload)
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwtTokenService.generateAccessToken(payload)
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwtTokenService.verifyAccessToken(token)
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwtTokenService.verifyRefreshToken(token)
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): DecodedToken | null {
  const decoded = jwt.decode(token)
  return decoded as DecodedToken | null
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as DecodedToken | null
    if (!decoded || !decoded.exp) {
      return true
    }
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch {
    return true
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as DecodedToken | null
    if (!decoded || !decoded.exp) {
      return null
    }
    return new Date(decoded.exp * 1000)
  } catch {
    return null
  }
}
