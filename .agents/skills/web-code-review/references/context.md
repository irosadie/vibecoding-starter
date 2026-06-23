# Context: Web Code Review

## Target Folder

```
apps/web/app/                          → page wrapper + main content component
apps/web/components/                   → reusable UI components
apps/web/hooks/transactions/           → frontend data-fetching hooks
apps/web/constants/                    → query keys + API routes
apps/web/services/axios/               → axios instance + interceptor
packages/schemas/                      → shared request schema / payload shape
packages/types/                        → shared response types
```

## Key Patterns

- `page.tsx` must stay thin; main logic lives in `*-content.tsx`
- JSX must not call `fetch` / `axios` directly
- API integration must go through transaction hooks
- payload changes must sync with `packages/schemas`
- response handling changes must sync with `packages/types`
- frontend review must suspect race conditions, stale state, and error states that mislead users

## Active Surface Examples

- Starter homepage: `apps/web/app/page.tsx`, `apps/web/app/home-content.tsx`
- Hook integration: `apps/web/hooks/transactions/`
- Shared contract: `packages/types/error-response.ts`, `packages/types/success-response.ts`
