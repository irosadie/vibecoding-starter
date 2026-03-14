# TRD: Creator Application

- Feature ID: FT-002
- Slug: creator-application
- Status: Planned
- Area: Creator

## Data Model

### Table: creator_applications
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| user_id | UUID | FK -> users.id |
| ktp_file_url | TEXT | uploaded KTP asset |
| payout_account_name | VARCHAR(255) | account owner |
| payout_bank_name | VARCHAR(100) | bank name |
| payout_account_number | VARCHAR(100) | bank account number |
| status | ENUM | `PENDING`, `APPROVED`, `REJECTED` |
| submitted_at | TIMESTAMP | submission timestamp |
| reviewed_by | UUID | nullable FK -> users.id |
| reviewed_at | TIMESTAMP | nullable |
| review_note | TEXT | nullable |

### Table: creator_profiles
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| user_id | UUID | unique FK -> users.id |
| payout_account_name | VARCHAR(255) | active payout data |
| payout_bank_name | VARCHAR(100) | active payout data |
| payout_account_number | VARCHAR(100) | active payout data |
| approved_at | TIMESTAMP | creator activation time |
| created_at | TIMESTAMP | audit field |

## API Contract Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /creator-applications | Submit pengajuan creator baru |
| GET | /creator-applications/me | Ambil status pengajuan milik user aktif |
| GET | /admin/creator-applications | List pengajuan creator untuk admin |
| POST | /admin/creator-applications/:id/approve | Approve pengajuan creator |
| POST | /admin/creator-applications/:id/reject | Reject pengajuan creator |

## Task Breakdown

### Slicing & API Contract
- [x] Halaman apply creator dengan form payout dan upload `KTP`
- [x] Halaman status pengajuan creator untuk user
- [x] Halaman admin review creator applications
- [x] API contract untuk submit, detail status, approve, dan reject

### Backend
- [ ] Entity dan repository creator application + creator profile
- [ ] Use case submit application, approve application, reject application
- [ ] File handling untuk asset `KTP`
- [ ] Role upgrade user ke creator saat approve

### Integrasi
- [ ] Shared schema untuk form pengajuan creator
- [ ] Shared response type untuk application status dan review list
- [ ] Hook frontend untuk submit application dan admin review actions
- [ ] Integrasi gate creator dashboard berdasarkan approval status
