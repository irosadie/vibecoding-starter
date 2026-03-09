# Guide: API Repository Interface (`apps/api/src/domain/repositories/`)

## Kontrak Folder

✅ Boleh:
- Definisikan interface atau abstract class untuk repository
- Method signature menggunakan Entity types
- Optional filter/pagination types lokal per interface

❌ Dilarang:
- Implementasi konkret — itu di `infrastructure/database/`
- Import Prisma
- Business logic

---

## Konvensi

### Interface Pattern

```typescript
// domain/repositories/IUserRepository.ts
import type { User } from '@/domain/entities/User'

export type UserListFilter = {
  search?: string
  role?: string
  isActive?: boolean
  page: number
  limit: number
}

export type UserListResult = {
  data: User[]
  total: number
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findAll(filter: UserListFilter): Promise<UserListResult>
  create(input: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>
  update(id: string, input: Partial<Pick<User, 'name' | 'role' | 'isActive'>>): Promise<User>
  delete(id: string): Promise<void>
}
```

### Naming

- Nama file: `I{Domain}Repository.ts` — prefix `I` untuk interface
- Contoh: `IUserRepository.ts`, `IOrderRepository.ts`
- Interface name = nama file

---

## Aturan Tambahan

- Return type selalu Entity, bukan Prisma model
- Method `findById` return `T | null` (nullable)
- Method `delete` return `void`
- File diakhiri newline
