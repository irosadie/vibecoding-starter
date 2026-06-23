# Context: API Bugfix

## Target Folders

```
apps/api/src/interfaces/http/          → route, controller, middleware
apps/api/src/application/              → service, use-case, DTO, validator
apps/api/src/domain/                   → entity and repository contract
apps/api/src/infrastructure/           → side-effect implementations
packages/schemas/                      → shared request schemas when relevant
packages/types/                        → shared response types
docs/openapi/                          → split OpenAPI source of truth
docs/openapi.json                      → generated merged spec
```

## Impact Map

Check in this order:
1. Is the bug in request validation?
2. Is the bug in orchestration / response mapping?
3. Is the bug in a use-case business rule?
4. Is the bug in repository / side effect?
5. Does the user-visible endpoint behavior change?

## Key Patterns

- Layer boundaries must stay clean during a bugfix
- Minimal touch beats broad refactor
- Response or error contract changes trigger an audit of `packages/types` and OpenAPI
- Request shape changes trigger an audit of validator and `packages/schemas`
- Edit OpenAPI in split files, then regenerate the merged spec

## Active Surface Examples

- `apps/api/src/interfaces/http/routes/root-route.ts`
- `apps/api/src/application/services/system-service.ts`
- `apps/api/src/application/use-cases/`
- `docs/openapi/base.json`
