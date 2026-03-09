# Operations Guide

Dokumen ini menjelaskan cara menjalankan, memverifikasi, dan memelihara starter ini dalam kondisi yang benar-benar didukung oleh codebase saat ini.

## Scope

Repo ini saat ini mendukung baseline berikut:
- `apps/web`: Next.js App Router di port `3000`
- auth foundation web: NextAuth credentials + internal BFF proxy route
- `apps/api`: Hono API di port `3001`
- `apps/worker`: worker scaffold yang terhubung ke Redis tanpa queue aktif default
- `docker-compose.yml`: menyediakan PostgreSQL lokal dan Redis lokal
- `scripts/`: helper executable repo-level untuk bootstrap lokal dan workflow pendukung
- `Prisma`: CLI dan local database infra sudah siap, walaupun schema default masih scaffold generik

Konvensi struktur:
- `docs/` hanya untuk dokumentasi dan template
- `scripts/` untuk file executable repo-level seperti shell helper

## Local Topology

| Component | URL / Port | Purpose |
| --- | --- | --- |
| Web | `http://localhost:3000` | UI starter dengan login, panel, dan BFF proxy |
| Web Auth | `http://localhost:3000/api/auth/*` | Route handler NextAuth untuk session dan credentials flow |
| Web Proxy | `http://localhost:3000/api/proxy/*` | Proxy internal untuk semua request browser ke backend |
| API | `http://localhost:3001` | HTTP API untuk root dan health check |
| Worker | n/a | Worker scaffold idle untuk background runtime |
| PostgreSQL | `postgresql://postgres:postgres@127.0.0.1:5432/vibecoding_starter?schema=public` | Database lokal untuk fitur Prisma berikutnya |
| Redis | `redis://127.0.0.1:6379` | Broker siap pakai untuk fitur queue berikutnya |
| Prisma Studio | `http://localhost:5555` | Browser UI untuk database lokal saat schema sudah dipakai |

## Supported Baseline

Baseline lokal yang dianggap sehat untuk repo ini:
1. `bun install` berhasil.
2. PostgreSQL dan Redis lokal aktif.
3. `bun run dev` menjalankan web, api, dan worker.
4. `bun run check` pass.
5. Login page starter dapat dibuka di `http://localhost:3000/login`.
6. Route protected default `/panel` redirect ke `/login` saat belum ada session.

## Environment Matrix

### Root

Repo tidak memakai `.env` root sebagai source of truth. Env dikelola per app.

### `apps/web/.env.example`

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | no | `http://localhost:3000` | Base URL web app |
| `NEXT_PUBLIC_API_URL` | no | `http://localhost:3001` | Fallback backend base URL untuk server-side auth config |
| `NEXT_PUBLIC_API_PROXY_BASE_URL` | no | `/api/proxy` | Base path internal proxy yang dipakai axios di browser |
| `NEXTAUTH_URL` | no | `http://localhost:3000` | Canonical web URL untuk NextAuth |
| `NEXTAUTH_SECRET` | yes untuk production | none | Secret untuk sign/encrypt session cookie |
| `API_URL` | no | `http://localhost:3001` | Backend base URL yang dipakai route proxy server-side |
| `AUTH_LOGIN_PATH` | no | `/auth/login` | Path backend untuk login credentials |
| `AUTH_REFRESH_PATH` | no | `/auth/refresh` | Path backend untuk refresh token |
| `AUTH_LOGOUT_PATH` | no | `/auth/logout` | Path backend untuk logout token/session |

### `apps/api/.env.example`

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `API_PORT` | no | `3001` | Port HTTP API |
| `DATABASE_URL` | no | `postgresql://postgres:postgres@127.0.0.1:5432/vibecoding_starter?schema=public` | Default local PostgreSQL untuk Prisma |

### `apps/worker/.env.example`

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `REDIS_URL` | no | `redis://127.0.0.1:6379` | Redis untuk BullMQ worker |

## Fast Start

### Bootstrap sekali jalan

```bash
bun install
bun run bootstrap
```

`bun run bootstrap` akan:
1. membuat file `.env` dari `.env.example` bila belum ada
2. menyalakan PostgreSQL dan Redis via Docker Compose
3. menunggu kedua service ready
4. generate Prisma client
5. generate merged OpenAPI spec

