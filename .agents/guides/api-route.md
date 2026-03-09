# Guide: API Route (`apps/api/src/interfaces/http/routes/`)

## Kontrak Folder

✅ Boleh:
- Definisikan HTTP method + path
- Validasi request dengan Zod schema dari `validators/`
- Attach middleware per route (auth, rate-limit)
- Delegate ke controller handler

❌ Dilarang:
- Business logic
- Panggil use case atau repository langsung
- Format response sendiri

---

## Konvensi

### Route Pattern

```typescript
// interfaces/http/routes/userRoutes.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { UserController } from '@/interfaces/http/controllers/UserController'
import { UserService } from '@/application/services/UserService'
import { PrismaUserRepository } from '@/infrastructure/database/PrismaUserRepository'
import { createUserSchema, updateUserSchema } from '@/application/validators/user.schemas'
import { authMiddleware } from '@/interfaces/http/middlewares/auth'

const userRepository = new PrismaUserRepository()
const userService = new UserService(userRepository)
const userController = new UserController(userService)

export const userRoutes = new Hono()
  .use(authMiddleware)
  .get('/', userController.list)
  .get('/:id', userController.getById)
  .post('/', zValidator('json', createUserSchema), userController.create)
  .put('/:id', zValidator('json', updateUserSchema), userController.update)
  .delete('/:id', userController.delete)
```

### Registrasi di `create-app.ts`

```typescript
// interfaces/http/create-app.ts
import { userRoutes } from './routes/userRoutes'

app.route('/users', userRoutes)
```

### Naming

- Nama file: `{domain}Routes.ts` — camelCase dengan suffix `Routes`
- Contoh: `userRoutes.ts`, `orderRoutes.ts`, `authRoutes.ts`

---

## Aturan Tambahan

- Instansiasi dependency (repository, service, controller) di dalam file route
- Gunakan `zValidator` dari `@hono/zod-validator` untuk validasi otomatis
- File diakhiri newline
