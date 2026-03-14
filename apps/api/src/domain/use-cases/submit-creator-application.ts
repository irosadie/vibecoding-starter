import type { CreatorApplication } from "@/domain/entities/CreatorApplication"
import { DomainError } from "@/domain/errors/DomainError"
import type { ICreatorApplicationRepository } from "@/domain/repositories/ICreatorApplicationRepository"
import type { StorageService } from "@/domain/services/StorageService"

type SubmitCreatorApplicationInput = {
  userId: string
  payoutAccountName: string
  payoutBankName: string
  payoutAccountNumber: string
  ktpFileBuffer: Buffer
  ktpFilename: string
  ktpMimeType: string
}

const MAX_KTP_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_KTP_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
])

export async function submitCreatorApplication(
  repository: ICreatorApplicationRepository,
  storageService: StorageService,
  input: SubmitCreatorApplicationInput,
): Promise<CreatorApplication> {
  if (!input.ktpFileBuffer.length) {
    throw DomainError.validationError("KTP file is empty")
  }

  if (input.ktpFileBuffer.length > MAX_KTP_FILE_SIZE_BYTES) {
    throw DomainError.validationError("KTP file exceeds 5MB limit")
  }

  if (!ALLOWED_KTP_MIME_TYPES.has(input.ktpMimeType)) {
    throw DomainError.validationError("KTP file type is not supported")
  }

  const pendingApplication =
    await repository.findPendingCreatorApplicationByUserId(input.userId)

  if (pendingApplication) {
    throw DomainError.conflict("You already have a pending creator application")
  }

  const uploadedFile = await storageService.uploadFile(input.ktpFileBuffer, {
    filename: input.ktpFilename,
    mimeType: input.ktpMimeType,
    folder: `creator-applications/${input.userId}`,
  })

  return repository.createCreatorApplication({
    userId: input.userId,
    ktpFileUrl: uploadedFile.url,
    payoutAccountName: input.payoutAccountName,
    payoutBankName: input.payoutBankName,
    payoutAccountNumber: input.payoutAccountNumber,
    submittedAt: new Date(),
  })
}
