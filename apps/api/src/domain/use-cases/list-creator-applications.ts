import type {
  CreatorApplicationListFilter,
  CreatorApplicationListResult,
  ICreatorApplicationRepository,
} from "@/domain/repositories/ICreatorApplicationRepository"

export async function listCreatorApplications(
  repository: ICreatorApplicationRepository,
  filter: CreatorApplicationListFilter,
): Promise<CreatorApplicationListResult> {
  return repository.listCreatorApplications(filter)
}
