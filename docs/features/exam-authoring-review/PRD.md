# PRD: Exam Authoring Review

- Feature ID: FT-004
- Slug: exam-authoring-review
- Status: In Progress
- Area: Creator

## Problem Statement

Creator belum punya authoring workflow yang jelas untuk membuat, mengedit, dan submit ujian ke admin review.
Admin juga belum punya review queue terstruktur untuk approve/reject versi ujian sebelum publish.

## Goals

- Menyediakan dashboard creator untuk daftar draft, create draft, dan lanjut edit.
- Menyediakan editor metadata ujian + editor soal pilihan ganda dalam satu flow.
- Menyediakan admin review queue untuk approve/reject versi ujian.
- Menjaga proses publish lewat review gate agar kualitas konten tetap terkontrol.

## Non-Goals

- Tidak membangun analytics performa soal.
- Tidak membangun bank soal lintas exam dengan tagging kompleks.
- Tidak membangun workflow import bulk dari CSV/Excel di fase ini.

## Personas

- Creator: menulis metadata + soal, lalu submit untuk direview.
- Admin Reviewer: memeriksa submission, approve atau reject dengan catatan.
- Buyer/User: hanya menerima versi ujian yang sudah published (indirect impact).

## User Stories

1. Sebagai creator, saya bisa melihat semua draft ujian saya dan status review terakhir.
2. Sebagai creator, saya bisa mengedit metadata dan soal pilihan ganda sebelum submit review.
3. Sebagai creator, saya bisa submit satu versi draft ke admin review.
4. Sebagai admin, saya bisa melihat queue submission yang menunggu review.
5. Sebagai admin, saya bisa approve atau reject submission dengan review note.

## Functional Requirements

1. Creator dashboard menampilkan daftar draft exam dengan status (`DRAFT`, `IN_REVIEW`, `NEEDS_REVISION`, `PUBLISHED`).
2. Creator dapat membuat draft baru dan membuka editor draft.
3. Exam editor menyediakan form metadata (title, category, level, duration, deskripsi) dan editor soal MCQ (prompt, opsi, jawaban benar, pembahasan).
4. Creator dapat submit draft ke review queue.
5. Admin review queue menampilkan submission pending dengan detail versi dan ringkasan soal.
6. Admin bisa approve atau reject submission; reject wajib menyimpan review note.
7. Setelah approved, versi siap menjadi kandidat published version.

## Success Metrics

- Waktu rata-rata dari create draft ke submit review.
- Rasio approve vs reject pada submission.
- Jumlah revision loop sebelum publish.

## Acceptance Criteria

1. Halaman creator dashboard, exam editor, dan admin review queue tersedia di web.
2. API contract authoring-review terdokumentasi untuk draft CRUD, question CRUD, submit review, approve, reject.
3. Flow review menampilkan status dan review feedback dengan jelas.
