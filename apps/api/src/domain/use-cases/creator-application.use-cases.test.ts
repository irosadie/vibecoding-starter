import { randomUUID } from "node:crypto"
import type {
  CreatorApplication,
  CreatorApplicationStatus,
  CreatorApplicationWithApplicant,
} from "@/domain/entities/CreatorApplication"
import type { CreatorProfile } from "@/domain/entities/CreatorProfile"
import type { User, UserRole } from "@/domain/entities/User"
import type {
  CreateCreatorApplicationInput,
  CreatorApplicationListFilter,
  CreatorApplicationListResult,
  ICreatorApplicationRepository,
  ReviewCreatorApplicationInput,
  UpsertCreatorProfileInput,
} from "@/domain/repositories/ICreatorApplicationRepository"
import type {
  StorageService,
  UploadResult,
} from "@/domain/services/StorageService"
import { beforeEach, describe, expect, it } from "vitest"
import { approveCreatorApplication } from "./approve-creator-application"
import { rejectCreatorApplication } from "./reject-creator-application"
import { submitCreatorApplication } from "./submit-creator-application"

class InMemoryCreatorApplicationRepository
  implements ICreatorApplicationRepository
{
  private applications = new Map<string, CreatorApplication>()
  private profiles = new Map<string, CreatorProfile>()
  private users = new Map<string, User>()

  seedUser(input?: Partial<User>): User {
    const user: User = {
      id: input?.id ?? randomUUID(),
      email: input?.email ?? "user@example.com",
      passwordHash: input?.passwordHash ?? "hashed-password",
      name: input?.name ?? "User",
      role: input?.role ?? "USER",
      status: input?.status ?? "ACTIVE",
      photo: input?.photo ?? null,
      createdAt: input?.createdAt ?? new Date(),
      updatedAt: input?.updatedAt ?? new Date(),
    }

    this.users.set(user.id, user)
    return user
  }

  async findCreatorApplicationById(
    id: string,
  ): Promise<CreatorApplication | null> {
    return this.applications.get(id) ?? null
  }

  async findPendingCreatorApplicationByUserId(
    userId: string,
  ): Promise<CreatorApplication | null> {
    for (const application of this.applications.values()) {
      if (application.userId === userId && application.status === "PENDING") {
        return application
      }
    }

    return null
  }

  async findLatestCreatorApplicationByUserId(
    userId: string,
  ): Promise<CreatorApplication | null> {
    const userApplications = [...this.applications.values()]
      .filter((application) => application.userId === userId)
      .sort(
        (left, right) =>
          right.submittedAt.getTime() - left.submittedAt.getTime(),
      )

    return userApplications[0] ?? null
  }

  async createCreatorApplication(
    input: CreateCreatorApplicationInput,
  ): Promise<CreatorApplication> {
    const now = new Date()
    const application: CreatorApplication = {
      id: randomUUID(),
      userId: input.userId,
      ktpFileUrl: input.ktpFileUrl,
      payoutAccountName: input.payoutAccountName,
      payoutBankName: input.payoutBankName,
      payoutAccountNumber: input.payoutAccountNumber,
      status: "PENDING",
      submittedAt: input.submittedAt,
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
      createdAt: now,
      updatedAt: now,
    }

    this.applications.set(application.id, application)
    return application
  }

  async listCreatorApplications(
    filter: CreatorApplicationListFilter,
  ): Promise<CreatorApplicationListResult> {
    const keyword = filter.search?.toLowerCase()
    const rows = [...this.applications.values()]
      .filter((application) => {
        if (filter.status && application.status !== filter.status) {
          return false
        }

        if (!keyword) {
          return true
        }

        const user = this.users.get(application.userId)
        if (!user) {
          return false
        }

        return (
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword)
        )
      })
      .sort(
        (left, right) =>
          right.submittedAt.getTime() - left.submittedAt.getTime(),
      )
    const paginatedRows = rows.slice(
      (filter.page - 1) * filter.perPage,
      filter.page * filter.perPage,
    )

    return {
      data: paginatedRows.map((application) =>
        this.toApplicationWithApplicant(application),
      ),
      total: rows.length,
    }
  }

  async reviewCreatorApplication(
    input: ReviewCreatorApplicationInput,
  ): Promise<CreatorApplication> {
    const current = this.applications.get(input.id)
    if (!current) {
      throw new Error("application not found")
    }

    const next: CreatorApplication = {
      ...current,
      status: input.status as CreatorApplicationStatus,
      reviewedBy: input.reviewedBy,
      reviewedAt: input.reviewedAt,
      reviewNote: input.reviewNote,
      updatedAt: new Date(),
    }

    this.applications.set(next.id, next)
    return next
  }

  async upsertCreatorProfile(
    input: UpsertCreatorProfileInput,
  ): Promise<CreatorProfile> {
    const current = this.profiles.get(input.userId)
    const now = new Date()
    const profile: CreatorProfile = {
      id: current?.id ?? randomUUID(),
      userId: input.userId,
      payoutAccountName: input.payoutAccountName,
      payoutBankName: input.payoutBankName,
      payoutAccountNumber: input.payoutAccountNumber,
      approvedAt: input.approvedAt,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    }

    this.profiles.set(input.userId, profile)
    return profile
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    const user = this.users.get(userId)
    if (!user) {
      return
    }

    this.users.set(user.id, {
      ...user,
      role,
      updatedAt: new Date(),
    })
  }

  getUserById(userId: string): User | undefined {
    return this.users.get(userId)
  }

  getProfileByUserId(userId: string): CreatorProfile | undefined {
    return this.profiles.get(userId)
  }

  private toApplicationWithApplicant(
    application: CreatorApplication,
  ): CreatorApplicationWithApplicant {
    const user = this.users.get(application.userId)

    return {
      ...application,
      applicant: {
        id: user?.id ?? "",
        name: user?.name ?? "Unknown",
        email: user?.email ?? "unknown@example.com",
      },
    }
  }
}

