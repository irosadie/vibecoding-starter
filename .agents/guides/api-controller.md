# Guide: API Controller (`apps/api/src/interfaces/http/controllers/`)

## Kontrak Folder

✅ Boleh:
- Parse `c.req` (body, params, query)
- Panggil service method
- Format dan return HTTP response via `c.json(...)`

❌ Dilarang:
- Business logic — itu di service dan use case
- Panggil use case atau repository langsung — harus lewat service
- `try/catch` untuk error domain — biarkan bubble ke errorHandler

---

## Konvensi

### Controller Pattern

```typescript
// interfaces/http/controllers/UserController.ts
import type { Context } from 'hono'
import type { UserService } from '@/application/services/UserService'

export class UserController {
  constructor(private readonly userService: UserService) {}

  list = async (c: Context) => {
    const query = c.req.query()
    const result = await this.userService.list({
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 10),
      search: query.search,
    })
    return c.json(result)
  }

  getById = async (c: Context) => {
    const { id } = c.req.param()
    const result = await this.userService.getById(id)
    return c.json(result)
  }

  create = async (c: Context) => {
    const body = await c.req.json()
    const result = await this.userService.create(body)
    return c.json(result, 201)
  }

  update = async (c: Context) => {
    const { id } = c.req.param()
    const body = await c.req.json()
    const result = await this.userService.update(id, body)
    return c.json(result)
  }

  delete = async (c: Context) => {
    const { id } = c.req.param()
    await this.userService.delete(id)
    return c.json({ message: 'Deleted successfully' })
  }
}
```

### Naming

- Nama file: `{Domain}Controller.ts` — PascalCase dengan suffix `Controller`
- Contoh: `UserController.ts`, `OrderController.ts`
- Method = action name: `list`, `getById`, `create`, `update`, `delete`

---

## Aturan Tambahan

- Arrow function sebagai method agar `this` binding aman
- Semua transformasi data ada di service, semua business logic ada di use case
- File diakhiri newline
