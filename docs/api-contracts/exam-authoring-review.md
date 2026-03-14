# API Contract: Exam Authoring Review

## Base URL
`/api/v1`

## Endpoints

### GET /creator/exams

List exam draft milik creator (paginated).

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Query Params**
| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| page | number | 1 | halaman aktif |
| perPage | number | 10 | max 100 |
| search | string | — | filter judul draft |
| status | string | — | enum: `DRAFT`, `IN_REVIEW`, `NEEDS_REVISION`, `PUBLISHED` |

**Response 200**
```json
{
  "list": [
    {
      "id": "uuid",
      "title": "Tryout CPNS Paket 1",
      "category": "CPNS",
      "level": "INTERMEDIATE",
      "status": "DRAFT",
      "question_count": 45,
      "updated_at": "2026-03-14T08:30:00.000Z",
      "version_label": "v0.7"
    }
  ],
  "meta": {
    "pagination": {
      "total": 1,
      "currentPage": 1,
      "perPage": 10,
      "lastPage": 1
    },
    "cursor": null
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / role tidak sesuai |
| 422 | VALIDATION | Query param tidak valid |
| 500 | INTERNAL | Internal server error |

---

### POST /creator/exams

Create exam draft baru.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| title | string | ✅ | judul exam |
| category | string | ✅ | kategori |
| level | string | ✅ | enum: `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |
| short_description | string | ✅ | deskripsi ringkas |
| description | string | ✅ | deskripsi lengkap |
| duration_minutes | number | ✅ | durasi exam |

**Response 201**
```json
{
  "data": {
    "id": "uuid",
    "title": "Tryout CPNS Paket 1",
    "status": "DRAFT",
    "version_label": "v0.1"
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / role tidak sesuai |
| 422 | VALIDATION | Payload tidak valid |
| 500 | INTERNAL | Internal server error |

---

### GET /creator/exams/:id

Ambil detail draft exam beserta question list aktif.

**Path Params**
| Param | Type | Notes |
| --- | --- | --- |
| id | string | UUID exam draft |

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "title": "Tryout CPNS Paket 1",
    "category": "CPNS",
    "level": "INTERMEDIATE",
    "short_description": "Ringkasan exam",
    "description": "Penjelasan lengkap exam",
    "duration_minutes": 90,
    "status": "DRAFT",
    "questions": [
      {
        "id": "uuid",
        "order_number": 1,
        "prompt": "...",
        "options": {
          "A": "...",
          "B": "...",
          "C": "...",
          "D": "..."
        },
        "correct_option": "B",
        "explanation_text": "...",
        "explanation_video_url": null
      }
    ]
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / role tidak sesuai |
| 404 | NOT_FOUND | Draft exam tidak ditemukan |
| 500 | INTERNAL | Internal server error |

---

### PUT /creator/exams/:id

Update metadata draft exam.

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| title | string | ❌ | optional update |
| category | string | ❌ | optional update |
| level | string | ❌ | enum: `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |
| short_description | string | ❌ | optional update |
| description | string | ❌ | optional update |
| duration_minutes | number | ❌ | optional update |

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "updated": true
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / role tidak sesuai |
| 404 | NOT_FOUND | Draft exam tidak ditemukan |
| 422 | VALIDATION | Payload tidak valid |
| 500 | INTERNAL | Internal server error |

---

### POST /creator/exams/:id/questions

Tambah soal MCQ ke draft.

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| prompt | string | ✅ | pertanyaan |
| option_a | string | ✅ | opsi A |
| option_b | string | ✅ | opsi B |
| option_c | string | ✅ | opsi C |
| option_d | string | ✅ | opsi D |
| correct_option | string | ✅ | enum: `A`, `B`, `C`, `D` |
| explanation_text | string | ❌ | pembahasan text |
| explanation_video_url | string | ❌ | URL video pembahasan |

**Response 201**
```json
{
  "data": {
    "id": "uuid",
    "order_number": 12
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / role tidak sesuai |
| 404 | NOT_FOUND | Draft exam tidak ditemukan |
| 422 | VALIDATION | Payload tidak valid |
| 500 | INTERNAL | Internal server error |

---

### PUT /creator/exams/:id/questions/:questionId

Update soal MCQ pada draft.

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "updated": true
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / role tidak sesuai |
| 404 | NOT_FOUND | Soal atau draft tidak ditemukan |
| 422 | VALIDATION | Payload tidak valid |
| 500 | INTERNAL | Internal server error |

---

### DELETE /creator/exams/:id/questions/:questionId

Hapus soal dari draft.

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "removed": true
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / role tidak sesuai |
| 404 | NOT_FOUND | Soal atau draft tidak ditemukan |
| 500 | INTERNAL | Internal server error |

---

### POST /creator/exams/:id/submit-review

Submit draft ke admin review queue.

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| submit_note | string | ❌ | catatan dari creator |

**Response 200**
```json
{
  "data": {
    "exam_id": "uuid",
    "version_id": "uuid",
    "status": "IN_REVIEW"
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / role tidak sesuai |
| 404 | NOT_FOUND | Draft exam tidak ditemukan |
| 409 | CONFLICT | Draft sudah dalam review |
| 422 | VALIDATION | Minimal satu tipe pembahasan harus ada |
| 500 | INTERNAL | Internal server error |

---

### GET /admin/exam-reviews

List queue review untuk admin.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Query Params**
| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| page | number | 1 | halaman aktif |
| perPage | number | 10 | max 100 |
| search | string | — | filter judul exam / creator |
| status | string | `PENDING_REVIEW` | enum: `PENDING_REVIEW`, `APPROVED`, `REJECTED` |

**Response 200**
```json
{
  "list": [
    {
      "id": "uuid",
      "exam_title": "Tryout CPNS Paket 1",
      "creator_name": "Arga Saputra",
      "version_label": "v1.0",
      "submitted_at": "2026-03-14T07:20:00.000Z",
      "status": "PENDING_REVIEW"
    }
  ],
  "meta": {
    "pagination": {
      "total": 1,
      "currentPage": 1,
      "perPage": 10,
      "lastPage": 1
    },
    "cursor": null
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / role tidak sesuai |
| 500 | INTERNAL | Internal server error |

---

### POST /admin/exam-reviews/:id/approve

Approve submission review.

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| review_note | string | ❌ | optional note |

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "status": "APPROVED"
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / role tidak sesuai |
| 404 | NOT_FOUND | Submission review tidak ditemukan |
| 409 | CONFLICT | Submission sudah final |
| 500 | INTERNAL | Internal server error |

---

### POST /admin/exam-reviews/:id/reject

Reject submission review.

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| review_note | string | ✅ | minimal 3 karakter |

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "status": "REJECTED"
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / role tidak sesuai |
| 404 | NOT_FOUND | Submission review tidak ditemukan |
| 409 | CONFLICT | Submission sudah final |
| 422 | VALIDATION | `review_note` tidak valid |
| 500 | INTERNAL | Internal server error |
