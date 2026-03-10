import { randomUUID } from "node:crypto"
import type { AuthSession } from "@/domain/entities/AuthSession"
import type { User } from "@/domain/entities/User"
import type {
  CreateAuthSessionInput,
  CreateUserInput,
  IAuthRepository,
} from "@/domain/repositories/IAuthRepository"
import { beforeEach, describe, expect, it } from "vitest"
import { getCurrentUser } from "./get-current-user"
import { loginUser } from "./login-user"
import { logoutUser } from "./logout-user"
import { registerUser } from "./register-user"

class InMemoryAuthRepository implements IAuthRepository {
  private users = new Map<string, User>()
  private sessions = new Map<string, AuthSession>()

  async findUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user
      }
    }

    return null
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const user: User = {
      id: randomUUID(),
      email: input.email,
      passwordHash: input.passwordHash,
      name: input.name,
      role: input.role ?? "USER",
      status: input.status ?? "ACTIVE",
      photo: input.photo ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.users.set(user.id, user)
    return user
  }

  async createAuthSession(input: CreateAuthSessionInput): Promise<AuthSession> {
    const session: AuthSession = {
      id: input.id,
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      createdAt: new Date(),
    }

    this.sessions.set(session.id, session)
    return session
  }

  async findAuthSessionByIdAndUserId(
    sessionId: string,
    userId: string,
  ): Promise<AuthSession | null> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return null
    }

    if (session.userId !== userId) {
      return null
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      return null
    }

    return session
  }

  async deleteAuthSessionByIdAndUserId(
    sessionId: string,
    userId: string,
  ): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session || session.userId !== userId) {
      return
    }

    this.sessions.delete(sessionId)
  }

  async deleteAuthSessionsByUserId(userId: string): Promise<void> {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId)
      }
    }
  }
}

describe("auth use cases", () => {
  let repository: InMemoryAuthRepository

  beforeEach(() => {
    repository = new InMemoryAuthRepository()
  })

  it("registers a new user with normalized email", async () => {
    const user = await registerUser(repository, {
      name: "Baim",
      email: "BAIM@EXAMPLE.COM",
      password: "password123",
      hashPassword: (password) => `hashed:${password}`,
    })

    expect(user.email).toBe("baim@example.com")
    expect(user.passwordHash).toBe("hashed:password123")
    expect(user.role).toBe("USER")
    expect(user.status).toBe("ACTIVE")
  })

  it("rejects duplicate email on register", async () => {
    await registerUser(repository, {
      name: "Baim",
      email: "baim@example.com",
      password: "password123",
      hashPassword: (password) => `hashed:${password}`,
    })

    await expect(
      registerUser(repository, {
        name: "Baim 2",
        email: "baim@example.com",
        password: "password123",
        hashPassword: (password) => `hashed:${password}`,
      }),
    ).rejects.toMatchObject({
      code: "DUPLICATE_EMAIL",
      status: 409,
    })
  })

  it("rejects invalid password on login", async () => {
    await registerUser(repository, {
      name: "Baim",
      email: "baim@example.com",
      password: "password123",
      hashPassword: (password) => `hashed:${password}`,
    })

    await expect(
      loginUser(repository, {
        email: "baim@example.com",
        password: "wrong-password",
        verifyPassword: (password, passwordHash) =>
          `hashed:${password}` === passwordHash,
      }),
    ).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      status: 401,
    })
  })

  it("rejects suspended account on login", async () => {
    await repository.createUser({
      name: "Suspended User",
      email: "suspended@example.com",
      passwordHash: "hashed:password123",
      role: "USER",
      status: "SUSPENDED",
      photo: null,
    })

    await expect(
      loginUser(repository, {
        email: "suspended@example.com",
        password: "password123",
        verifyPassword: (password, passwordHash) =>
          `hashed:${password}` === passwordHash,
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    })
  })

  it("returns current user and active session", async () => {
    const user = await repository.createUser({
      name: "Baim",
      email: "baim@example.com",
      passwordHash: "hashed:password123",
      role: "USER",
      status: "ACTIVE",
      photo: null,
    })
    const session = await repository.createAuthSession({
      id: randomUUID(),
      userId: user.id,
      tokenHash: "token-hash",
      expiresAt: new Date(Date.now() + 60_000),
    })

    const result = await getCurrentUser(repository, {
      userId: user.id,
      sessionId: session.id,
    })

    expect(result.user.id).toBe(user.id)
    expect(result.session?.id).toBe(session.id)
  })

  it("deletes active session on logout", async () => {
    const user = await repository.createUser({
      name: "Baim",
      email: "baim@example.com",
      passwordHash: "hashed:password123",
      role: "USER",
      status: "ACTIVE",
      photo: null,
    })
    const session = await repository.createAuthSession({
      id: randomUUID(),
      userId: user.id,
      tokenHash: "token-hash",
      expiresAt: new Date(Date.now() + 60_000),
    })

    await logoutUser(repository, {
      userId: user.id,
      sessionId: session.id,
    })

    const persistedSession = await repository.findAuthSessionByIdAndUserId(
      session.id,
      user.id,
    )

    expect(persistedSession).toBeNull()
  })
})
