# TRD: Exam Authoring Review

- Feature ID: FT-004
- Slug: exam-authoring-review
- Status: In Progress
- Area: Creator

## Data Model (Ringkas)

### `exams`
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| creator_id | UUID | FK -> users.id |
| slug | VARCHAR | unique slug |
| title | VARCHAR | exam title |
| category | VARCHAR | category label |
| level | ENUM | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |
| current_status | ENUM | `DRAFT`, `IN_REVIEW`, `NEEDS_REVISION`, `PUBLISHED` |

### `exam_versions`
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| exam_id | UUID | FK -> exams.id |
| version_number | INTEGER | increment per submit |
| metadata_snapshot | JSONB | snapshot metadata untuk version ini |
| status | ENUM | `IN_REVIEW`, `APPROVED`, `REJECTED`, `PUBLISHED` |
| submitted_at | TIMESTAMP | waktu submit review |
| reviewed_by | UUID | nullable FK -> users.id |
| reviewed_at | TIMESTAMP | nullable |
| review_note | TEXT | nullable |

### `exam_questions`
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| exam_version_id | UUID | FK -> exam_versions.id |
| order_number | INTEGER | urutan soal |
| prompt | TEXT | pertanyaan |
| option_a | TEXT | opsi A |
| option_b | TEXT | opsi B |
| option_c | TEXT | opsi C |
| option_d | TEXT | opsi D |
| correct_option | ENUM | `A`, `B`, `C`, `D` |
| explanation_text | TEXT | pembahasan |
| explanation_video_url | TEXT | optional |

### `exam_review_logs`
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| exam_version_id | UUID | FK -> exam_versions.id |
| actor_id | UUID | reviewer/admin |
| action | ENUM | `SUBMITTED`, `APPROVED`, `REJECTED` |
| note | TEXT | optional note |
| created_at | TIMESTAMP | audit timestamp |

## API Contract Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /creator/exams | List draft exam milik creator |
| POST | /creator/exams | Create exam draft baru |
| GET | /creator/exams/:id | Ambil detail draft exam |
| PUT | /creator/exams/:id | Update metadata draft exam |
| POST | /creator/exams/:id/questions | Tambah soal MCQ ke draft |
| PUT | /creator/exams/:id/questions/:questionId | Update soal MCQ |
| DELETE | /creator/exams/:id/questions/:questionId | Hapus soal MCQ |
| POST | /creator/exams/:id/submit-review | Submit draft ke review queue |
| GET | /admin/exam-reviews | List queue review admin |
| GET | /admin/exam-reviews/:id | Detail submission review |
| POST | /admin/exam-reviews/:id/approve | Approve submission |
| POST | /admin/exam-reviews/:id/reject | Reject submission |

## Task Breakdown

### Slicing + Contract
- [x] Dashboard creator untuk daftar, create, dan edit draft ujian
- [x] Editor metadata ujian dan editor soal pilihan ganda
- [x] Halaman admin review queue untuk approve/reject versi ujian
- [x] API contract authoring, submit review, approve, reject

### Backend
- [ ] Entity + repository exam, exam version, question, review log
- [ ] Use case create/update draft, submit review, approve, reject
- [ ] Snapshot versioning rule untuk buyer lama vs publish baru
- [ ] Validasi minimal satu jenis pembahasan aktif sebelum submit review

### Integrasi FE
- [ ] Shared schema metadata exam + payload question
- [ ] Shared response type draft exam, review queue, published version
- [ ] Hook draft CRUD, question CRUD, review actions
- [ ] Wiring feedback review dan preview publish state
