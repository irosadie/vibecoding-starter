import type { AuthSession } from "@/domain/entities/AuthSession"
import type { User } from "@/domain/entities/User"
import type {
  CreateAuthSessionInput,
  CreateUserInput,
  IAuthRepository,
} from "@/domain/repositories/IAuthRepository"
import { prisma } from "@/infrastructure/config/database"
import type {
  AuthSession as PrismaAuthSession,
  User as PrismaUser,
} from "@prisma/client"

export class PrismaAuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({
      where: { email },
    })

    return row ? toUserEntity(row) : null
  }

  async findUserById(id: string): Promise<User | null> {
    const row = await prisma.user.findUnique({
      where: { id },
    })

    return row ? toUserEntity(row) : null
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const row = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
        role: input.role ?? "USER",
        status: input.status ?? "ACTIVE",
        photo: input.photo ?? null,
      },
    })

    return toUserEntity(row)
  }

  async createAuthSession(input: CreateAuthSessionInput): Promise<AuthSession> {
    const row = await prisma.authSession.create({
      data: input,
    })

    return toAuthSessionEntity(row)
  }

  async findAuthSessionByIdAndUserId(
    sessionId: string,
    userId: string,
  ): Promise<AuthSession | null> {
    const row = await prisma.authSession.findFirst({
      where: {
        id: sessionId,
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    return row ? toAuthSessionEntity(row) : null
  }

  async deleteAuthSessionByIdAndUserId(
    sessionId: string,
    userId: string,
  ): Promise<void> {
    await prisma.authSession.deleteMany({
      where: {
        id: sessionId,
        userId,
      },
    })
  }

  async deleteAuthSessionsByUserId(userId: string): Promise<void> {
    await prisma.authSession.deleteMany({
      where: { userId },
    })
  }
}

function toUserEntity(row: PrismaUser): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    name: row.name,
    role: row.role,
    status: row.status,
    photo: row.photo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toAuthSessionEntity(row: PrismaAuthSession): AuthSession {
  return {
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  }
}
