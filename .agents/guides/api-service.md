# Guide: API Service (`apps/api/src/application/services/`)

## Kontrak Folder

✅ Boleh:
- Orchestrate satu atau lebih use case
- Transform Entity ke DTO sebelum return ke controller
- Inject dan panggil repository interface atau use case functions
- Koordinasi side effect (send email via worker queue, dll.)

❌ Dilarang:
- Business logic murni — itu di use case
- Akses Prisma langsung — harus lewat repository interface
- HTTP concern (status code, header, `c.json`)
- `try/catch` untuk error domain — biarkan bubble

---

## Konvensi

### Service Pattern

```typescript
// application/services/UserService.ts
import { createUser } from '@/domain/use-cases/create-user'
import { getUserById } from '@/domain/use-cases/get-user-by-id'
import { listUsers } from '@/domain/use-cases/list-users'
import { updateUser } from '@/domain/use-cases/update-user'
import { deleteUser } from '@/domain/use-cases/delete-user'
import type { IUserRepository } from '@/domain/repositories/IUserRepository'
import type { UserDto, UserListDto } from '@/application/dtos/UserDto'
import type { User } from '@/domain/entities/User'

export class UserService {
  constructor(private readonly repository: IUserRepository) {}

  async list(params: { page: number; limit: number; search?: string }): Promise<UserListDto> {
    const result = await listUsers(this.repository, params)
    return {
      data: result.data.map(toUserDto),
      meta: { total: result.total, page: params.page, limit: params.limit },
    }
  }

  async getById(id: string): Promise<UserDto> {
    const user = await getUserById(this.repository, id)
    return toUserDto(user)
  }

  async create(payload: CreateUserPayload): Promise<UserDto> {
    const user = await createUser(this.repository, payload)
    return toUserDto(user)
  }

  async update(id: string, payload: UpdateUserPayload): Promise<UserDto> {
    const user = await updateUser(this.repository, id, payload)
    return toUserDto(user)
  }

  async delete(id: string): Promise<void> {
    await deleteUser(this.repository, id)
  }
}

function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  }
}
```

### Naming

- Nama file: `{Domain}Service.ts` — PascalCase dengan suffix `Service`
- Contoh: `UserService.ts`, `OrderService.ts`

---

## Aturan Tambahan

- `toDto` mapper function ditulis di bawah class, tidak perlu di-export
- Constructor hanya terima repository interface — bukan implementasi konkret
- Service tidak tahu HTTP — tidak import `hono`
- File diakhiri newline
