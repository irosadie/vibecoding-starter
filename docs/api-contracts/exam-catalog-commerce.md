# API Contract: Exam Catalog Commerce

## Base URL
`/api/v1`

## Endpoints

### GET /catalog/exams

List exam products yang dipublish.

**Query Params**
| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| page | number | 1 | halaman aktif |
| perPage | number | 10 | max 100 |
| search | string | — | cari title exam |
| category | string | — | filter category |
| level | string | — | enum: `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |
| sortBy | string | popularity | `popularity`, `price`, `latest` |
| sortDir | string | desc | `asc` / `desc` |

**Response 200**
```json
{
  "list": [
    {
      "id": "uuid",
      "slug": "tes-cpns-intensif-2026",
      "title": "Tes CPNS Intensif 2026",
      "category": "CPNS",
      "level": "INTERMEDIATE",
      "price_amount": 149000,
      "short_description": "Tryout + pembahasan video",
      "thumbnail_url": "https://cdn.example.com/exam-1.jpg",
      "is_owned": false
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
| 422 | VALIDATION | Query param tidak valid |
| 500 | INTERNAL | Internal server error |

---

### GET /catalog/exams/:slug

Ambil detail exam product sebelum checkout.

**Path Params**
| Param | Type | Notes |
| --- | --- | --- |
| slug | string | slug exam product |

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "slug": "tes-cpns-intensif-2026",
    "title": "Tes CPNS Intensif 2026",
    "category": "CPNS",
    "level": "INTERMEDIATE",
    "price_amount": 149000,
    "short_description": "Tryout + pembahasan video",
    "description": "Materi lengkap TWK, TIU, TKP",
    "benefits": [
      "1000+ soal latihan",
      "Video pembahasan",
      "Simulasi waktu ujian"
    ],
    "is_owned": false
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 404 | NOT_FOUND | Exam product tidak ditemukan |
| 500 | INTERNAL | Internal server error |

---

### GET /commerce/cart

Ambil cart aktif user.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "items": [
      {
        "id": "uuid",
        "product_type": "EXAM",
        "product_id": "uuid",
        "title": "Tes CPNS Intensif 2026",
        "price_amount": 149000,
        "quantity": 1,
        "subtotal_amount": 149000
      }
    ],
    "summary": {
      "total_items": 1,
      "subtotal_amount": 149000,
      "discount_amount": 0,
      "grand_total_amount": 149000
    }
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / token invalid |
| 500 | INTERNAL | Internal server error |

---

### POST /commerce/cart/items

Tambah item ke cart.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| product_type | string | ✅ | enum: `EXAM`, `MENTORING_PACKAGE` |
| product_id | string | ✅ | UUID product |
| quantity | number | ❌ | default 1, min 1 |

**Response 201**
```json
{
  "data": {
    "id": "uuid",
    "product_type": "EXAM",
    "product_id": "uuid",
    "quantity": 1
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / token invalid |
| 409 | CONFLICT | Item sudah dimiliki atau sudah ada di cart |
| 422 | VALIDATION | Payload tidak valid |
| 500 | INTERNAL | Internal server error |

---

### DELETE /commerce/cart/items/:id

Hapus item dari cart.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Path Params**
| Param | Type | Notes |
| --- | --- | --- |
| id | string | UUID cart item |

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
| 401 | UNAUTHORIZED | User belum login / token invalid |
| 404 | NOT_FOUND | Cart item tidak ditemukan |
| 500 | INTERNAL | Internal server error |

---

### POST /commerce/checkout

Buat order pending payment dari cart aktif user.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| payment_method | string | ✅ | enum: `BANK_TRANSFER`, `EWALLET`, `VIRTUAL_ACCOUNT` |
| channel_code | string | ✅ | contoh: `BCA`, `OVO` |
| success_redirect_url | string | ❌ | redirect on payment success |
| failure_redirect_url | string | ❌ | redirect on payment failure |

**Response 201**
```json
{
  "data": {
    "order_id": "uuid",
    "status": "PENDING_PAYMENT",
    "total_amount": 149000,
    "payment": {
      "provider": "XENDIT",
      "reference": "inv-001",
      "checkout_url": "https://pay.xendit.co/...",
      "expires_at": "2026-03-14T15:00:00.000Z"
    }
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / token invalid |
| 409 | CONFLICT | Cart kosong / duplicate purchase ditemukan |
| 422 | VALIDATION | Payload tidak valid |
| 500 | INTERNAL | Internal server error |

---

### GET /commerce/orders/:id

Ambil status order by id.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Path Params**
| Param | Type | Notes |
| --- | --- | --- |
| id | string | UUID order |

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "status": "PAID",
    "total_amount": 149000,
    "paid_at": "2026-03-14T12:05:00.000Z",
    "items": [
      {
        "product_type": "EXAM",
        "product_id": "uuid"
      }
    ]
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | User belum login / token invalid |
| 404 | NOT_FOUND | Order tidak ditemukan |
| 500 | INTERNAL | Internal server error |

---

### POST /commerce/payments/webhook/xendit

Webhook callback payment provider.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| x-callback-token | ✅ | secret webhook token |

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| reference_id | string | ✅ | invoice/reference dari provider |
| status | string | ✅ | `PAID`, `FAILED`, `EXPIRED` |
| paid_amount | number | ❌ | nilai payment final |
| paid_at | string | ❌ | ISO datetime |
| raw_payload | object | ✅ | payload asli provider |

**Response 200**
```json
{
  "data": {
    "accepted": true
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | callback token invalid |
| 404 | NOT_FOUND | Order/payment reference tidak ditemukan |
| 409 | CONFLICT | Event duplikat sudah diproses |
| 422 | VALIDATION | Payload callback tidak valid |
| 500 | INTERNAL | Internal server error |
