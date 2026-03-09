# Guide: API Use Case (`apps/api/src/domain/use-cases/`)

## Kontrak Folder

✅ Boleh:
- Satu operasi business logic per file
- Throw `DomainError` untuk error yang diharapkan (not found, conflict, unauthorized)
- Panggil repository interface (bukan implementasi langsung)
- Validasi business rule: cek duplikasi, authorisasi domain, dll.

❌ Dilarang:
- Akses Prisma atau database langsung
- Import dari `hono` atau HTTP library
- Throw `HTTPException` — gunakan `DomainError`
- Orchestrate multiple domain operations — itu tugas service

---

## Konvensi

### Struktur

```
domain/use-cases/
├── create-user.ts
├── get-user-by-id.ts
├── update-user.ts
└── delete-user.ts
```

### Use Case Pattern

```typescript
// domain/use-cases/create-user.ts
import { DomainError } from '@/domain/errors'
import type { IUserRepository } from '@/domain/repositories/IUserRepository'
import type { User } from '@/domain/entities/User'

type CreateUserInput = {
  name: string
  email: string
  role: string
}

export async function createUser(
  repository: IUserRepository,
  input: CreateUserInput,
): Promise<User> {
  const existing = await repository.findByEmail(input.email)
  if (existing) {
    throw new DomainError('CONFLICT', 'Email already registered')
  }

  return repository.create(input)
}
```

### Use Case dengan Auth Check

```typescript
// domain/use-cases/delete-user.ts
export async function deleteUser(
  repository: IUserRepository,
  id: string,
  requesterId: string,
): Promise<void> {
  const user = await repository.findById(id)
  if (!user) {
    throw new DomainError('NOT_FOUND', 'User not found')
  }

  if (user.id !== requesterId) {
    throw new DomainError('FORBIDDEN', 'Cannot delete other user')
  }

  await repository.delete(id)
}
```

### Naming

- Nama file: `{verb}-{domain}.ts` — kebab-case, dimulai verb
- Contoh: `create-user.ts`, `get-order-by-id.ts`, `cancel-shipment.ts`
- Export: named function (bukan class)

---

## Aturan Tambahan

- Parameter pertama selalu repository — dependency injection via parameter
- Input type didefinisikan lokal di file use case
- File diakhiri newline
