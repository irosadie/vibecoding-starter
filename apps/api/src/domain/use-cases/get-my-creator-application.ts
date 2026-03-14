import type { CreatorApplication } from "@/domain/entities/CreatorApplication"
import type { ICreatorApplicationRepository } from "@/domain/repositories/ICreatorApplicationRepository"

export async function getMyCreatorApplication(
  repository: ICreatorApplicationRepository,
  userId: string,
): Promise<CreatorApplication | null> {
  return repository.findLatestCreatorApplicationByUserId(userId)
}
