import type { User } from "@/domain/entities/User"
import { DomainError } from "@/domain/errors/DomainError"
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository"

type RegisterUserInput = {
  name: string
  email: string
  password: string
  hashPassword: (password: string) => string
}

export async function registerUser(
  repository: IAuthRepository,
  input: RegisterUserInput,
): Promise<User> {
  const normalizedEmail = input.email.trim().toLowerCase()
  const existingUser = await repository.findUserByEmail(normalizedEmail)

  if (existingUser) {
    throw DomainError.duplicateEmail("Email already registered")
  }

  const passwordHash = input.hashPassword(input.password)

  return repository.createUser({
    email: normalizedEmail,
    passwordHash,
    name: input.name.trim(),
    role: "USER",
    status: "ACTIVE",
    photo: null,
  })
}
