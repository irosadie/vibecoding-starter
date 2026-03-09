# Guide: API Error (`apps/api/src/domain/errors/`)

## Kontrak Folder

✅ Boleh:
- Definisikan `DomainError` class dan error code enum
- Export dari satu `index.ts`

❌ Dilarang:
- Import dari `hono` atau HTTP library
- Error handling HTTP di sini — itu di errorHandler middleware

---

## Konvensi

### DomainError

```typescript
// domain/errors/DomainError.ts
export type DomainErrorCode =
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'VALIDATION'
  | 'INTERNAL'

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'DomainError'
  }
}
```

### Error Handler Middleware

```typescript
// interfaces/http/middlewares/error-handler.ts
import type { Context } from 'hono'
import { DomainError } from '@/domain/errors/DomainError'

const statusMap: Record<string, number> = {
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  VALIDATION: 422,
  INTERNAL: 500,
}

export async function errorHandler(err: Error, c: Context) {
  if (err instanceof DomainError) {
    return c.json(
      { success: false, message: err.message, code: err.code },
      (statusMap[err.code] ?? 500) as any,
    )
  }
  console.error(err)
  return c.json({ success: false, message: 'Internal server error' }, 500)
}
```

### Penggunaan di Use Case

```typescript
import { DomainError } from '@/domain/errors'

throw new DomainError('NOT_FOUND', 'User not found')
throw new DomainError('CONFLICT', 'Email already exists')
throw new DomainError('FORBIDDEN', 'Insufficient permissions')
```

---

## Aturan Tambahan

- Selalu import `DomainError` dari `@/domain/errors` (index re-export)
- Jangan throw `HTTPException` dari use case — gunakan `DomainError`
- File diakhiri newline
