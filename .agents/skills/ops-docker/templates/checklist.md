# Checklist: ops-docker

## Preparation

- [ ] Identify target: `apps/api` and/or `apps/worker`
- [ ] Check whether Prisma is used in target app
- [ ] Check ports exposed in source code

## Dockerfile

- [ ] Multi-stage build (builder + runner)
- [ ] Base image: `oven/bun:1-alpine`
- [ ] `--frozen-lockfile` on `bun install`
- [ ] Monorepo packages (`packages/`) copied in builder stage
- [ ] Build artifact copied from builder to runner
- [ ] If Prisma: `prisma generate` runs in builder
- [ ] Non-root user created and used in runner stage
- [ ] `ENV NODE_ENV=production` in runner stage
- [ ] `EXPOSE` matches used port
- [ ] `CMD` runs compiled artifact

## Security

- [ ] No `.env` or credentials in image
- [ ] Non-root user
- [ ] No dev dependencies in runner stage

## Validation

- [ ] Build succeeds: `docker build -f apps/{app}/Dockerfile -t test:latest .`
- [ ] Container runs: `docker run --rm -e ... test:latest`
- [ ] Reasonable image size (< 300MB for Bun Alpine)

## Finalization

- [ ] Dockerfile ends with newline (EOF)
- [ ] `.dockerignore` exists at root if not present
- [ ] **Do NOT modify `docker-compose.yml`**
