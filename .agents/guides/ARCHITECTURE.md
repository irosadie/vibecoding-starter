# Architecture: Layer Map + Folder Contracts

Baca file ini di awal setiap sesi implementasi. Berisi peta layer lengkap dan kontrak per folder.

---

## Monorepo Overview

```
vibecoding-starter/
├── apps/
│   ├── web/      → Next.js 16 App Router (frontend)
│   ├── api/      → Hono (backend, Clean Architecture)
│   └── worker/   → BullMQ (background job processor)
└── packages/
    ├── schemas/  → Zod validation schemas (shared FE + BE + Worker)
    ├── types/    → API response TypeScript types (shared FE + BE)
    └── utils/    → Pure utility functions (shared all)
```

---

## apps/web — Next.js App Router

### Layer Map

```
apps/web/
├── app/                    → Router: pages, layouts, route groups, route handlers
│   └── (group)/
│       └── feature/
│           ├── page.tsx         → Server Component (thin Suspense wrapper)
│           └── feature-content.tsx → Client Component (semua logic)
├── auth.ts                 → NextAuth credentials config (server-only)
├── proxy.ts                → Route protection / redirect logic di edge layer
├── components/             → Reusable UI components (dipakai >1 halaman)
├── hooks/
│   ├── transactions/       → Data-fetching hooks per domain
│   │   └── use-{domain}/   → Satu folder per domain
│   │       ├── use-data-table.ts
│   │       ├── use-get-one.ts
│   │       ├── use-insert-one.ts
│   │       ├── use-update-one.ts
│   │       ├── use-delete-one.ts
│   │       └── index.ts
│   └── utility/            → Non-data hooks (useQueryParam, dll.)
├── services/
│   └── axios/              → Axios instance dengan interceptors
├── constants/
│   ├── api-routers.ts      → Semua API URL constants (pakai :id path variable)
│   └── query-keys.ts       → Semua react-query cache key constants (flat strings)
├── types/generals/         → FE-specific types not from API
├── configs/                → App-wide config (env, auth, etc.)
├── providers/              → React context providers
└── utils/                  → FE-specific helper functions (debounce, pathVariable, dll.)
```

### Data Flow

```
page.tsx (Server Component — thin Suspense wrapper)
  └→ feature-content.tsx (Client Component — semua state, hooks, form, table, dialog)
      └→ Custom Hook (hooks/transactions/use-{domain}/)
          └→ react-query useQuery / useMutation
              └→ axios instance (services/axios/)
                  └→ app/api/proxy/[...path]/route.ts
                      └→ API Server
```

### Contracts per Folder

#### `app/` — Pages & Layouts

✅ Boleh:
- `page.tsx` berisi hanya Suspense wrapper + import content component
- Import `LoadingSpinner` atau skeleton component untuk Suspense fallback
- Export `generateMetadata`, `generateStaticParams`
- Route handler tipis untuk auth atau proxy boleh ada di bawah `app/api/`

❌ Dilarang:
- Panggil `axios` atau `fetch` langsung
- Import dari `services/` langsung
- Business logic atau state management
- Buat `_components/` folder per route — semua logic di content file

---

#### `app/api/(auth)/auth/[...nextauth]/route.ts` — NextAuth Route Handler

✅ Boleh:
- Bungkus `NextAuth(authOptions)` dan export handler `GET`/`POST`
- Tetap tipis dan hanya jadi entrypoint App Router untuk auth

❌ Dilarang:
- Taruh business logic login langsung di route handler
- Panggil backend auth langsung di sini jika logic sudah ada di `auth.ts`

---

#### `app/api/proxy/[...path]/route.ts` — Internal BFF Proxy

✅ Boleh:
- Forward request browser ke backend API
- Tambahkan bearer token dari session NextAuth
- Refresh access token dan update session cookie saat diperlukan
- Lewatkan endpoint auth publik seperti login/refresh tanpa bearer token

❌ Dilarang:
- Menaruh business logic feature
- Menambah transformasi response spesifik domain di level route ini
- Menjadikan route ini tempat stateful cache atau orchestration bisnis

---

#### `proxy.ts` — Edge Route Protection

✅ Boleh:
- Redirect guest ke halaman login untuk route protected
- Redirect user yang sudah login dari `/login` ke halaman default
- Baca cookie/session token untuk guard ringan
- Baca config dari `auth.ts` dan `configs/auth-server.ts`

❌ Dilarang:
- Business logic aplikasi
- Fetch data bisnis atau panggil API internal untuk render halaman
- Menaruh auth config utama di sini — tetap di `auth.ts`

