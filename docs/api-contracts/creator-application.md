# API Contract: Creator Application

## Base URL
`/api/v1`

## Endpoints

### POST /creator-applications

Submit pengajuan creator baru oleh user login.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |
| Content-Type | ✅ | `multipart/form-data` |

**Request Body (multipart/form-data)**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| payout_account_name | string | ✅ | 1-255 karakter |
| payout_bank_name | string | ✅ | 1-100 karakter |
| payout_account_number | string | ✅ | 6-50 karakter |
| ktp_file | binary | ✅ | image/pdf max size mengikuti policy storage |

**Response 201**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "ktp_file_url": "https://storage.example.com/ktp/ca-0001.jpg",
    "payout_account_name": "Imron Rosadie",
    "payout_bank_name": "BCA",
    "payout_account_number": "1234567890",
    "status": "PENDING",
    "submitted_at": "2026-03-14T08:20:00.000Z",
    "reviewed_by": null,
    "reviewed_at": null,
    "review_note": null
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / token invalid |
| 409 | CONFLICT | Masih ada pengajuan `PENDING` yang belum selesai |
| 422 | VALIDATION | Payload tidak valid atau file `ktp_file` tidak ada |
| 500 | INTERNAL | Internal server error |

---

### GET /creator-applications/me

Ambil status pengajuan creator milik user aktif.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Response 200**
```json
{
  "data": {
    "application": {
      "id": "uuid",
      "status": "PENDING",
      "submitted_at": "2026-03-14T08:20:00.000Z",
      "reviewed_at": null,
      "review_note": null,
      "payout_account_name": "Imron Rosadie",
      "payout_bank_name": "BCA",
      "payout_account_number": "1234567890",
      "ktp_file_url": "https://storage.example.com/ktp/ca-0001.jpg"
    }
  }
}
```

**Response 200 (Belum pernah apply)**
```json
{
  "data": {
    "application": null
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / token invalid |
| 500 | INTERNAL | Internal server error |

---

### GET /admin/creator-applications

List pengajuan creator untuk admin (paginated).

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Query Params**
| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| page | number | 1 | halaman aktif |
| perPage | number | 10 | max 100 |
| search | string | — | filter nama/email applicant |
| status | string | — | enum: `PENDING`, `APPROVED`, `REJECTED` |

**Response 200**
```json
{
  "list": [
    {
      "id": "uuid",
      "applicant": {
        "id": "uuid",
        "name": "Imron Rosadie",
        "email": "imronrosadie@gmail.com"
      },
      "status": "PENDING",
      "submitted_at": "2026-03-14T08:20:00.000Z",
      "reviewed_at": null,
      "review_note": null,
      "payout_bank_name": "BCA",
      "payout_account_number": "1234567890",
      "ktp_file_url": "https://storage.example.com/ktp/ca-0001.jpg"
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
| 401 | UNAUTHORIZED | User belum login / token invalid |
| 403 | FORBIDDEN | User bukan admin |
| 422 | VALIDATION | Query param tidak valid |
| 500 | INTERNAL | Internal server error |

---

### POST /admin/creator-applications/:id/approve

Approve pengajuan creator dan aktivasi role user menjadi `CREATOR`.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Path Params**
| Param | Type | Notes |
| --- | --- | --- |
| id | string | UUID creator application |

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| review_note | string | ❌ | optional catatan internal admin |

**Response 200**
```json
{
  "data": {
    "application": {
      "id": "uuid",
      "status": "APPROVED",
      "reviewed_at": "2026-03-14T11:10:00.000Z",
      "review_note": "Dokumen valid"
    },
    "promoted_user": {
      "id": "uuid",
      "role": "CREATOR"
    }
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / token invalid |
| 403 | FORBIDDEN | User bukan admin |
| 404 | NOT_FOUND | Application id tidak ditemukan |
| 409 | CONFLICT | Application sudah direview sebelumnya |
| 422 | VALIDATION | Payload tidak valid |
| 500 | INTERNAL | Internal server error |

---

### POST /admin/creator-applications/:id/reject

Reject pengajuan creator dengan catatan review.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Path Params**
| Param | Type | Notes |
| --- | --- | --- |
| id | string | UUID creator application |

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| review_note | string | ✅ | alasan reject, min 3 karakter |

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "status": "REJECTED",
    "reviewed_at": "2026-03-14T11:30:00.000Z",
    "review_note": "Foto KTP blur, mohon upload ulang."
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / token invalid |
| 403 | FORBIDDEN | User bukan admin |
| 404 | NOT_FOUND | Application id tidak ditemukan |
| 409 | CONFLICT | Application sudah direview sebelumnya |
| 422 | VALIDATION | `review_note` tidak valid |
| 500 | INTERNAL | Internal server error |

## Enum

### `creator_application_status`
- `PENDING`
- `APPROVED`
- `REJECTED`
