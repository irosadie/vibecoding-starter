# Guide: API DTO (`apps/api/src/application/dtos/`)

## Kontrak Folder

✅ Boleh:
- TypeScript `type` atau `interface` untuk output yang dikirim ke client
- Subset atau transform dari Entity (serializable: string, number, boolean — bukan Date object)

❌ Dilarang:
- Zod schema (itu di `validators/`)
- Business logic atau method
- Prisma types
- Gunakan `any`

---

## Konvensi

### DTO Pattern

```typescript
// application/dtos/UserDto.ts
export type UserDto = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string   // ISO string, bukan Date
}

export type UserListDto = {
  data: UserDto[]
  meta: {
    total: number
    page: number
    limit: number
  }
}
```

### Naming

- Nama file: `{Domain}Dto.ts` — PascalCase dengan suffix `Dto`
- Contoh: `UserDto.ts`, `OrderDto.ts`
- Type name: `{Domain}Dto`, `{Domain}ListDto`, `{Domain}DetailDto`

---

## Aturan Tambahan

- `Date` → `string` (ISO format) di DTO agar JSON serializable
- Nullable field gunakan `type | null`, bukan `type | undefined` untuk response
- File diakhiri newline
