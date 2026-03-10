import type { User } from "@/domain/entities/User"
import { DomainError } from "@/domain/errors/DomainError"
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository"

type LoginUserInput = {
  email: string
  password: string
  verifyPassword: (password: string, passwordHash: string) => boolean
}

export async function loginUser(
  repository: IAuthRepository,
  input: LoginUserInput,
): Promise<User> {
  const normalizedEmail = input.email.trim().toLowerCase()
  const user = await repository.findUserByEmail(normalizedEmail)

  if (!user) {
    throw DomainError.invalidCredentials("Invalid email or password")
  }

  const isValidPassword = input.verifyPassword(
    input.password,
    user.passwordHash,
  )

  if (!isValidPassword) {
    throw DomainError.invalidCredentials("Invalid email or password")
  }

  if (user.status === "SUSPENDED") {
    throw DomainError.forbidden("Account is suspended")
  }

  return user
}
