/**
 * Token Service Interface
 * Defines contract for JWT token operations
 */

export interface JwtPayload {
  id: string
  email: string
  type: "admin" | "vendor" | "driver" | "user"
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface TokenService {
  generateTokenPair(payload: JwtPayload): TokenPair
  generateAccessToken(payload: JwtPayload): string
  verifyAccessToken(token: string): JwtPayload
  verifyRefreshToken(token: string): JwtPayload
}