class FakeStorageService implements StorageService {
  async uploadFile(): Promise<UploadResult> {
    return {
      url: "http://localhost:3001/uploads/creator-applications/ktp-file.png",
      storagePath: "creator-applications/ktp-file.png",
    }
  }

  async deleteFile(): Promise<void> {}
  async getCdnUrl(path: string): Promise<string> {
    return `http://localhost:3001/uploads/${path.replace(/^\/+/, "")}`
  }
  async getUploadUrl(filename: string): Promise<string> {
    return `http://localhost:3001/uploads/${filename}`
  }
  async getUploadHeaders(): Promise<Record<string, string>> {
    return {}
  }
}

describe("creator application use cases", () => {
  let repository: InMemoryCreatorApplicationRepository
  let storageService: FakeStorageService

  beforeEach(() => {
    repository = new InMemoryCreatorApplicationRepository()
    storageService = new FakeStorageService()
  })

  it("submits creator application and stores KTP file URL", async () => {
    const user = repository.seedUser()

    const result = await submitCreatorApplication(repository, storageService, {
      userId: user.id,
      payoutAccountName: "Imron Rosadie",
      payoutBankName: "BCA",
      payoutAccountNumber: "1234567890",
      ktpFileBuffer: Buffer.from("fake-ktp-file"),
      ktpFilename: "ktp.png",
      ktpMimeType: "image/png",
    })

    expect(result.status).toBe("PENDING")
    expect(result.ktpFileUrl).toContain("http://localhost:3001/uploads")
  })

  it("rejects duplicate pending creator application", async () => {
    const user = repository.seedUser()

    await submitCreatorApplication(repository, storageService, {
      userId: user.id,
      payoutAccountName: "Imron Rosadie",
      payoutBankName: "BCA",
      payoutAccountNumber: "1234567890",
      ktpFileBuffer: Buffer.from("fake-ktp-file"),
      ktpFilename: "ktp.png",
      ktpMimeType: "image/png",
    })

    await expect(
      submitCreatorApplication(repository, storageService, {
        userId: user.id,
        payoutAccountName: "Imron Rosadie",
        payoutBankName: "BCA",
        payoutAccountNumber: "1234567890",
        ktpFileBuffer: Buffer.from("fake-ktp-file"),
        ktpFilename: "ktp.png",
        ktpMimeType: "image/png",
      }),
    ).rejects.toMatchObject({
      code: "RESOURCE_CONFLICT",
      status: 409,
    })
  })

  it("approves creator application and upgrades role", async () => {
    const user = repository.seedUser({
      name: "Imron Rosadie",
      email: "imronrosadie@gmail.com",
      role: "USER",
    })

    const application = await submitCreatorApplication(
      repository,
      storageService,
      {
        userId: user.id,
        payoutAccountName: "Imron Rosadie",
        payoutBankName: "BCA",
        payoutAccountNumber: "1234567890",
        ktpFileBuffer: Buffer.from("fake-ktp-file"),
        ktpFilename: "ktp.png",
        ktpMimeType: "image/png",
      },
    )

    const result = await approveCreatorApplication(repository, {
      applicationId: application.id,
      reviewedBy: randomUUID(),
      reviewNote: "Looks good",
    })

    expect(result.application.status).toBe("APPROVED")
    expect(result.promotedUser.role).toBe("CREATOR")
    expect(repository.getUserById(user.id)?.role).toBe("CREATOR")
    expect(repository.getProfileByUserId(user.id)?.approvedAt).toBeInstanceOf(
      Date,
    )
  })

  it("rejects creator application with review note", async () => {
    const user = repository.seedUser()

    const application = await submitCreatorApplication(
      repository,
      storageService,
      {
        userId: user.id,
        payoutAccountName: "Imron Rosadie",
        payoutBankName: "BCA",
        payoutAccountNumber: "1234567890",
        ktpFileBuffer: Buffer.from("fake-ktp-file"),
        ktpFilename: "ktp.png",
        ktpMimeType: "image/png",
      },
    )

    const result = await rejectCreatorApplication(repository, {
      applicationId: application.id,
      reviewedBy: randomUUID(),
      reviewNote: "Data payout tidak valid",
    })

    expect(result.status).toBe("REJECTED")
    expect(result.reviewNote).toBe("Data payout tidak valid")
  })
})
