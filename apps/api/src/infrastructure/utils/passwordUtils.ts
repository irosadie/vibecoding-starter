import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

const PASSWORD_SALT_SIZE = 16
const PASSWORD_KEY_LENGTH = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(PASSWORD_SALT_SIZE).toString("hex")
  const derivedKey = scryptSync(password, salt, PASSWORD_KEY_LENGTH)

  return `${salt}:${derivedKey.toString("hex")}`
}

export function verifyPassword(
  password: string,
  passwordHash: string,
): boolean {
  const [salt, hash] = passwordHash.split(":")

  if (!salt || !hash) {
    return false
  }

  const source = Buffer.from(hash, "hex")
  const derivedKey = scryptSync(password, salt, PASSWORD_KEY_LENGTH)

  if (source.length !== derivedKey.length) {
    return false
  }

  return timingSafeEqual(source, derivedKey)
}
