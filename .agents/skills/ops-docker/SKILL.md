---
name: ops-docker
description: Write or modify Dockerfiles for this backend so it is ready to deploy on Linux. Use for tasks involving containerization, image optimization, or build/runtime issues in containers. Docker Compose is managed by the server — do not touch it.
---

# Skill: Ops Docker

## Context (Required)
- Target: Dockerfile in `apps/api/` and/or `apps/worker/`
- Stack: Hono + Bun + TypeScript
- **Do NOT touch `docker-compose.yml`** — managed by the server

## Principles

- Multi-stage build to minimize image size
- `builder` stage: install deps + compile
- `runner` stage: runtime artifact only
- Use `bun` as runtime (not Node.js)
- Run as non-root user

## Workflow

1. Identify target app and its runtime needs.
2. Copy required monorepo dependencies in the builder stage.
3. Build target artifact in `builder` stage.
4. Copy minimal artifact into `runner` stage.
5. Verify `CMD`, port, and Prisma/other runtime requirements before finishing.

## Dockerfile Template (Hono API)

```dockerfile
# Stage 1: Builder
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
COPY packages/ ./packages/
RUN bun install --frozen-lockfile

# Copy source and build
COPY apps/api/ ./apps/api/
RUN cd apps/api && bun run build

# Stage 2: Runner
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy only what is needed
COPY --from=builder --chown=appuser:appgroup /app/apps/api/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/apps/api/package.json ./

EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]
```

## Dockerfile Template (BullMQ Worker)

```dockerfile
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lockb ./
COPY packages/ ./packages/
RUN bun install --frozen-lockfile

COPY apps/worker/ ./apps/worker/
RUN cd apps/worker && bun run build

FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder --chown=appuser:appgroup /app/apps/worker/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/apps/worker/package.json ./

CMD ["bun", "run", "dist/index.js"]
```

## Rules

- Always use `--frozen-lockfile` when installing in CI/container
- Never copy `.env` into the image — inject via environment variable at runtime
- Never expose unused ports
- If Prisma is used, ensure `prisma generate` runs in the builder stage

## Prohibitions

- **FORBIDDEN** to modify `docker-compose.yml`.
- **FORBIDDEN** to run container as root unless strictly required.
- **FORBIDDEN** to copy the entire repo into the runner stage when only some artifacts are needed.
- **FORBIDDEN** to leave a Dockerfile that cannot be built deterministically.

## Pre-Completion Checklist

- [ ] Dockerfile uses multi-stage build
- [ ] Runner stage contains only minimal runtime artifact
- [ ] Non-root user is used
- [ ] Port and runtime command match target app
- [ ] Container build verified or reason documented
- [ ] All files end with newline (EOF)
