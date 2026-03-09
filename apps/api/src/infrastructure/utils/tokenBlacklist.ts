import jwt from "jsonwebtoken"

/**
 * Token Blacklist
 * In-memory store for invalidated tokens (logout)
 *
 * Stores token JTI or full token with its expiration time.
 * Automatically cleans up expired entries to prevent memory leaks.
 *
 * For production with multiple instances, replace with Redis.
 */

// Map<token, expiresAt (unix timestamp in seconds)>
const blacklistedTokens = new Map<string, number>()

// Cleanup interval: every 15 minutes
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000

/**
 * Add a token to the blacklist
 * Token will be stored until its natural expiration time
 */
export function blacklistToken(token: string): void {
  try {
    // Decode token to get expiration time (without verifying - it's already verified by middleware)
    const decoded = jwt.decode(token) as { exp?: number } | null

    if (decoded?.exp) {
      blacklistedTokens.set(token, decoded.exp)
    } else {
      // If no expiration, blacklist for 24 hours
      const fallbackExp = Math.floor(Date.now() / 1000) + 86400
      blacklistedTokens.set(token, fallbackExp)
    }
  } catch {
    // If decode fails, blacklist for 24 hours anyway
    const fallbackExp = Math.floor(Date.now() / 1000) + 86400
    blacklistedTokens.set(token, fallbackExp)
  }
}

/**
 * Check if a token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
  return blacklistedTokens.has(token)
}

/**
 * Remove expired tokens from the blacklist
 * Called periodically to prevent memory leaks
 */
function cleanupExpiredTokens(): void {
  const now = Math.floor(Date.now() / 1000)
  let cleaned = 0

  for (const [token, expiresAt] of blacklistedTokens.entries()) {
    if (expiresAt < now) {
      blacklistedTokens.delete(token)
      cleaned++
    }
  }

  if (cleaned > 0) {
    // Silent cleanup - no console logging in production
  }
}

/**
 * Get count of blacklisted tokens (for monitoring)
 */
export function getBlacklistSize(): number {
  return blacklistedTokens.size
}

// Start periodic cleanup
setInterval(cleanupExpiredTokens, CLEANUP_INTERVAL_MS)

// Also clean up on first import
cleanupExpiredTokens()
