---
name: db-prisma-schema
description: Write or modify apps/api/prisma/schema.prisma and execute safe PostgreSQL migrations. Use for database model, relation, index, enum changes, or schema-to-domain-layer sync.
---

# Skill: DB Prisma Schema

## Context (Required)
- Folder scope + code samples: `references/context.md`
- Execution checklist: `templates/checklist.md`

Apply schema changes minimally and safely.

## Naming Conventions

### Models & Tables

| Category | Model Prefix | `@@map` Prefix |
|----------|-------------|----------------|
| Master / reference data | `Master` | `master_` |
| Transaction / business data | `Business` | `business_` |
| Membership data | `Member` | `member_` |
| User / auth data | *(no prefix)* | `users` |
| System config data | *(no prefix)* | `configurations` |

### Boolean Fields — prefix `is` or `has`
### Enum Values — SCREAMING_SNAKE_CASE

If a field has a fixed set of values, **NEVER** declare a Prisma `enum`. Use `String` in Prisma and declare the enum in `packages/schemas/` as the shared source of truth. Validate via Zod on the BE (validator) and FE (form schema) layers.

```typescript
// packages/schemas/status.ts (source of truth)
export const statuses = ['ACTIVE', 'INACTIVE', 'ON_PROGRESS'] as const
export type Status = (typeof statuses)[number]
```

```prisma
// Prisma — use String; validate at the application layer
status String @default("ACTIVE")
```

### Required Standard Fields
```prisma
id        String    @id @default(uuid()) @db.Uuid
createdAt DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
updatedAt DateTime  @default(now()) @map("updated_at") @db.Timestamp(6)
deletedAt DateTime? @map("deleted_at") @db.Timestamp(6)
```

## Workflow

1. Read `apps/api/prisma/schema.prisma`
2. Identify breaking vs non-breaking changes
3. Write minimal diff
4. Run: `bunx prisma validate` → `bunx prisma format` → `bunx prisma generate`

## Prohibitions

- **NEVER** rename a model, enum, or field without a clear requirement.
- **NEVER** drop an existing column or relation without documenting the migration impact.
- **NEVER** leave placeholders or names that violate the prefix convention.
- **NEVER** edit files outside the schema/migration scope unless the task requires it.

## Pre-Completion Checklist

- [ ] Model naming follows the category prefix
- [ ] `@@map` present (snake_case plural)
- [ ] `@map` present on every field (snake_case)
- [ ] Boolean fields prefixed `is` or `has`
- [ ] Enum values in SCREAMING_SNAKE_CASE
- [ ] Standard fields present: id, createdAt, updatedAt
- [ ] `bunx prisma validate` passes
- [ ] `bunx prisma format` run
- [ ] `bunx prisma generate` run
- [ ] Every file ends with a newline (EOF)
