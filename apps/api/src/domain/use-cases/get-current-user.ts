import type { AuthSession } from "@/domain/entities/AuthSession"
import type { User } from "@/domain/entities/User"
import { DomainError } from "@/domain/errors/DomainError"
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository"

type GetCurrentUserInput = {
  userId: string
  sessionId: string | null
}

type GetCurrentUserResult = {
  user: User
  session: AuthSession | null
}

export async function getCurrentUser(
  repository: IAuthRepository,
  input: GetCurrentUserInput,
): Promise<GetCurrentUserResult> {
  const user = await repository.findUserById(input.userId)

  if (!user) {
    throw DomainError.userNotFound("User not found")
  }

  if (user.status === "SUSPENDED") {
    throw DomainError.forbidden("Account is suspended")
  }

  if (!input.sessionId) {
    return {
      user,
      session: null,
    }
  }

  const session = await repository.findAuthSessionByIdAndUserId(
    input.sessionId,
    input.userId,
  )

  return {
    user,
    session,
  }
}
