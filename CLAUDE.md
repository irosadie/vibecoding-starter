# Claude Project Instructions

@.agents/AGENTS.md

Claude-compatible skill entries ada di `.claude/skills/`.
Source of truth tetap di `.agents/skills/`.

## Prinsip Tambahan untuk Claude

- **Selalu terapkan best practice terkini** — gunakan pola dan API yang direkomendasikan untuk setiap teknologi (Next.js App Router, Hono, BullMQ, Prisma, React Query, Zod). Jangan pakai cara lama jika sudah ada yang lebih baik.
- **Search web jika tidak yakin** — jika belum tahu cara terbaru, API yang tepat, atau best practice untuk sesuatu, **gunakan WebSearch atau WebFetch sebelum menulis kode**. Lebih baik lambat dan benar daripada cepat tapi salah.
- **Ikuti flow yang sudah ditetapkan** — flow vibe coding ada 6 tahap (PRD → Breakdown → Tiket → Implementasi → Test Scenario → PR). Jangan skip. Urutan implementasi per fitur: Slicing → API Contract → Backend+OpenAPI → Integrasi FE↔API.
- **Baca skill sebelum eksekusi** — setiap task punya skill-nya. Baca `SKILL.md` + `references/context.md` + `templates/checklist.md` sebelum mulai.
- **Patuhi aturan Biome** — sebelum menulis kode, baca `biome.json` di root. Dilarang: `any`, `console.*`, unused variables/imports. Wajib: `const`, double quote, no semicolon. Kode yang kamu tulis harus lolos semua rule ini.

## Start Session

Jika user hanya mengetik `Mulai`, `Start`, `Mulai Vibe Coding`, atau variasi start session lain:
1. Gunakan skill `flow-session-start`
2. Jalankan `bun run session:status`
3. Ringkas status MCP, registry fitur, memory, branch, dan worktree
4. Tentukan apakah ini first init, resume task terakhir, atau siap mulai work baru
5. Ajukan satu pertanyaan next step yang jelas

---

## Skill Registry

<!-- skill-registry:start -->
| Skill | Scope | Kapan Dipakai |
|---|---|---|
| `web-api-integrated` | Frontend | Integrasi endpoint ke frontend dengan schema, types, constants, dan hooks |
| `web-bugfix` | Frontend | Fix bug frontend dengan perubahan minim touch dan sinkronisasi contract yang terdampak |
| `web-code-review` | Frontend | Review kode frontend secara tegas sebelum merge atau saat audit kualitas implementasi |
| `web-seo-geo-friendly` | Frontend | Optimasi SEO dan GEO untuk halaman publik Next.js |
| `web-slicing` | Frontend | Implementasi UI dari desain, screenshot, atau Figma |
| `api-bugfix` | Backend | Fix bug backend dengan perubahan minim touch dan sinkronisasi contract yang terdampak |
| `api-code-review` | Backend | Review kode backend secara tegas sebelum merge atau saat audit kualitas implementasi |
| `api-feature` | Backend | Implementasi fitur backend baru mengikuti Clean Architecture |
| `db-prisma-schema` | Backend | Perubahan `schema.prisma` dan validasi migrasi PostgreSQL |
| `docs-api-contract` | Docs | Menyusun contract API dari PRD, TRD, atau desain |
| `docs-openapi` | Docs | Menulis atau memperbarui dokumentasi OpenAPI split per fitur |
| `ops-docker` | Ops | Menulis atau mengubah Dockerfile backend siap deploy Linux |
| `ops-mcp-setup` | Ops | Setup MCP GitHub, Jira, dan Notion untuk workflow repo ini |
| `flow-breakdown-feature` | Flow | Pecah ide fitur menjadi PRD, TRD, dan registry entry |
| `flow-session-start` | Flow | Onboarding sesi saat user mengetik Mulai, Start, atau Mulai Vibe Coding |
| `flow-task-completion` | Flow | Eksekusi task delivery end-to-end dari ticket sampai PR |
| `flow-test-scenario` | Flow | Susun manual QA scenario dan publish ke Notion/Jira/GitHub |
| `flow-workflow-bootstrap` | Flow | Bootstrap Notion, Jira, dan GitHub issue dari PRD/TRD |
| `meta-skill-hygiene` | Meta | Audit dan hygiene metadata skill di repo ini |
| `skill-add-example` | Meta | Tambah example code yang reusable untuk skill lain |
| `skill-creator` | Meta | Membuat atau memperbarui skill repo ini dengan format yang konsisten |
<!-- skill-registry:end -->
