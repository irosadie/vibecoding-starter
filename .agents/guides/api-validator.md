# Guide: API Validator (`apps/api/src/application/validators/`)

## Kontrak Folder

✅ Boleh:
- Zod schema untuk validasi request (body, query, params)
- Export inferred types dari schema
- Group per domain dalam satu file

❌ Dilarang:
- Business logic atau database query
- Import dari `domain/` atau `infrastructure/`
- Gunakan `any`

---

## Konvensi

### Validator Pattern

```typescript
// application/validators/user.schemas.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  role: z.enum(['ADMIN', 'USER', 'MANAGER']),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'USER', 'MANAGER']).optional(),
  isActive: z.boolean().optional(),
})

export const listUserQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'USER', 'MANAGER']).optional(),
})

export type CreateUserPayload = z.infer<typeof createUserSchema>
export type UpdateUserPayload = z.infer<typeof updateUserSchema>
export type ListUserQuery = z.infer<typeof listUserQuerySchema>
```

### Naming

- Nama file: `{domain}.schemas.ts` — kebab-case dengan suffix `.schemas`
- Contoh: `user.schemas.ts`, `order.schemas.ts`
- Schema name: `{action}{Domain}Schema` — camelCase

---

## Aturan Tambahan

- Gunakan `z.coerce.number()` untuk query params (selalu string dari HTTP)
- Export inferred type bersamaan dengan schema di file yang sama
- Untuk enum, gunakan `z.enum([...])` bukan `z.string()` jika nilai dibatasi
- File diakhiri newline
