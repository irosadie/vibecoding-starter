---
name: api-feature
description: Implement new backend features following Clean Architecture. Use for tasks involving new endpoints, use cases, entities, repositories, or application-layer changes.
---

# Skill: API Feature

## Context (Required)
- Folder scope + code examples: `references/context.md`
- Execution checklist: `templates/checklist.md`

Implement backend features professionally, following Clean Architecture.

## Workflow

1. Read the API contract or requirement provided.

2. Read the guide for **each folder** before creating files there:
   - `.agents/guides/api-dto.md`
   - `.agents/guides/api-validator.md`
   - `.agents/guides/api-entity.md`
   - `.agents/guides/api-repository.md`
   - `.agents/guides/api-usecase.md`
   - `.agents/guides/api-service.md`
   - `.agents/guides/api-db-repository.md`
   - `.agents/guides/api-controller.md`
   - `.agents/guides/api-route.md`
   - `.agents/guides/api-error.md`

3. Create files **in order** by layer dependency:
   ```
   1. application/dtos/{Domain}Dto.ts
   2. application/validators/{domain}.schemas.ts
   3. domain/entities/{Domain}.ts
   4. domain/repositories/I{Domain}Repository.ts
   5. domain/use-cases/{verb}-{domain}.ts    (one per operation)
   6. application/services/{Domain}Service.ts
   7. infrastructure/database/Prisma{Domain}Repository.ts
   8. interfaces/http/controllers/{Domain}Controller.ts
   9. interfaces/http/routes/{domain}Routes.ts
   10. Register in interfaces/http/create-app.ts
   ```

4. Error handling — do not catch in Service or Controller:
   ```
   UseCase throws DomainError → errorHandler middleware
   ```

## Prohibitions

- **NEVER** use `any`.
- **NEVER** put business logic in the Controller.
- **NEVER** access Prisma in a Use Case.
- **NEVER** throw `HTTPException` from a Use Case — use `DomainError`.
- **NEVER** change files unrelated to the task.
- **NEVER** use plain `string` for fields with a fixed value set — import the shared enum from `@vibecoding-starter/schemas`.

## Pre-Completion Checklist

- [ ] DTO created
- [ ] Validator schema created
- [ ] Entity created
- [ ] Repository interface created
- [ ] Use case(s) created (one per operation)
- [ ] Service created
- [ ] Prisma repository created
- [ ] Controller created
- [ ] Route created and registered in create-app.ts
- [ ] No `any`
- [ ] No business logic in Controller
- [ ] No Prisma in Use Case
- [ ] `bun run build` passes
- [ ] All files end with a newline (EOF)