### Manual setup

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
bun run stack:up
bun run prisma:generate
bun run openapi:generate
```

## Daily Commands

### Stack management

```bash
bun run stack:up
bun run stack:down
bun run stack:logs
bun run stack:ps
bun run stack:reset
```

### App runtime

```bash
bun run dev
bun run dev:web
bun run dev:api
bun run dev:worker
```

## Auth and Proxy Flow

Baseline auth frontend saat ini memakai pola BFF:
1. User submit form di `/login`.
2. NextAuth credentials di `apps/web/auth.ts` mengirim request ke `/api/proxy/auth/login`.
3. Route `apps/web/app/api/proxy/[...path]/route.ts` meneruskan request itu ke backend `API_URL`.
4. Access token dan refresh token disimpan di session cookie NextAuth berbasis JWT.
5. Request browser berikutnya dari hooks/frontend selalu hit `/api/proxy/*`, bukan backend langsung.
6. Proxy internal yang menambahkan bearer token, mencoba refresh token saat hampir expired, lalu retry jika backend mengembalikan `401`.
7. `apps/web/proxy.ts` menjaga route protected default `/panel` dan redirect guest ke `/login`.

### Quality gate utama

```bash
bun run check
```

Ini menjalankan:
- validasi skill assets
- lint
- typecheck
- test
- build

### Perintah parsial

```bash
bun run session:status
bun run lint
bun run typecheck
bun run test
bun run build
```

`bun run session:status` dipakai oleh flow onboarding saat user hanya mengetik `Mulai` atau `Start` ke agent.

## OpenAPI Workflow

Source of truth OpenAPI saat ini:
- `docs/openapi/base.json`
- `docs/openapi/paths/*.json`
- `docs/openapi/schemas/*.json`

Command operasional:

```bash
bun run openapi:generate
```

Aturan operasional:
1. Ubah file split per fitur, bukan `docs/openapi.json` langsung.
2. Jalankan `bun run openapi:generate` setelah perubahan.
3. Commit file split dan file merged `docs/openapi.json` agar tooling yang membaca file merged tetap sinkron.

## Prisma Workflow

Prisma infra lokal sekarang tersedia, walaupun schema default masih scaffold generik.

Command operasional:

```bash
bun run prisma:generate
bun run prisma:migrate:dev
bun run prisma:seed
bun run prisma:studio
```

Status yang benar saat ini:
- `apps/api/prisma/schema.prisma` masih scaffold generik
- `apps/api/prisma/seed.ts` hanya placeholder
- PostgreSQL lokal sudah tersedia di Docker Compose
- Prisma client bisa digenerate sebagai bagian dari bootstrap

Artinya:
- local database infra sudah siap
- tetapi schema bisnis pertama tetap harus didefinisikan sebelum migrate/seed menjadi meaningful

## Queue and Worker Workflow

Worker saat ini berjalan sebagai scaffold idle:
1. proses worker tetap bisa dijalankan
2. koneksi Redis tetap tersedia untuk fitur queue berikutnya
3. belum ada queue atau job handler aktif secara default

Artinya:
- stack background worker sudah tersedia
- queue pertama perlu ditambahkan saat feature memang membutuhkannya

## Seed Status

Perilaku seed saat ini disengaja: file `apps/api/prisma/seed.ts` hanya menulis pesan placeholder. Tidak ada seed data default yang harus diasumsikan ada.

## CI and Branch Hygiene

Workflow aktif:
- app CI: `.github/workflows/app-ci.yml`
- skill hygiene: `.github/workflows/skills-hygiene.yml`

Ekspektasi sebelum merge:
1. `bun run check` pass lokal.
2. OpenAPI sudah digenerate ulang jika split files berubah.
3. Feature docs dan registry sudah sinkron bila ada feature baru.

## Troubleshooting

### Bootstrap gagal karena Docker belum jalan
- pastikan Docker Desktop / daemon aktif
- jalankan ulang `bun run bootstrap`

### PostgreSQL tidak ready
- cek `bun run stack:ps`
- cek log `bun run stack:logs`
- cek apakah port `5432` sedang dipakai service lain

### Worker gagal start
- pastikan Redis aktif: `bun run stack:ps`
- cek `REDIS_URL` di `apps/worker/.env`
- jalankan ulang `bun run dev:worker`

### OpenAPI gagal merge
- pastikan semua `$ref` menunjuk schema yang ada di `docs/openapi/schemas/`
- jalankan ulang `bun run openapi:generate` untuk melihat error validasi spesifik
