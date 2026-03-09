# MAIN PRD

Dokumen ini mendefinisikan tujuan produk dari starter ini sebagai konteks global sebelum membuat PRD/TRD per fitur.

## Product Vision

`vibecoding-starter` adalah monorepo starter untuk tim yang ingin membangun produk dengan workflow agent-assisted delivery yang terstruktur. Repo ini harus menyediakan:
- baseline engineering yang hijau secara default
- pola implementasi fitur yang konsisten di web, api, worker, dan docs
- satu sistem agent lokal yang bisa dipakai untuk breakdown, implementasi, integrasi, dan hygiene repo

## Primary Users

- engineer yang ingin memulai produk baru dari monorepo yang sudah punya struktur delivery
- AI coding agent yang membutuhkan aturan, skill, dan contoh implementasi yang konsisten
- tech lead yang ingin memaksa flow dokumen → contract → implementasi → test tetap rapi

## Product Goals

- menyediakan starter monorepo yang bisa langsung dijalankan secara lokal dengan Redis sebagai dependency aktif minimum
- menyediakan baseline kosong yang siap diisi feature pertama tanpa harus membongkar demo bawaan
- menjaga repo tetap `green by default` lewat lint, typecheck, test, build, dan CI
- menjaga `.agents/` sebagai source of truth workflow implementasi berbasis skill

## Non Goals

- bukan template produk yang sudah membawa domain bisnis final
- bukan platform auth lengkap, billing, atau admin panel siap produksi
- bukan template infrastruktur cloud lengkap
- bukan baseline yang mengharuskan database aktif sejak hari pertama

## Constraints

- toolchain utama: Bun, Turbo, Next.js App Router, Hono, BullMQ, Zod, Vitest, Biome
- baseline local stack hanya mengandalkan Redis; PostgreSQL belum aktif secara default
- OpenAPI dikelola dalam format split JSON di `docs/openapi/`
- implementasi frontend wajib melewati hooks transaksi, bukan `fetch` / `axios` langsung di JSX
- implementasi backend mengikuti layering `route -> controller -> service -> use case`

## Success Criteria

- repo bisa dijalankan lokal dengan setup singkat dan instruksi yang akurat
- contributor baru bisa menemukan cara kerja repo tanpa membaca source code terlalu dalam
- feature baru bisa ditambahkan dari nol lewat PRD/TRD dan flow agent tanpa harus membersihkan demo bawaan
- dokumentasi operasional, feature docs, dan source code tidak saling drift
