# Checklist: DB Prisma Schema

- [ ] Read `.agents/settings.json`
- [ ] Read `references/context.md`
- [ ] Read `apps/api/prisma/schema.prisma` before any change
- [ ] Model naming: prefix matches the category
- [ ] `@@map` present, snake_case plural
- [ ] `@map` present on every field that needs it
- [ ] Boolean fields prefixed `is` or `has`
- [ ] Enum values in SCREAMING_SNAKE_CASE
- [ ] Standard fields present: id, createdAt, updatedAt
- [ ] Relations: `@relation(fields, references)` correct
- [ ] Indexes: `@@index` on FKs and frequently queried fields
- [ ] `bunx prisma validate` passes
- [ ] `bunx prisma format` run
- [ ] `bunx prisma generate` run
- [ ] Every file ends with a newline (EOF)