---

#### `*-content.tsx` — Client Component Utama

✅ Boleh:
- Semua `useState`, `useEffect`, hooks
- Import dan panggil hooks dari `hooks/`
- Definisikan `columns` array untuk table
- Form handling dengan react-hook-form
- Dialog state dan logic
- Query params via `useQueryParam`
- Delete confirmation via SweetAlert2

❌ Dilarang:
- Panggil `axios` atau `fetch` langsung
- Import dari `services/` langsung

---

#### `components/` — Reusable UI Components

✅ Boleh:
- Terima props, render JSX
- Import komponen UI library (Button, Input, Dialog, Table, dll.)
- `useState`, `useEffect` untuk local UI state

❌ Dilarang:
- Panggil `axios` atau `fetch` langsung
- Import data-fetching hooks dari `hooks/`
- Hardcode API URL atau query key

---

#### `hooks/transactions/use-{domain}/` — Custom React Hooks

✅ Boleh:
- Wrap `useQuery`, `useMutation` dari react-query
- Panggil `axios` instance langsung (tidak perlu service function terpisah)
- Gunakan `queryKeys` dan `apiRouters` dari `constants/`
- `useDataTable` = react-query `useQuery` untuk fetch paginated list data

❌ Dilarang:
- Berisi JSX
- Satu hook untuk semua operasi — pisah per file
- Hardcode URL — gunakan `apiRouters` dari constants

---

#### `hooks/utility/` — Utility Hooks

✅ Boleh:
- `useQueryParam` — wrap `useSearchParams` + `useRouter` + `usePathname`

❌ Dilarang:
- Berisi data-fetching atau business logic

---

#### `services/axios/` — Axios Instance

✅ Boleh:
- Setup axios instance dengan base URL internal proxy dari `configs/env.ts`
- Response interceptor untuk unwrap data dan redirect ringan `401` ke login
- Response interceptor unwrap `{ meta, data }` → `DataTableResponse` untuk list

❌ Dilarang:
- Service function per endpoint — itu langsung di hook
- Business logic
- Inject bearer token browser-side jika request memang lewat internal proxy

---

#### `constants/` — Application Constants

✅ Boleh:
- `api-routers.ts`: flat object dengan `:id` path variables (misal `/users/:id`)
- `query-keys.ts`: flat string values per operasi (misal `index: 'usersIndex'`)

❌ Dilarang:
- Business logic
- Fungsi untuk path variable — gunakan `pathVariable()` utility
- Nilai dari env (gunakan `configs/`)

---

#### `packages/schemas/` — Zod Schemas (Shared)

✅ Boleh:
- Type constants array + labels array + `get{Type}Label()` helper
- Zod schema untuk form payload
- Export `type Props = z.infer<typeof schema>`

❌ Dilarang:
- Import library khusus FE atau BE
- Business logic atau API call

---

#### `packages/types/` — API Response Types (Shared)

✅ Boleh:
- TypeScript `type` untuk API response
- Re-export dari `index.ts`

❌ Dilarang:
- Gunakan `any`
- Request/payload types (gunakan `packages/schemas/`)

---

## apps/api — Hono Backend (Clean Architecture)

### Layer Map

```
apps/api/src/
├── interfaces/http/
│   ├── routes/             → HTTP routing + Zod validation
│   └── controllers/        → Parse request, call service, format response
├── application/
│   ├── services/           → Orchestrate use cases, transform Entity → DTO
│   ├── use-cases/          → Business logic (one file per operation)
│   ├── dtos/               → Data Transfer Objects (output shapes)
│   └── validators/         → Zod schemas for request validation
├── domain/
│   ├── entities/           → Domain models (plain objects/classes)
│   └── repositories/       → Repository interfaces (contracts)
└── infrastructure/
    ├── config/             → Runtime config (env, database config, dll.)
    └── database/           → Prisma repository implementations
```

### Request Lifecycle

```
HTTP Request
  → routes/         (validasi Zod, delegate ke controller)
  → controllers/    (parse req, panggil service, format response)
  → services/       (orchestrate use cases, Entity → DTO)
  → use-cases/      (business logic, throw DomainError)
  → domain/repos/   (interface contract)
  → database/       (Prisma implementation, return Entity)
  ↑
  Error bubble up → errorHandler middleware → HTTP Response
```

### Error Handling

```
DomainError → errorHandler middleware
  ├── NOT_FOUND    → 404
  ├── UNAUTHORIZED → 401
  ├── FORBIDDEN    → 403
  ├── CONFLICT     → 409
  ├── VALIDATION   → 422
  └── INTERNAL     → 500
```

