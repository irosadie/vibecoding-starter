# Memory

Catatan penting yang perlu diingat antar sesi.

## Project

- Monorepo: vibecoding-starter
- Package manager: bun
- Path alias frontend: `$` (bukan `@`) → misal `$/components/button`, `$/hooks/...`
- Node version: nvm use 22
- Perintah `Mulai` / `Start` wajib masuk ke flow onboarding `flow-session-start`
- Quick status onboarding tersedia di `bun run session:status`

## Konvensi Frontend (apps/web)

### Struktur Halaman
- `page.tsx` = thin Suspense wrapper saja (Server Component)
- `_components/` = private components per route (tidak dipakai route lain)
- `*-page-content.tsx` = Client Component utama (state, hooks, logic)
- Komponen dipecah: `*-toolbar.tsx`, `*-table-card.tsx`, `*-form-dialog.tsx`, `*-page-loading.tsx`
- Loading state via `loading.tsx` + `*-page-loading.tsx` skeleton component

### Hooks
- Folder: `hooks/transactions/use-{domain}/` (satu folder per domain)
- Satu file per operasi: `use-data-table.ts`, `use-get-one.ts`, `use-insert-one.ts`, `use-update-one.ts`, `use-delete-one.ts`
- Index file re-export semua: `export { default as use{Domain}DataTable } from './use-data-table'`
- Hooks call axios **langsung** — tidak ada service function layer terpisah
- `useDataTable` = react-query `useQuery` hook yang fetch paginated data (bukan TanStack Table wrapper)
- Naming: `useInsertOne`, `useUpdateOne`, `useDeleteOne`, `useGetOne` (bukan useCreate/useUpdate/useDelete)

### Constants
- `queryKeys`: flat string values — misal `index: 'paymentMethodsIndex'`
- `apiRouters`: `:id` path variables — misal `show: '/payment-methods/:id'`
- Gunakan `pathVariable(url, params)` utility untuk replace `:key` di URL

### Query Params
- Gunakan `useQueryParam` hook dari `$/hooks/utility/use-query-param`
- Returns `{ setQueryParams(values, options?) }` — panggil dengan Record
- `debounce` utility dari `$/utils/debounce` + `useMemo` (BUKAN `useDebounce` hook)

### SweetAlert Delete Pattern
- Gunakan `preConfirm` + `new Promise((resolve, reject))` + `.then()/.catch()` chain
- BUKAN async/await
- `deleteMutate(id, { onSuccess: () => resolve(null), onError: () => reject() })` di dalam preConfirm

### Toast
- Gunakan `react-hot-toast`: `toast.success()` / `toast.error()`
- SweetAlert hanya untuk konfirmasi dialog, bukan notifikasi sukses/error

### Form
- Gunakan `register`, `handleSubmit`, `reset`, `watch`, `setValue` dari react-hook-form
- BUKAN shadcn FormField/FormControl/Form
- `watch()` untuk reactive values, `setValue` untuk complex fields (Select, RadioGroup)

### Response Types
- `DataTableResponse<T>` = `{ list: T[], meta: { pagination: { total, currentPage, perPage, lastPage }, cursor } }`
- Axios interceptor unwraps `{ meta, data }` → `DataTableResponse` untuk list, atau unwrap `data` untuk single

### Auth dan Proxy
- Auth web memakai `NextAuth` credentials di `apps/web/auth.ts`
- Route handler auth ada di `app/api/(auth)/auth/[...nextauth]/route.ts`
- Semua request browser ke backend lewat `app/api/proxy/[...path]/route.ts`, bukan direct hit ke `API_URL`
- Axios browser pakai base path internal `/api/proxy`; jangan inject bearer token di request interceptor client-side
- `proxy.ts` hanya untuk route protection ringan: default login di `/login`, protected area starter di `/panel`
- Secret, cookie policy, dan backend base URL server-side disimpan di `configs/auth-server.ts`; jangan import file itu ke komponen client

## Konvensi Backend (apps/api)

- Clean Architecture: routes → controllers → services → use-cases → repositories → database
- Error: `DomainError` dari use case, bubble ke errorHandler middleware
- Prisma hanya di `infrastructure/database/`
- Jangan buat folder `shared` di level app. Shared lintas app hanya di `packages/*`, config runtime masuk ke `infrastructure/config/`

## Shared Packages

- `packages/schemas/`: types + labels array + `get{Type}Label()` helper + Zod schema + type alias
- `packages/types/`: flat shared response type files, import via `@vibecoding-starter/types/{feature-response}` dan re-export dari root bila perlu
- `packages/utils/`: folder module pakai `kebab-case`, file implementation dan symbol export pakai `camelCase`
