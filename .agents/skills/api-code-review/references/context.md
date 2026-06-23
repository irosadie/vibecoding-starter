# Context: API Code Review

## Target Folders

```
apps/api/src/interfaces/http/          → routes, controllers, middleware
apps/api/src/application/              → services, use-cases, DTOs, validators
apps/api/src/domain/                   → entities and repository interfaces
apps/api/src/infrastructure/           → database / external implementations
packages/schemas/                      → shared request schema when used across apps
packages/types/                        → shared response types
docs/openapi/                          → split OpenAPI source of truth
```

## Key Patterns

- routes must not jump straight to a repository
- controllers must not hold large business logic
- use cases must not know about HTTP concerns
- validator/DTO/response shape changes trigger a contract drift audit
- OpenAPI and shared types are part of the review when endpoint behavior changes

## Active Surface Examples

- Baseline routes: `apps/api/src/interfaces/http/routes/root-route.ts`, `apps/api/src/interfaces/http/routes/health-route.ts`
- App assembly: `apps/api/src/interfaces/http/create-app.ts`
- Active OpenAPI: `docs/openapi/base.json`