### Contracts per Layer

#### `interfaces/http/routes/` — HTTP Routes

✅ Boleh:
- Definisikan HTTP method + path
- Validasi request body/query dengan Zod schema dari `validators/`
- Delegate ke controller handler
- Set middleware per route (auth, rate-limit)

❌ Dilarang:
- Business logic
- Panggil use case atau repository langsung
- Format response sendiri

---

#### `interfaces/http/controllers/` — Controllers

✅ Boleh:
- Parse `c.req` (body, params, query)
- Panggil service method
- Format dan return HTTP response (`c.json(...)`)

❌ Dilarang:
- Business logic
- Panggil use case atau repository langsung — harus lewat service
- Throw `DomainError` — itu tugas use case
- `try/catch` untuk error domain — biarkan bubble ke errorHandler

---

#### `application/services/` — Application Services

✅ Boleh:
- Orchestrate satu atau lebih use case
- Transform Entity ke DTO sebelum return ke controller
- Inject dan panggil repository atau use case

❌ Dilarang:
- Business logic — itu di use case
- Akses Prisma langsung — harus lewat repository interface
- HTTP concern (status code, header)
- `try/catch` untuk error domain

---

#### `application/use-cases/` — Use Cases

✅ Boleh:
- Berisi satu operasi business logic
- Throw `DomainError` untuk error yang diharapkan
- Panggil repository interface
- Satu file per operasi: `create-user.ts`, `get-user.ts`, dll.

❌ Dilarang:
- Akses Prisma atau database langsung
- HTTP concern (import dari `hono` untuk response/exception)
- Throw `HTTPException` — gunakan `DomainError`

---

#### `domain/entities/` — Domain Entities

✅ Boleh:
- Plain TypeScript type atau class
- Field sesuai domain model
- Method domain murni (tanpa dependency eksternal)

❌ Dilarang:
- Import Prisma types langsung
- HTTP atau database dependency

---

#### `domain/repositories/` — Repository Interfaces

✅ Boleh:
- Definisikan interface/abstract class
- Method signature: `findById(id: string): Promise<Entity | null>`
- Gunakan Entity types dari `domain/entities/`

❌ Dilarang:
- Implementasi konkret — itu di `infrastructure/database/`
- Import Prisma
- Business logic

---

#### `infrastructure/database/` — Prisma Repositories

✅ Boleh:
- Implement repository interface dari `domain/repositories/`
- Akses Prisma client
- Map Prisma model ke domain Entity

❌ Dilarang:
- Business logic
- Return Prisma model mentah — harus di-map ke Entity
- HTTP concern

---

#### `infrastructure/config/` — Runtime Config

✅ Boleh:
- Parse env dengan Zod
- Setup config aplikasi yang dibutuhkan saat bootstrap runtime

❌ Dilarang:
- Business logic
- Utility generic lintas app — pindah ke `packages/*`
- Membuat folder `shared/` di level app untuk config serupa

---

## apps/worker — BullMQ Worker

### Layer Map

```
apps/worker/src/
├── infrastructure/config/  → Runtime config (env, Redis config, dll.)
├── infrastructure/queue/   → Worker setup, consume BullMQ job
├── application/use-cases/  → Process job logic
└── domain/entities/        → Job entity types
```

### Job Flow

```
BullMQ Queue (job data defined in packages/schemas/)
  → infrastructure/queue/   (Worker setup, parse + validate job data)
  → application/use-cases/  (process job: send email, sync data, etc.)
  → domain/entities/        (job entity types)
```

### Worker Notes

- Jangan buat folder `shared/` di level app worker
- Shared lintas app tetap di `packages/*`
- Env worker masuk ke `apps/worker/src/infrastructure/config/`

---

## packages/ — Shared Packages

### Contracts

#### `packages/schemas/` — Zod Schemas

✅ Boleh:
- Zod schema untuk form payload, request body, job data
- `z.infer<>` types
- Shared enum/constant values

❌ Dilarang:
- FE atau BE specific imports
- Business logic, side effects

---

#### `packages/types/` — API Response Types

✅ Boleh:
- TypeScript `type`/`interface` untuk API responses
- Re-export dari `index.ts`

❌ Dilarang:
- `any`
- Zod dependency
- Request/payload types (gunakan `packages/schemas/`)

---

#### `packages/utils/` — Pure Utilities

✅ Boleh:
- Pure functions tanpa side effect
- Format, transform, parse helpers

❌ Dilarang:
- Import library khusus FE (React) atau BE (Hono, Prisma)
- State management
- API calls
