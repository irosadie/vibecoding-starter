import type { AuthSession } from "@/domain/entities/AuthSession"
import type { User, UserRole, UserStatus } from "@/domain/entities/User"

export type CreateUserInput = {
  email: string
  passwordHash: string
  name: string
  role?: UserRole
  status?: UserStatus
  photo?: string | null
}

export type CreateAuthSessionInput = {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
}

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>
  findUserById(id: string): Promise<User | null>
  createUser(input: CreateUserInput): Promise<User>
  createAuthSession(input: CreateAuthSessionInput): Promise<AuthSession>
  findAuthSessionByIdAndUserId(
    sessionId: string,
    userId: string,
  ): Promise<AuthSession | null>
  deleteAuthSessionByIdAndUserId(
    sessionId: string,
    userId: string,
  ): Promise<void>
  deleteAuthSessionsByUserId(userId: string): Promise<void>
}
