# vibecoding-starter

Starter monorepo untuk membangun produk dengan **vibe coding** — workflow di mana AI agent (Claude Code / Codex) mengerjakan task implementasi secara end-to-end, mulai dari breakdown fitur sampai PR siap merge.

Repo ini menyediakan dua hal sekaligus:
1. **Starter monorepo** siap pakai (Next.js + Hono + BullMQ + PostgreSQL lokal + Redis lokal)
2. **Agent system** (`.agents/`) berisi skill, guide, dan contoh kode yang dipakai AI agent saat coding

Status repo:
- open source di bawah lisensi [MIT](./LICENSE)
- boleh di-`clone`, di-`fork`, dipakai sebagai baseline project baru, dan di-`contribute` balik lewat pull request
- source of truth workflow agent tetap ada di `.agents/`

## Table of Contents

- [Open Source](#open-source)
- [Apa Yang Sudah Included](#apa-yang-sudah-included)
- [Dokumen Operasional](#dokumen-operasional)
- [Quick Start](#quick-start)
- [Endpoint Penting](#endpoint-penting)
- [OpenAPI dan Scalar](#openapi-dan-scalar)
- [Quality Checks](#quality-checks)
- [Mulai / Start](#mulai--start)
  - [Memanggil Skill Secara Eksplisit](#memanggil-skill-secara-eksplisit)
- [Vibe Coding Flow](#vibe-coding-flow)
- [Mengembangkan Agent System](#mengembangkan-agent-system)
- [MCP Setup](#mcp-setup-untuk-ai-agent)
- [Contributing](#contributing)
- [License](#license)

Stack:
- `apps/web`: Next.js + Tailwind + Vitest
- `apps/api`: Hono (clean architecture) + Prisma scaffold + Vitest
- `apps/worker`: Worker scaffold + Redis + Vitest
- `docker-compose.yml`: PostgreSQL + Redis untuk local development
- `scripts/`: helper executable tingkat repo untuk bootstrap dan workflow operasional
- `Turbo` untuk task orchestration
- `Bun` untuk package manager dan script runner
- `Biome` untuk lint/format

## Open Source

Repo ini memang ditujukan untuk dipakai publik:
- boleh `clone` repo ini dan langsung pakai sebagai baseline project baru
- boleh `fork` untuk versi internal atau custom workflow sendiri
- boleh buka issue atau pull request untuk perbaikan, cleanup, atau fitur baru
- lisensi repo ini adalah **MIT**, jadi penggunaan komersial maupun non-komersial diperbolehkan selama notice lisensi dipertahankan

## Apa Yang Sudah Included

### Monorepo Runtime
- `apps/web` untuk frontend Next.js App Router
- `apps/api` untuk backend Hono dengan layering clean architecture
- `apps/worker` untuk background worker berbasis Redis
- `docker-compose.yml` untuk PostgreSQL + Redis lokal
- `scripts/bootstrap-local.sh`, `scripts/compose.sh`, dan helper repo-level lain untuk bootstrap environment

### Frontend Starter
- baseline halaman App Router yang sudah jalan
- `NextAuth` auth foundation berbasis credentials di `apps/web/auth.ts`
- route handler auth App Router di `apps/web/app/api/(auth)/auth/[...nextauth]/route.ts`
- BFF proxy internal di `apps/web/app/api/proxy/[...path]/route.ts` untuk forward request web ke backend
- starter login page `/login` dan protected starter panel `/panel`
- route protection dan redirect dasar via `apps/web/proxy.ts`
- `SessionProvider` dan `QueryProvider`
- query client service dan axios interceptors yang default-nya hit internal proxy `/api/proxy`
- constants baseline untuk API router dan query keys
- utility hooks: `useQueryParam`, `useNetworkInfo`, `useUserAgent`
- utility helpers: `cn`, `objectToForm`, dan `rbacFilterMenu`
- general frontend types untuk App Router, data table, dan NextAuth augmentation
- UI kit reusable yang sudah cukup besar, termasuk:
  - action dropdown, autocomplete, avatar, breadcrumb
  - button, input, textarea, select, radio, radio-group, datepicker, file upload
  - currency input, currency select, currency display, content title
  - dialog, drawer, dropdown, menubar, tabs
  - table, pagination, status badge, stat card, panel card, panel context, search toolbar
  - text editor, map, route card, stepper, loading spinner, loading overlay, content loading, display with skeleton, empty state, user menu

### Backend Starter
- entrypoint API baseline dengan endpoint `/` dan `/health`
- service + use case baseline untuk system info dan health check
- controller, route, dan test baseline untuk system endpoint
- `DomainError` foundation untuk error handling domain
- env config terpisah di `infrastructure/config`
- middleware foundation untuk JWT, advanced auth, validation, dan centralized error handling
- util HTTP response/query parser dan helper OpenAPI merge
- domain service skeleton untuk token dan storage
- util JWT / token blacklist foundation untuk feature auth berikutnya
- example use case test scaffold untuk pattern backend baru
- Prisma scaffold dan database config siap dikembangkan

### Worker Starter
- worker entrypoint yang sudah connect ke Redis
- summary use case untuk mode idle/active worker
- env config terpisah di `infrastructure/config`
- queue bootstrap minimal untuk menyalakan worker pertama tanpa feature bisnis

### Shared Packages
- `packages/schemas` untuk Zod schema shared, termasuk auth/login starter
- `packages/types` untuk shared response types baseline (`success`, `error`, dan auth response starter)
- `packages/utils` untuk pure utility functions shared lintas app

Utility yang sudah ada di `packages/utils`:
- currency format
- date range
- debounce
- enum to object
- string generator
- masking
- number helpers
- path variable
- point converter
- time helpers
- to-camel-case

### Docs dan DevEx
- `docs/MAIN_PRD.md` sebagai konteks produk starter
- `docs/features/REGISTRY.md` sebagai registry fitur
- template `PRD.md` dan `TRD.md`
- `docs/api-contracts/` untuk contract FE-BE
- OpenAPI split source di `docs/openapi/`
- merged OpenAPI spec di `docs/openapi.json`
- config [Scalar](https://scalar.com/) di `apps/api/scalar.config.json` yang menunjuk ke merged spec repo ini
- GitHub Actions untuk app CI dan skill hygiene

### Agent Workflow
- onboarding session via `bun run session:status`
- flow breakdown → workflow bootstrap → implementasi → test scenario
- skill registry dan entrypoint agent di `.agents/AGENTS.md`
- source of truth skill di `.agents/skills/`
- examples reusable di `.agents/examples/`
- wrapper Claude yang di-generate dari source of truth skill

## Dokumen Operasional
- Operasional harian: `docs/OPERATIONS.md`
- Konteks produk starter: `docs/MAIN_PRD.md`
- Registry fitur: `docs/features/REGISTRY.md`
- Template PRD/TRD: `docs/templates/`

## Quick Start

Prasyarat:
- Bun `>= 1.3`
- Docker

```bash
bun install
bun run bootstrap
bun run dev
```

Perintah `bun run bootstrap` akan:
- copy `.env.example` menjadi `.env` jika belum ada
- menyalakan PostgreSQL dan Redis
- menunggu service siap
- generate Prisma client
- generate merged OpenAPI spec

Perintah harian lain:
```bash
bun run stack:up
bun run stack:down
bun run stack:logs
bun run session:status
bun run prisma:generate
bun run prisma:migrate:dev
bun run prisma:studio
bun run openapi:generate
```

## Endpoint Penting
- Web: `http://localhost:3000`
- Web login: `http://localhost:3000/login`
- Web panel: `http://localhost:3000/panel`
- Web auth route: `http://localhost:3000/api/auth/*`
- Web internal proxy: `http://localhost:3000/api/proxy/*`
- API root: `http://localhost:3001/`
- API health: `http://localhost:3001/health`
- Prisma Studio: `http://localhost:5555`
- Merged OpenAPI spec: `docs/openapi.json`
- Scalar config source: `apps/api/scalar.config.json`

Dokumen awal yang perlu dilihat:
- `docs/MAIN_PRD.md`
- `docs/features/REGISTRY.md`
- `docs/templates/PRD.md`
- `docs/templates/TRD.md`

## OpenAPI dan Scalar

Workflow OpenAPI di repo ini sudah siap untuk tooling docs:
- source of truth split JSON ada di `docs/openapi/base.json`, `docs/openapi/paths/*.json`, dan `docs/openapi/schemas/*.json`
- merged artifact ada di `docs/openapi.json`
- generator merge dijalankan lewat `bun run openapi:generate`
- config Scalar ada di `apps/api/scalar.config.json`

Artinya:
- Anda tidak perlu edit `docs/openapi.json` langsung
- update spec dilakukan di folder split `docs/openapi/`
- setelah itu generate ulang merged spec
- file merged tersebut sudah siap dipakai oleh Scalar karena config repo menunjuk ke `./docs/openapi.json`

## Quality Checks

```bash
bun run check
```

Perintah parsial:
```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

Generate merged OpenAPI spec:
```bash
bun run openapi:generate
```

## Mulai / Start

Cukup ketik **"Mulai"**, **"Start"**, atau **"Mulai Vibe Coding"** di Claude Code atau Codex.

Agent akan melakukan quick check terlebih dulu:
- cek MCP repo-level (`.mcp.json`) dan service yang masih missing
- cek registry fitur (`docs/features/REGISTRY.md`)
- cek memory project (`.agents/MEMORY.md`)
- cek branch aktif dan apakah ada pekerjaan yang belum selesai

Lalu agent akan mengarahkan sesi ke salah satu jalur:
- setup MCP dulu
- lanjut task terakhir
- mulai breakdown fitur baru

Jika ingin menjalankan quick check yang sama secara manual:

```bash
bun run session:status
```

### Memanggil Skill Secara Eksplisit

Skill bisa dipanggil secara langsung tanpa harus tahu nama perintahnya — tapi jika ingin kontrol penuh:

**Claude Code** — gunakan prefix `/`:
```
/web-slicing
/api-feature
/flow-breakdown-feature
```

**Codex** — gunakan prefix `$`:
```
$web-slicing
$api-feature
$flow-breakdown-feature
```

Daftar semua skill tersedia di `.agents/AGENTS.md` pada section `Skill Registry`.

---

## Mengembangkan Agent System

### Membuat Skill Baru

Gunakan skill `skill-creator` untuk menambahkan capability baru ke agent system.

**Claude:** `/skill-creator` &nbsp;|&nbsp; **Codex:** `$skill-creator`

Atau jalankan generator langsung:

```bash
bun run skills:create -- \
  --name {scope}-{capability} \
  --scope {scope} \
  --description "{Deskripsi satu kalimat}" \
  --when "{Kapan dipakai}"
```

Generator akan membuat struktur lengkap:

```
.agents/skills/{name}/
├── SKILL.md                → Definisi + alur kerja + larangan + checklist
├── references/context.md   → Folder target + contoh kode + pattern
├── templates/checklist.md  → Checklist step-by-step eksekusi
└── agents/openai.yaml      → Metadata Codex/OpenAI
.claude/skills/{name}/
└── SKILL.md                → Wrapper Claude (auto-generated)
```

Setelah membuat atau mengubah skill, jalankan:

```bash
bun run skills:sync      # sinkronkan Claude wrapper dari source of truth
bun run skills:validate  # validasi semua skill assets
```

### Menambah Training Data / Contoh Kode

Gunakan skill `skill-add-example` untuk menambahkan contoh kode nyata sebagai referensi agent.

**Claude:** `/skill-add-example` &nbsp;|&nbsp; **Codex:** `$skill-add-example`

Contoh kode disimpan di `.agents/examples/` dengan struktur:

```
.agents/examples/
└── {skill-name}/
    └── {framework-atau-konteks}/
        └── {nama-example}/
            ├── page.tsx
            └── hooks/
```

Setiap example yang ditambahkan wajib direferensikan di `references/context.md` skill terkait, agar agent bisa menemukannya saat mengeksekusi task.

---

## Vibe Coding Flow

Cara kerja pengembangan fitur di repo ini menggunakan AI agent. Setiap tahap dipandu oleh **skill** — instruksi terstruktur yang dibaca agent sebelum mengeksekusi task.

### Tahap 1 — Breakdown Fitur

> Skill: `flow-breakdown-feature`

Ubah ide fitur menjadi dokumen PRD dan TRD yang siap dieksekusi.

```
Trigger: "Buat breakdown fitur [nama fitur]"
Output:  docs/features/{slug}/PRD.md
         docs/features/{slug}/TRD.md
         docs/features/REGISTRY.md (entry baru)
```

PRD berisi: problem, goals, non-goals, user stories, acceptance criteria.
TRD berisi: data model, API contract overview, task breakdown per tiket.

---

### Tahap 2 — Buat Tiket & Issue

> Skill: `flow-workflow-bootstrap`
> Prasyarat: PRD + TRD sudah ada, MCP GitHub + Jira + Notion aktif

Dari TRD, agent secara otomatis membuat:
- Halaman PRD di **Notion**
- 3 tiket **Jira** (Story):
  - Tiket 1: Slicing + API Contract
  - Tiket 2: Backend Implementation
  - Tiket 3: API Integration (FE)
- **GitHub Issues** di monorepo ini, masing-masing linked ke tiket Jira
- Update `REGISTRY.md` dengan semua link

```
Trigger: "Jalankan workflow bootstrap untuk fitur [slug]"
```

---

### Tahap 3 — Implementasi (per tiket)

Setiap tiket dikerjakan dengan skill `flow-task-completion` yang di dalamnya memanggil skill implementasi sesuai tipe task.

Urutan pengerjaan per fitur:

#### 3a. Slicing FE
> Skill di dalam: `web-slicing`

Implementasi UI dari desain/deskripsi — belum ada data real, pakai dummy.

```
Target: apps/web/app/(group)/[feature]/
Output: page.tsx + [feature]-content.tsx
```

#### 3b. API Contract
> Skill di dalam: `docs-api-contract`

Susun contract endpoint lengkap: method, URL, request body, response schema, error codes.

```
Target: docs/api-contracts/
```

#### 3c. Backend + OpenAPI
> Skill di dalam: `api-feature` + `docs-openapi`

Implementasi Clean Architecture di Hono: entity → use case → repository → controller → route.
Sekaligus tulis dokumentasi OpenAPI split per fitur.

```
Target: apps/api/src/
         docs/openapi/
```

#### 3d. Integrasi FE ↔ API
> Skill di dalam: `web-api-integrated`

Buat Zod schema, response types, constants, dan react-query hooks. Hubungkan UI yang sudah di-slicing ke API yang sudah jadi.

```
Target: packages/schemas/
         packages/types/
         apps/web/hooks/transactions/use-{domain}/
         apps/web/constants/
```

## MCP Setup Untuk AI Agent

MCP yang diwajibkan repo ini:
- `github`
- `atlassian`
- `notion`

Konfigurasinya dibaca dari `.mcp.json` di root repo. File ini sengaja di-ignore karena harus berisi token/credential project asli.

Kalau baru clone repo ini, urutan yang benar:
1. siapkan `.mcp.json`
2. isi `.agents/settings.json` untuk `repo.owner` dan `jira.projectKey`
3. jalankan `bun run session:status`
4. mulai flow dari breakdown atau resume task aktif

## Contributing

Kontribusi terbuka.

Alur minimum yang disarankan:
1. `fork` repo ini atau buat branch baru dari `main`
2. jalankan `bun install`
3. jalankan `bun run bootstrap`
4. lakukan perubahan
5. pastikan `bun run check` pass
6. kalau menyentuh skill / `.agents`, jalankan juga `bun run skills:sync` dan `bun run skills:validate`
7. buka pull request

Untuk perubahan dokumentasi OpenAPI:
1. edit file split di `docs/openapi/`
2. jalankan `bun run openapi:generate`
3. commit file split dan `docs/openapi.json`

Untuk perubahan skill:
1. ubah source of truth di `.agents/skills/*`
2. jalankan `bun run skills:sync`
3. validasi dengan `bun run skills:validate`

## License

Repo ini menggunakan lisensi [MIT](./LICENSE).
