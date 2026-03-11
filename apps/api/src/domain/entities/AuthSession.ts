export type AuthSession = {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
  createdAt: Date
}
