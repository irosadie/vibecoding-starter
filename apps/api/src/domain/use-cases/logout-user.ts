import type { IAuthRepository } from "@/domain/repositories/IAuthRepository"

type LogoutUserInput = {
  userId: string
  sessionId: string | null
}

export async function logoutUser(
  repository: IAuthRepository,
  input: LogoutUserInput,
): Promise<void> {
  if (!input.sessionId) {
    return
  }

  await repository.deleteAuthSessionByIdAndUserId(input.sessionId, input.userId)
}
