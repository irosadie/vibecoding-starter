# Guide: API Prisma Repository (`apps/api/src/infrastructure/database/`)

## Kontrak Folder

✅ Boleh:
- Implement repository interface dari `domain/repositories/`
- Akses Prisma client
- Map Prisma model ke domain Entity

❌ Dilarang:
- Business logic
- Return Prisma model mentah — selalu map ke Entity
- HTTP concern

---

## Konvensi

### Prisma Repository Pattern

```typescript
// infrastructure/database/PrismaUserRepository.ts
import { prisma } from '@/infrastructure/database/prisma'
import type { IUserRepository, UserListFilter, UserListResult } from '@/domain/repositories/IUserRepository'
import type { User } from '@/domain/entities/User'

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { id } })
    return row ? toEntity(row) : null
  }

  async findAll(filter: UserListFilter): Promise<UserListResult> {
    const where = {
      ...(filter.search && {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' as const } },
          { email: { contains: filter.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(filter.isActive !== undefined && { isActive: filter.isActive }),
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return { data: data.map(toEntity), total }
  }

  async create(input: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const row = await prisma.user.create({ data: input })
    return toEntity(row)
  }

  async update(id: string, input: Partial<Pick<User, 'name' | 'role' | 'isActive'>>): Promise<User> {
    const row = await prisma.user.update({ where: { id }, data: input })
    return toEntity(row)
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }
}

function toEntity(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
```

### Prisma Client Singleton

```typescript
// infrastructure/database/prisma.ts
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
```

### Naming

- Nama file: `Prisma{Domain}Repository.ts` — PascalCase dengan prefix `Prisma`
- Contoh: `PrismaUserRepository.ts`, `PrismaOrderRepository.ts`

---

## Aturan Tambahan

- `toEntity` mapper ditulis sebagai fungsi lokal di bawah class — tidak perlu export
- Gunakan `Promise.all` untuk count + data query bersamaan (pagination)
- Filter `where` object dirakit secara kondisional — hindari nilai `undefined` di Prisma
- File diakhiri newline
