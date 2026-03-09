# Guide: API Entity (`apps/api/src/domain/entities/`)

## Kontrak Folder

✅ Boleh:
- Plain TypeScript `type` atau `class` yang merepresentasikan domain model
- Field sesuai domain — bukan database column
- Method domain murni (kalkulasi, validasi internal)

❌ Dilarang:
- Import Prisma types atau Prisma client
- HTTP atau database dependency
- Business logic yang berubah sesuai use case — taruh di use case

---

## Konvensi

### Entity sebagai Type

```typescript
// domain/entities/User.ts
export type User = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Entity sebagai Class (jika ada domain method)

```typescript
// domain/entities/Order.ts
export class Order {
  constructor(
    public readonly id: string,
    public readonly total: number,
    public readonly status: string,
    public readonly createdAt: Date,
  ) {}

  isCompleted(): boolean {
    return this.status === 'COMPLETED'
  }

  canBeCancelled(): boolean {
    return ['PENDING', 'PROCESSING'].includes(this.status)
  }
}
```

### Naming

- Nama file: `{Domain}.ts` — PascalCase tanpa suffix
- Nama type/class: sama dengan nama file
- Contoh: `User.ts`, `Order.ts`, `ProductCategory.ts`

---

## Aturan Tambahan

- Entity adalah source of truth domain — bukan mirror dari Prisma schema
- Jika Prisma model punya field `is_active` (`snake_case`), Entity pakai `isActive` (`camelCase`)
- Gunakan primitive types — bukan Prisma scalar types
- File diakhiri newline
