# Context: ops-docker

## Target Files

```
apps/api/Dockerfile
apps/worker/Dockerfile
```

## Monorepo Structure in Container

```
/app/
├── package.json       ← monorepo root
├── bun.lockb
├── packages/
│   ├── schemas/
│   ├── types/
│   └── utils/
└── apps/
    ├── api/
    └── worker/
```

## Prisma in Docker

If `apps/api` uses Prisma, add to builder stage:

```dockerfile
COPY apps/api/prisma ./apps/api/prisma
RUN cd apps/api && bunx prisma generate
```

And in runner stage, copy Prisma schema:
```dockerfile
COPY --from=builder /app/apps/api/prisma ./prisma
```

## Environment Variables

Never hardcode in Dockerfile. Inject at `docker run` or via orchestrator:

```bash
docker run \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -p 3000:3000 \
  my-api:latest
```

## Build Command

```bash
# From monorepo root
docker build -f apps/api/Dockerfile -t my-api:latest .
docker build -f apps/worker/Dockerfile -t my-worker:latest .
```

Build context must be the root so `packages/` can be copied.

## Layer Caching Tips

Optimal COPY order for cache hits:
1. `package.json` + `bun.lockb` (rarely change)
2. `packages/` (rarely change)
3. `bun install` (cache keyed by lockfile)
4. Source code (changes often — place last)

## .dockerignore

```
node_modules
.env
.env.*
dist
.git
apps/web
docs
```
