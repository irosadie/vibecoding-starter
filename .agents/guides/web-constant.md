# Guide: Web Constant (`apps/web/constants/`)

## Kontrak Folder

✅ Boleh:
- `api-routers.ts` — semua URL API endpoint (flat object, `:id` path variables)
- `query-keys.ts` — semua react-query cache key (flat strings per operasi)
- Constants lain yang benar-benar global (nav items, routes, dll.)

❌ Dilarang:
- Business logic
- Import dari hooks, services, atau komponen
- Nilai yang seharusnya dari env (gunakan `configs/`)
- Fungsi dinamis untuk URL — gunakan `pathVariable()` utility

---

## Konvensi

### `api-routers.ts` — Flat Object dengan `:id` Path Variables

URL path dengan parameter menggunakan `:key` placeholder. Gunakan `pathVariable()` utility saat memanggil URL dengan parameter.

```typescript
// constants/api-routers.ts
export const apiRouters = {
  paymentMethods: {
    index: '/payment-methods',
    show: '/payment-methods/:id',
    insert: '/payment-methods',
    update: '/payment-methods/:id',
    delete: '/payment-methods/:id',
  },
  users: {
    index: '/users',
    show: '/users/:id',
    insert: '/users',
    update: '/users/:id',
    ban: '/users/:id/ban',
    resendVerification: '/users/resend-verification',
  },
  drivers: {
    index: '/vendors/:vendorId/drivers',
    show: '/vendors/:vendorId/drivers/:id',
    insert: '/vendors/:vendorId/drivers',
    update: '/vendors/:vendorId/drivers/:id',
    delete: '/vendors/:vendorId/drivers/:id',
  },
}
```

**Cara pakai** dengan `pathVariable()`:

```typescript
import { pathVariable } from '$/utils/path-variable'
import { apiRouters } from '$/constants'

// Single param
const url = pathVariable(apiRouters.paymentMethods.show, { id: '123' })
// → '/payment-methods/123'

// Multiple params
const url = pathVariable(apiRouters.drivers.show, { vendorId: 'v1', id: 'd1' })
// → '/vendors/v1/drivers/d1'
```

---

### `query-keys.ts` — Flat String Values per Operasi

Setiap operasi punya key tersendiri sebagai plain string. Bukan array, bukan fungsi.

```typescript
// constants/query-keys.ts
export const queryKeys = {
  paymentMethods: {
    index: 'paymentMethodsIndex',
    get: 'paymentMethodsGet',
    insert: 'paymentMethodsInsert',
    update: 'paymentMethodsUpdate',
    delete: 'paymentMethodsDelete',
  },
  users: {
    index: 'usersIndex',
    get: 'usersGet',
    insert: 'usersInsert',
    update: 'usersUpdate',
    ban: 'usersBan',
    resendVerification: 'usersResendVerification',
  },
  drivers: {
    index: 'driversIndex',
    get: 'driversGet',
    insert: 'driversInsert',
    update: 'driversUpdate',
    delete: 'driversDelete',
    ban: 'driversBan',
    unban: 'driversUnban',
  },
}
```

**Cara pakai di hook:**

```typescript
// Sebagai string key di queryKey array
queryKey: [queryKeys.paymentMethods.index, { page, limit, filter }]

// Atau sebagai mutationKey
mutationKey: [queryKeys.paymentMethods.insert]
```

---

## Aturan Tambahan

- Grouping per domain/resource
- Key string mengikuti format: `{domain}{OperasiPascalCase}`
  - Contoh: `paymentMethodsIndex`, `usersInsert`, `driversLocationHistory`
- URL string tanpa trailing slash
- Tambah entry baru di bawah group yang ada, bukan di tempat lain
- File diakhiri newline
