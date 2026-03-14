import type {
  CreatorApplication,
  CreatorApplicationStatus,
  CreatorApplicationWithApplicant,
} from "@/domain/entities/CreatorApplication"
import type { CreatorProfile } from "@/domain/entities/CreatorProfile"
import type { UserRole } from "@/domain/entities/User"
import type {
  CreateCreatorApplicationInput,
  CreatorApplicationListFilter,
  CreatorApplicationListResult,
  ICreatorApplicationRepository,
  ReviewCreatorApplicationInput,
  UpsertCreatorProfileInput,
} from "@/domain/repositories/ICreatorApplicationRepository"
import { prisma } from "@/infrastructure/config/database"
import type {
  Prisma,
  CreatorApplication as PrismaCreatorApplication,
  CreatorProfile as PrismaCreatorProfile,
} from "@prisma/client"

export class PrismaCreatorApplicationRepository
  implements ICreatorApplicationRepository
{
  async findCreatorApplicationById(
    id: string,
  ): Promise<CreatorApplication | null> {
    const row = await prisma.creatorApplication.findUnique({
      where: { id },
    })

    return row ? toCreatorApplicationEntity(row) : null
  }

  async findPendingCreatorApplicationByUserId(
    userId: string,
  ): Promise<CreatorApplication | null> {
    const row = await prisma.creatorApplication.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
      orderBy: {
        submittedAt: "desc",
      },
    })

    return row ? toCreatorApplicationEntity(row) : null
  }

  async findLatestCreatorApplicationByUserId(
    userId: string,
  ): Promise<CreatorApplication | null> {
    const row = await prisma.creatorApplication.findFirst({
      where: { userId },
      orderBy: {
        submittedAt: "desc",
      },
    })

    return row ? toCreatorApplicationEntity(row) : null
  }

  async createCreatorApplication(
    input: CreateCreatorApplicationInput,
  ): Promise<CreatorApplication> {
    const row = await prisma.creatorApplication.create({
      data: {
        userId: input.userId,
        ktpFileUrl: input.ktpFileUrl,
        payoutAccountName: input.payoutAccountName,
        payoutBankName: input.payoutBankName,
        payoutAccountNumber: input.payoutAccountNumber,
        submittedAt: input.submittedAt,
        status: "PENDING",
      },
    })

    return toCreatorApplicationEntity(row)
  }

  async listCreatorApplications(
    filter: CreatorApplicationListFilter,
  ): Promise<CreatorApplicationListResult> {
    const where: Prisma.CreatorApplicationWhereInput = {
      ...(filter.status && { status: filter.status }),
      ...(filter.search && {
        OR: [
          {
            user: {
              name: {
                contains: filter.search,
                mode: "insensitive",
              },
            },
          },
          {
            user: {
              email: {
                contains: filter.search,
                mode: "insensitive",
              },
            },
          },
        ],
      }),
    }

    const [rows, total] = await Promise.all([
      prisma.creatorApplication.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
        skip: (filter.page - 1) * filter.perPage,
        take: filter.perPage,
      }),
      prisma.creatorApplication.count({ where }),
    ])

    return {
      data: rows.map(toCreatorApplicationWithApplicantEntity),
      total,
    }
  }

  async reviewCreatorApplication(
    input: ReviewCreatorApplicationInput,
  ): Promise<CreatorApplication> {
    const row = await prisma.creatorApplication.update({
      where: {
        id: input.id,
      },
      data: {
        status: input.status,
        reviewedBy: input.reviewedBy,
        reviewedAt: input.reviewedAt,
        reviewNote: input.reviewNote,
      },
    })

    return toCreatorApplicationEntity(row)
  }

  async upsertCreatorProfile(
    input: UpsertCreatorProfileInput,
  ): Promise<CreatorProfile> {
    const row = await prisma.creatorProfile.upsert({
      where: {
        userId: input.userId,
      },
      update: {
        payoutAccountName: input.payoutAccountName,
        payoutBankName: input.payoutBankName,
        payoutAccountNumber: input.payoutAccountNumber,
        approvedAt: input.approvedAt,
      },
      create: {
        userId: input.userId,
        payoutAccountName: input.payoutAccountName,
        payoutBankName: input.payoutBankName,
        payoutAccountNumber: input.payoutAccountNumber,
        approvedAt: input.approvedAt,
      },
    })

    return toCreatorProfileEntity(row)
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role,
      },
    })
  }
}

function toCreatorApplicationEntity(
  row: PrismaCreatorApplication,
): CreatorApplication {
  return {
    id: row.id,
    userId: row.userId,
    ktpFileUrl: row.ktpFileUrl,
    payoutAccountName: row.payoutAccountName,
    payoutBankName: row.payoutBankName,
    payoutAccountNumber: row.payoutAccountNumber,
    status: row.status as CreatorApplicationStatus,
    submittedAt: row.submittedAt,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toCreatorApplicationWithApplicantEntity(
  row: PrismaCreatorApplication & {
    user: {
      id: string
      name: string
      email: string
    }
  },
): CreatorApplicationWithApplicant {
  return {
    ...toCreatorApplicationEntity(row),
    applicant: {
      id: row.user.id,
      name: row.user.name,
      email: row.user.email,
    },
  }
}

function toCreatorProfileEntity(row: PrismaCreatorProfile): CreatorProfile {
  return {
    id: row.id,
    userId: row.userId,
    payoutAccountName: row.payoutAccountName,
    payoutBankName: row.payoutBankName,
    payoutAccountNumber: row.payoutAccountNumber,
    approvedAt: row.approvedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
